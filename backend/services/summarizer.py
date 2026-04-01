import json
import math
import re

from groq import AsyncGroq

from config import settings

_groq = AsyncGroq(api_key=settings.groq_api_key)

CHAT_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """\
You are summarizing a YouTube video transcript for any user — any age, any background.

Write a 3-5 sentence plain-language summary of what the video is about.
Then list 5-8 bullet points covering the main topics discussed.

Rules:
- Use simple, everyday language. No jargon.
- Short sentences.
- Do not mention that you are reading a transcript.
- Do not start with "This video..." — just describe what it covers.

You MUST respond with ONLY valid JSON — no extra text, no markdown fences.
Every string value MUST be wrapped in double quotes.
Use this exact format:
{"summary": "your summary here", "topics": ["topic 1", "topic 2", "topic 3"]}
"""


async def generate_summary(chunks: list[dict]) -> dict:
    """
    Generate a plain-language summary from a spread of chunks across the video.
    Uses ~20 evenly spaced chunks to cover the full video, not just the opening.
    """
    if not chunks:
        return {"summary": "No transcript available.", "topics": []}

    total = len(chunks)
    step = max(1, math.floor(total / 20))
    sampled = chunks[::step][:20]

    transcript_text = "\n\n".join(
        f"[{_fmt(c['start_time'])}] {c['text']}" for c in sampled
    )

    response = await _groq.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": transcript_text},
        ],
        temperature=0.3,
    )

    raw = response.choices[0].message.content or ""

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return {
            "summary": data.get("summary", ""),
            "topics": data.get("topics", []),
        }
    except Exception:
        return {"summary": "Could not generate summary.", "topics": []}


def _fmt(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 60}:{s % 60:02d}"
