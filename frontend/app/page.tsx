"use client";

import { useState, useCallback } from "react";
import { useVideoChat } from "@/context/VideoChatStore";
import { useSessionId } from "@/hooks/useSessionId";
import { VideoInput } from "@/components/VideoInput";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VideoSidebar } from "@/components/VideoSidebar";
import { ChatPanel } from "@/components/ChatPanel";

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
  const [pip, setPip] = useState(false);

  const handleChatScroll = useCallback((scrollTop: number) => {
    setPip(scrollTop > 60);
  }, []);

  return (
    <>
      {/* ── Mobile layout: stacked vertically, PiP on scroll ── */}
      <div className="md:hidden h-dvh flex flex-col overflow-hidden bg-white">
        {/* Video — full width at top normally, fixed corner when pip */}
        <div
          className={
            pip
              ? "fixed bottom-20 right-3 z-50 w-40 rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 bg-black"
              : "flex-shrink-0 w-full bg-black"
          }
        >
          <VideoPlayer />
        </div>

        {/* Compact "add another video" strip — only when not pip */}
        {!pip && (
          <div className="flex-shrink-0 border-b border-gray-100 px-3 py-2">
            <VideoInput sessionId={sessionId} compact />
          </div>
        )}

        {/* Chat fills all remaining space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <ChatPanel sessionId={sessionId} onScroll={handleChatScroll} />
        </div>
      </div>

      {/* ── Desktop layout: side by side ── */}
      <div className="hidden md:flex h-dvh flex-row overflow-hidden bg-white">
        {/* Left panel: player + sidebar */}
        <div className="flex-shrink-0 flex flex-col w-[42%] border-r border-gray-100 overflow-hidden">
          <div className="flex-shrink-0 bg-black">
            <VideoPlayer />
          </div>
          <div className="flex-1 overflow-y-auto p-3 border-t border-gray-100">
            <VideoSidebar sessionId={sessionId} />
          </div>
        </div>

        {/* Right panel: chat */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ChatPanel sessionId={sessionId} />
        </div>
      </div>
    </>
  );
}
