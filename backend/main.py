from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers import videos, chat
from services.session_store import start_cleanup_task
from limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
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
