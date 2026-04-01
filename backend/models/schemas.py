import re
from typing import Literal
from pydantic import BaseModel, Field, field_validator

_UUID4_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
)

_YOUTUBE_DOMAINS = frozenset({
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "m.youtube.com",
})

_ALLOWED_SCHEMES = frozenset({"http", "https"})


def _validate_session_id(v: str) -> str:
    # Normalize to lowercase so the same UUID is always a single dict key
    v = v.lower()
    if not _UUID4_RE.match(v):
        raise ValueError("session_id must be a valid UUID v4")
    return v


def _validate_youtube_url(v: str) -> str:
    from urllib.parse import urlparse
    parsed = urlparse(v)
    if parsed.scheme not in _ALLOWED_SCHEMES:
        raise ValueError("url must be a YouTube URL")
    if parsed.netloc not in _YOUTUBE_DOMAINS:
        raise ValueError("url must be a YouTube URL")
    return v


# ── Request bodies ──────────────────────────────────────────────────────────

class AddVideoRequest(BaseModel):
    url: str = Field(max_length=2048)
    session_id: str

    @field_validator("session_id")
    @classmethod
    def check_session_id(cls, v: str) -> str:
        return _validate_session_id(v)

    @field_validator("url")
    @classmethod
    def check_url(cls, v: str) -> str:
        return _validate_youtube_url(v)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str
    mode: Literal["chat", "find_all", "compare", "unique_coverage"] = "chat"

    @field_validator("session_id")
    @classmethod
    def check_session_id(cls, v: str) -> str:
        return _validate_session_id(v)


# ── Response shapes ──────────────────────────────────────────────────────────

class VideoMeta(BaseModel):
    video_id: str
    title: str
    embeddable: bool
    summary: str
    topics: list[str]
    thumbnail_url: str
    fallback_url: str | None = None


class TimestampRef(BaseModel):
    video_id: str
    seconds: int
    display: str  # "MM:SS"


class ChunkSource(BaseModel):
    video_id: str
    start_time: float
    text: str


class ChatResponse(BaseModel):
    answer: str
    timestamps: list[TimestampRef]
    sources: list[ChunkSource]
