import json

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def _session_key(request: Request) -> str:
    """Key rate limits by session_id from the request body.

    By the time slowapi calls this, FastAPI has already parsed the route's
    body parameter and cached the raw bytes at request._body. Reading it
    synchronously here is safe. Falls back to remote IP if no body is present.
    """
    try:
        body = getattr(request, "_body", b"")
        if body:
            data = json.loads(body)
            session_id = data.get("session_id")
            if session_id and isinstance(session_id, str):
                return session_id
    except Exception:
        pass
    return get_remote_address(request)


limiter = Limiter(key_func=_session_key)
