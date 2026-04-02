"use client";

import { useEffect, useRef, useCallback } from "react";
import type { SeekTarget } from "@/types";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}


let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) return resolve();
    readyCallbacks.push(resolve);

    if (!apiLoaded) {
      apiLoaded = true;
      window.onYouTubeIframeAPIReady = () => {
        apiReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

interface UseYouTubePlayerOptions {
  containerId: string;
  initialVideoId: string | null;
  seekTarget: SeekTarget | null;
}

export function useYouTubePlayer({
  containerId,
  initialVideoId,
  seekTarget,
}: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  // Initialise player once API is ready
  useEffect(() => {
    if (!initialVideoId) return;

    loadYouTubeAPI().then(() => {
      if (playerRef.current) return; // already created

      playerRef.current = new window.YT.Player(containerId, {
        width: "100%",
        height: "100%",
        videoId: initialVideoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            currentVideoIdRef.current = initialVideoId;
            if (pendingSeekRef.current !== null) {
              playerRef.current?.seekTo(pendingSeekRef.current, true);
              pendingSeekRef.current = null;
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // After a cued video starts playing, apply any pending seek
            if (
              event.data === window.YT.PlayerState.PLAYING &&
              pendingSeekRef.current !== null
            ) {
              playerRef.current?.seekTo(pendingSeekRef.current, true);
              pendingSeekRef.current = null;
            }
          },
        },
      });
    });
  }, [containerId, initialVideoId]);

  // Handle seek targets
  useEffect(() => {
    if (!seekTarget || !seekTarget.videoId) return;

    const { videoId, seconds } = seekTarget;

    if (!playerRef.current) {
      pendingSeekRef.current = seconds;
      return;
    }

    if (currentVideoIdRef.current !== videoId) {
      // Switch to a different video and seek
      currentVideoIdRef.current = videoId;
      pendingSeekRef.current = seconds;
      playerRef.current.loadVideoById({ videoId, startSeconds: seconds });
    } else {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, [seekTarget]);

  const loadVideo = useCallback((videoId: string) => {
    if (!playerRef.current) return;
    currentVideoIdRef.current = videoId;
    playerRef.current.cueVideoById(videoId);
  }, []);

  return { loadVideo };
}
