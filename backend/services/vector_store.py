import asyncio
from functools import lru_cache

import chromadb
from sentence_transformers import SentenceTransformer

EMBED_MODEL = "all-MiniLM-L6-v2"
EMBED_BATCH = 64

_client = chromadb.Client()  # in-memory, session-scoped


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    """Load the embedding model once and cache it for the process lifetime."""
    return SentenceTransformer(EMBED_MODEL)


def _collection(session_id: str) -> chromadb.Collection:
    return _client.get_or_create_collection(name=f"session_{session_id}")


async def embed_and_store(chunks: list[dict], session_id: str) -> None:
    """Embed chunks in batches and upsert into the session collection."""
    col = _collection(session_id)
    loop = asyncio.get_running_loop()
    model = _get_model()

    for i in range(0, len(chunks), EMBED_BATCH):
        batch = chunks[i : i + EMBED_BATCH]
        texts = [c["text"] for c in batch]

        embeddings = await loop.run_in_executor(
            None, lambda t=texts: model.encode(t, convert_to_numpy=True).tolist()
        )

        col.upsert(
            ids=[f"{c['video_id']}_{c['chunk_index']}" for c in batch],
            documents=texts,
            embeddings=embeddings,
            metadatas=[
                {
                    "video_id": c["video_id"],
                    "start_time": c["start_time"],
                    "end_time": c["end_time"],
                    "chunk_index": c["chunk_index"],
                }
                for c in batch
            ],
        )


async def retrieve(
    query: str,
    session_id: str,
    n_results: int = 8,
    video_id_filter: str | None = None,
) -> list[dict]:
    """
    Embed query and return the top-n most relevant chunks.
    Optionally filter to a single video.
    """
    col = _collection(session_id)

    if col.count() == 0:
        return []

    loop = asyncio.get_running_loop()
    model = _get_model()
    query_embedding = await loop.run_in_executor(
        None, lambda: model.encode([query], convert_to_numpy=True).tolist()[0]
    )

    where = {"video_id": video_id_filter} if video_id_filter else None

    results = col.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, col.count()),
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append(
            {
                "text": doc,
                "video_id": meta["video_id"],
                "start_time": meta["start_time"],
                "end_time": meta["end_time"],
                "chunk_index": meta["chunk_index"],
                "distance": dist,
            }
        )

    return chunks


def delete_session(session_id: str) -> None:
    try:
        _client.delete_collection(name=f"session_{session_id}")
    except Exception:
        pass
