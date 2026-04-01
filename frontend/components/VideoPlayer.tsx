"use client";

import { useEffect, useRef } from "react";
import { useVideoChat } from "@/context/VideoChatStore";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

const PLAYER_ID = "yt-player-container";

export function VideoPlayer() {
  const { state } = useVideoChat();
  const { activeVideoId, seekTarget, videos } = state;

  const activeVideo = videos.find((v) => v.video_id === activeVideoId);

  const { loadVideo } = useYouTubePlayer({
    containerId: PLAYER_ID,
    initialVideoId: activeVideoId,
    seekTarget,
  });

  // When the user clicks a video in the sidebar (SET_ACTIVE_VIDEO), load it in the player.
  // Skip the initial mount — the hook handles the first video via initialVideoId.
  const prevActiveVideoIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeVideoId) return;
    if (prevActiveVideoIdRef.current === null) {
      prevActiveVideoIdRef.current = activeVideoId;
      return;
    }
    if (prevActiveVideoIdRef.current !== activeVideoId) {
      prevActiveVideoIdRef.current = activeVideoId;
      loadVideo(activeVideoId);
    }
  }, [activeVideoId, loadVideo]);

  if (!activeVideoId) return null;

  // Non-embeddable fallback
  if (activeVideo && !activeVideo.embeddable) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl">
        <div className="text-center px-6">
          <p className="text-white text-sm mb-2">
            This video can&apos;t play here.
          </p>
          <p className="text-gray-400 text-xs">
            Click a timestamp to open it on YouTube at the right moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <div id={PLAYER_ID} className="w-full h-full" />
    </div>
  );
}
