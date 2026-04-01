import type { VideoMeta, ChatMessage, ChatMode, TimestampRef } from "@/types";
import { v4 as uuidv4 } from "uuid";

const BASE = "/api/backend";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function addVideo(
  url: string,
  sessionId: string
): Promise<VideoMeta> {
  const res = await fetch(`${BASE}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, session_id: sessionId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Failed to load video");
  }

  return res.json();
}

export async function sendMessage(
  message: string,
  sessionId: string,
  mode: ChatMode
): Promise<{ answer: string; timestamps: TimestampRef[] }> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, mode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Failed to get answer");
  }

  return res.json();
}

export async function pingBackend(): Promise<void> {
  try {
    await fetch(`${BASE}/health`);
  } catch {
    // Fire and forget — just waking Railway from cold start
  }
}

export function newMessageId(): string {
  return uuidv4();
}
