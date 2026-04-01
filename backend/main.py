from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers import videos, chat
from services.session_store import start_cleanup_task
from services.vector_store import _get_model
from limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up the embedding model so the first video load doesn't block.
    # Uses asyncio.to_thread so the synchronous download doesn't block the event loop.
    import asyncio
    await asyncio.to_thread(_get_model)
    start_cleanup_task()
    yield


app = FastAPI(title="VideoChat API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
