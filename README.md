# VideoChat

VideoChat is a web app that turns one or more YouTube videos into an **interactive, queryable knowledge source**.

Users can:
- Paste YouTube URLs
- Ask questions about the content
- Get answers **grounded in transcripts** (RAG)
- Click **timestamp chips** to jump to the exact moment in the video

The goal is to go beyond a “chat demo” and deliver a reliable product experience: answers that are verifiable and directly navigable in the source video.

---

## How It Works (High Level)

### 1) Session-based (no auth)
- On first load, the frontend generates a UUID session and stores it in `localStorage`.
- The backend associates all processed videos + embeddings with that session.
- Sessions expire after inactivity (ephemeral by design).

### 2) Video ingestion (RAG indexing)
When a user pastes a YouTube URL:
1. Backend validates the URL
2. Fetches transcript (via Supadata)
3. Chunks transcript with overlap (window 5, overlap 1)
4. Creates embeddings (MiniLM, local)
5. Stores embeddings in an in-memory vector store (ChromaDB)
6. Returns a summary + video metadata to the frontend

### 3) Question answering (RAG retrieval + strict grounding)
When a user asks a question:
1. Backend embeds the query
2. Performs semantic search over transcript chunks
3. Injects only the retrieved transcript context into the LLM prompt
4. LLM generates an answer constrained to that context (low temperature ~0.3)

Result: answers stay grounded and reduce hallucinations.

### 4) Timestamp grounding (interactive answers)
- The LLM emits references in the form: `[VIDEO_ID@SECONDS]`
- Backend parses these into structured timestamp objects
- Frontend renders clickable timestamp “chips”
- Clicking a chip seeks the YouTube player to that time (YouTube IFrame API)

---

## Chat Modes

1. **Standard Chat**
   - Retrieves top relevant chunks for general Q&A

2. **Find All Mentions**
   - Retrieves more chunks and returns timestamps grouped by video

3. **Compare Videos**
   - Retrieves per-video context and highlights similarities/differences

4. **Unique Coverage**
   - Identifies what one video covers that the others do not

---

## Tech Stack

### Backend (Python)
- FastAPI (API framework)
- Uvicorn (ASGI server)
- Pydantic (validation)
- Groq (Llama 3.3 70B) for LLM inference
- sentence-transformers (MiniLM) for local embeddings
- ChromaDB (in-memory vector database)
- Supadata (transcript API)
- httpx (async HTTP client)
- slowapi (rate limiting)

### Frontend (React / TypeScript)
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Context + `useReducer` (state management)
- YouTube IFrame API (video control + seeking)

---

## Repository Structure

```text
video-chat/
  backend/   # FastAPI backend (RAG + retrieval + timestamp parsing)
  frontend/  # Next.js frontend (UI + player + timestamp chips)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js + npm (or yarn/pnpm/bun)
- Python 3.10+ (recommended)
- A Supadata API key
- A Groq API key

> Note: The app is intentionally ephemeral:
> - sessions are UUID-based (no login)
> - vector DB is in-memory (data resets on restart)

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:
- http://localhost:3000

---

## Backend Setup

> Update these commands if your backend uses a different install/run flow.

```bash
cd backend

# Example (choose one approach your backend uses):
# python -m venv .venv
# source .venv/bin/activate
# pip install -r requirements.txt

# Run FastAPI (example):
# uvicorn main:app --reload --port 8000
```

---

## Environment Variables

You will typically need:

### Backend (`backend/.env`)
```env
GROQ_API_KEY=your_groq_key
SUPADATA_API_KEY=your_supadata_key
# Add any other config (rate limits, host, port, etc.)
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Key Engineering Decisions (Why)

- **No Auth / Session UUID**
  - Zero friction for users, faster iteration
  - Tradeoff: no persistence across restarts/devices

- **Local Embeddings (MiniLM)**
  - Lower cost, faster iteration
  - Tradeoff: slightly lower embedding quality than larger hosted models

- **In-Memory Vector Store (ChromaDB)**
  - No infra required
  - Tradeoff: resets on restart

- **Strict Grounding**
  - LLM only sees retrieved transcript context
  - Reduced hallucinations, increased trust

---

## Known Constraints

- Transcript retrieval depends on Supadata availability and quota.
- Some videos can’t be embedded due to YouTube restrictions; the UI falls back to linking out to YouTube.
