"use client";

import { useVideoChat } from "@/context/VideoChatStore";
import type { TimestampRef } from "@/types";

interface TimestampChipProps {
  ref_: TimestampRef;
  videoTitle: string;
  embeddable: boolean;
  fallbackUrl: string | null;
}

export function TimestampChip({
  ref_,
  videoTitle,
  embeddable,
  fallbackUrl,
}: TimestampChipProps) {
  const { dispatch } = useVideoChat();

  const label = `${videoTitle} @ ${ref_.display}`;

  if (!embeddable && fallbackUrl) {
    const url = `${fallbackUrl}?t=${ref_.seconds}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-xs text-gray-700 transition-colors max-w-full"
      >
        <PlayIcon />
        {label}
      </a>
    );
  }

  return (
    <button
      onClick={() =>
        dispatch({
          type: "SEEK",
          payload: { videoId: ref_.video_id, seconds: ref_.seconds },
        })
      }
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 hover:bg-blue-200 px-3 py-1 text-xs text-blue-700 transition-colors max-w-full"
    >
      <PlayIcon />
      {label}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
