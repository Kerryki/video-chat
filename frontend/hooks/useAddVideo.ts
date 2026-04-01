"use client";

import { useState } from "react";
import { addVideo } from "@/lib/api";
import { useVideoChat } from "@/context/VideoChatStore";

export function useAddVideo(sessionId: string) {
  const { dispatch } = useVideoChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(url: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const video = await addVideo(url, sessionId);
      dispatch({ type: "ADD_VIDEO", payload: video });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load video");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { load, loading, error };
}
