from fastapi import APIRouter, HTTPException, Request

from models.schemas import AddVideoRequest, VideoMeta
from services import session_store
from services.chunker import chunk_transcript
from services.summarizer import generate_summary
from services.youtube import (
    check_embeddable,
    extract_video_id,
    fetch_transcript,
    get_video_title,
)
from limiter import limiter

router = APIRouter(prefix="/videos", tags=["videos"])

MAX_VIDEOS_PER_SESSION = 10


@router.post("", response_model=VideoMeta)
@limiter.limit("5/minute")
async def add_video(request: Request, body: AddVideoRequest):
    # Rate limit per session
    session = session_store.get_or_create(body.session_id)
    if len(session.loaded_video_ids) >= MAX_VIDEOS_PER_SESSION:
        raise HTTPException(
            status_code=400,
            detail=f"You've reached the limit of {MAX_VIDEOS_PER_SESSION} videos per session.",
        )

    try:
        video_id = extract_video_id(body.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Avoid re-processing the same video in the same session
    if video_id in session.loaded_video_ids:
        raise HTTPException(status_code=400, detail="This video is already loaded.")

    # Fetch in parallel
    import asyncio
    embeddable, title, transcript = await asyncio.gather(
        check_embeddable(video_id),
        get_video_title(video_id),
        fetch_transcript(video_id),
        return_exceptions=True,
    )

    # fetch_transcript may have raised
    if isinstance(transcript, Exception):
        raise HTTPException(status_code=422, detail=str(transcript))
    if isinstance(title, Exception):
        title = "Untitled Video"
    if isinstance(embeddable, Exception):
        embeddable = False

    chunks = chunk_transcript(transcript, video_id)
    duration = chunks[-1]["end_time"] if chunks else 0.0

    session_store.store_chunks(body.session_id, video_id, chunks)

    # Generate summary
    summary_data = await generate_summary(chunks)

    # Register in session
    session_store.add_video(body.session_id, video_id, title)
    session_store.set_video_duration(body.session_id, video_id, duration)

    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
    fallback_url = f"https://youtu.be/{video_id}" if not embeddable else None

    return VideoMeta(
        video_id=video_id,
        title=title,
        embeddable=embeddable,
        summary=summary_data["summary"],
        topics=summary_data["topics"],
        thumbnail_url=thumbnail_url,
        fallback_url=fallback_url,
    )
