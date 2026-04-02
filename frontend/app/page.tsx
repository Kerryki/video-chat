"use client";

import { useState } from "react";
import { useVideoChat } from "@/context/VideoChatStore";
import { useSessionId } from "@/hooks/useSessionId";
import { VideoInput } from "@/components/VideoInput";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoSidebar } from "@/components/VideoSidebar";
import { ChatPanel } from "@/components/ChatPanel";

type MobileTab = "video" | "chat";

export default function Home() {
  const sessionId = useSessionId();
  const { state } = useVideoChat();

  if (state.videos.length === 0) {
    return <EmptyState sessionId={sessionId} />;
  }

  return <LoadedLayout sessionId={sessionId} />;
}

function EmptyState({ sessionId }: { sessionId: string }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 pb-safe">
      <div className="w-full max-w-lg flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            VideoChat
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Paste a YouTube link and ask anything about the video.
            <br />
            Get timestamped answers — click to jump straight to that moment.
          </p>
        </div>
        <VideoInput sessionId={sessionId} />
      </div>
    </div>
  );
}

function LoadedLayout({ sessionId }: { sessionId: string }) {
  const [tab, setTab] = useState<MobileTab>("video");

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      {/* Content area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

        {/* Left panel: player + sidebar — full screen on mobile Video tab */}
        <div
          className={`flex-col md:w-[42%] md:border-r border-gray-100 overflow-hidden ${
            tab === "video" ? "flex flex-1 md:flex-none" : "hidden md:flex"
          }`}
        >
          <div className="flex-shrink-0 bg-black">
            <VideoPlayer />
          </div>
          {/* No max-height cap — fills remaining space in both tabs */}
          <div className="flex-1 overflow-y-auto p-3 border-t border-gray-100">
            <VideoSidebar sessionId={sessionId} />
          </div>
        </div>

        {/* Right panel: chat — full screen on mobile Chat tab */}
        <div
          className={`flex-1 flex-col overflow-hidden min-h-0 ${
            tab === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatPanel sessionId={sessionId} />
        </div>
      </div>

      {/* Mobile-only bottom tab bar */}
      <div className="md:hidden flex-shrink-0 flex border-t border-gray-200 bg-white pb-safe">
        <button
          onClick={() => setTab("video")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            tab === "video" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <VideoIcon active={tab === "video"} />
          Video
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            tab === "chat" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <ChatIcon active={tab === "chat"} />
          Chat
        </button>
      </div>
    </div>
  );
}

function VideoIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="2" y="4" width="15" height="16" rx="2" />
      <path d="M17 8.5l5-3v13l-5-3V8.5z" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
