"use client";

import type { ChatMode } from "@/types";

interface ModeSelectorProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  videoCount: number;
}

const MODES: { value: ChatMode; label: string; minVideos: number }[] = [
  { value: "chat", label: "Chat", minVideos: 1 },
  { value: "find_all", label: "Find all mentions", minVideos: 1 },
  { value: "compare", label: "Compare videos", minVideos: 2 },
  { value: "unique_coverage", label: "What's unique here?", minVideos: 2 },
];

export function ModeSelector({ mode, onChange, videoCount }: ModeSelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
      {MODES.map((m) => {
        const disabled = videoCount < m.minVideos;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            disabled={disabled}
            onClick={() => !disabled && onChange(m.value)}
            title={
              disabled
                ? `Add ${m.minVideos - videoCount} more video${m.minVideos - videoCount > 1 ? "s" : ""} to use this`
                : undefined
            }
            className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
