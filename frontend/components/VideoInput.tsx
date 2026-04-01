"use client";

import { useState, type FormEvent } from "react";
import { useAddVideo } from "@/hooks/useAddVideo";

interface VideoInputProps {
  sessionId: string;
  compact?: boolean;
}

export function VideoInput({ sessionId, compact = false }: VideoInputProps) {
  const [url, setUrl] = useState("");
  const { load, loading, error } = useAddVideo(sessionId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || !sessionId) return;
    const ok = await load(trimmed);
    if (ok) setUrl("");
  }

  return (
    <div className={compact ? "" : "w-full max-w-xl mx-auto"}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube link..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingDots />
              Loading
            </span>
          ) : (
            compact ? "Add" : "Load video"
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-white animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
