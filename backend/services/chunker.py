CHUNK_SIZE = 5    # number of transcript segments per chunk
OVERLAP = 1       # segments to overlap between adjacent chunks


def chunk_transcript(segments: list[dict], video_id: str) -> list[dict]:
    """
    Group transcript segments into overlapping chunks.
    Each chunk preserves the source video_id and timestamp range.

    Returns a list of:
        {
            "text": str,
            "video_id": str,
            "start_time": float,
            "end_time": float,
            "chunk_index": int,
        }
    """
    chunks = []
    step = CHUNK_SIZE - OVERLAP
    total = len(segments)

    for i in range(0, total, step):
        group = segments[i : i + CHUNK_SIZE]
        if not group:
            break

        text = " ".join(s["text"] for s in group).strip()
        start_time = group[0]["start"]
        last = group[-1]
        end_time = last["start"] + last.get("duration", 0)

        chunks.append(
            {
                "text": text,
                "video_id": video_id,
                "start_time": start_time,
                "end_time": end_time,
                "chunk_index": len(chunks),
            }
        )

    return chunks
