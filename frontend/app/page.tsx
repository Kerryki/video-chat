"use client";

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
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
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
  return (
    <div className="h-dvh flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left panel: player + sidebar */}
      <div className="flex-shrink-0 flex flex-col md:w-[42%] md:border-r border-gray-100">
        {/* Player sits at the top on both mobile and desktop */}
        <div className="flex-shrink-0 bg-black">
          <VideoPlayer />
        </div>

        {/* Sidebar: compact fixed height on mobile, fills remaining space on desktop */}
        <div className="overflow-y-auto max-h-36 md:max-h-none md:flex-1 p-3 border-t border-gray-100">
          <VideoSidebar sessionId={sessionId} />
        </div>
      </div>

      {/* Right panel: chat fills remaining height */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ChatPanel sessionId={sessionId} />
      </div>
    </div>
  );
}
