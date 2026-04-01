import re
from urllib.parse import urlparse, parse_qs

import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

_VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def _assert_valid_video_id(video_id: str) -> None:
    if not _VIDEO_ID_RE.match(video_id):
        raise ValueError("Invalid video ID format.")


def extract_video_id(url: str) -> str:
    """Extract the 11-character video ID from any YouTube URL format."""
    parsed = urlparse(url)

    # youtu.be/VIDEO_ID
    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        video_id = parsed.path.lstrip("/").split("/")[0]
        if video_id:
            _assert_valid_video_id(video_id)
            return video_id

    # youtube.com/watch?v=VIDEO_ID
    if "youtube.com" in parsed.netloc:
        qs = parse_qs(parsed.query)
        if "v" in qs:
            video_id = qs["v"][0]
            _assert_valid_video_id(video_id)
            return video_id

        # youtube.com/shorts/VIDEO_ID or youtube.com/embed/VIDEO_ID
        match = re.search(r"/(shorts|embed|v)/([A-Za-z0-9_-]{11})", parsed.path)
        if match:
            video_id = match.group(2)
            _assert_valid_video_id(video_id)
            return video_id

    raise ValueError("Invalid or unsupported YouTube URL.")


async def check_embeddable(video_id: str) -> bool:
    """Return True if the video allows embedding via the oEmbed endpoint."""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url)
            return resp.status_code == 200
    except Exception:
        return False


async def fetch_transcript(video_id: str) -> list[dict]:
    """
    Fetch the transcript for a video.
    Returns a list of {"text": str, "start": float, "duration": float}.
    Raises ValueError with a user-friendly message on failure.
    """
    import asyncio

    loop = asyncio.get_running_loop()

    def _fetch():
        from config import settings
        from youtube_transcript_api.proxies import WebshareProxyConfig
        proxy_config = None
        if settings.webshare_proxy_username and settings.webshare_proxy_password:
            proxy_config = WebshareProxyConfig(
                proxy_username=settings.webshare_proxy_username,
                proxy_password=settings.webshare_proxy_password,
            )
        api = YouTubeTranscriptApi(proxy_config=proxy_config)
        result = api.fetch(video_id)
        return [{"text": s.text, "start": s.start, "duration": s.duration} for s in result]

    try:
        return await loop.run_in_executor(None, _fetch)
    except TranscriptsDisabled:
        raise ValueError("This video has captions disabled — we can't read its transcript.")
    except NoTranscriptFound:
        raise ValueError("No transcript found for this video. It may not have captions.")
    except VideoUnavailable:
        raise ValueError("This video is unavailable or private.")
    except Exception as e:
        raise ValueError(f"Could not fetch transcript: {str(e)}")


async def get_video_title(video_id: str) -> str:
    """Fetch the video title via oEmbed."""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json().get("title", "Untitled Video")
    except Exception:
        pass
    return "Untitled Video"
