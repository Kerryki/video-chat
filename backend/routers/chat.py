from fastapi import APIRouter, HTTPException, Request

from models.schemas import ChatRequest, ChatResponse
from services import session_store
from services.rag import answer
from limiter import limiter

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    session = session_store.get_or_create(body.session_id)

    if not session.loaded_video_ids:
        raise HTTPException(
            status_code=400,
            detail="No videos loaded. Please add a YouTube video first.",
        )

    result = await answer(
        session_id=body.session_id,
        message=body.message,
        mode=body.mode,
    )

    return ChatResponse(**result)
