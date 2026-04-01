import asyncio
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field

SESSION_TTL_HOURS = 2
CLEANUP_INTERVAL_SECONDS = 600  # run cleanup every 10 minutes
MAX_HISTORY_TURNS = 10


@dataclass
class Message:
    role: str  # "user" | "assistant"
    content: str


@dataclass
class SessionData:
    conversation_history: list[Message] = field(default_factory=list)
    loaded_video_ids: list[str] = field(default_factory=list)
    video_titles: dict[str, str] = field(default_factory=dict)
    video_durations: dict[str, float] = field(default_factory=dict)
    last_accessed: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    tokens_used: int = 0


_sessions: dict[str, SessionData] = {}


def get_or_create(session_id: str) -> SessionData:
    if session_id not in _sessions:
        _sessions[session_id] = SessionData()
    session = _sessions[session_id]
    session.last_accessed = datetime.now(timezone.utc)
    return session


def add_video(session_id: str, video_id: str, title: str) -> None:
    session = get_or_create(session_id)
    if video_id not in session.loaded_video_ids:
        session.loaded_video_ids.append(video_id)
    session.video_titles[video_id] = title


def set_video_duration(session_id: str, video_id: str, duration: float) -> None:
    session = get_or_create(session_id)
    session.video_durations[video_id] = duration


def append_message(session_id: str, role: str, content: str) -> None:
    session = get_or_create(session_id)
    session.conversation_history.append(Message(role=role, content=content))
    # Keep only the last MAX_HISTORY_TURNS pairs
    max_messages = MAX_HISTORY_TURNS * 2
    if len(session.conversation_history) > max_messages:
        session.conversation_history = session.conversation_history[-max_messages:]


def get_history(session_id: str) -> list[Message]:
    return get_or_create(session_id).conversation_history


def add_tokens(session_id: str, count: int) -> None:
    session = get_or_create(session_id)
    session.tokens_used += count


def delete(session_id: str) -> None:
    _sessions.pop(session_id, None)


async def _cleanup_loop() -> None:
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=SESSION_TTL_HOURS)
        expired = [sid for sid, s in _sessions.items() if s.last_accessed < cutoff]
        for sid in expired:
            from services.vector_store import delete_session
            delete_session(sid)
            _sessions.pop(sid, None)


def start_cleanup_task() -> None:
    asyncio.create_task(_cleanup_loop())
