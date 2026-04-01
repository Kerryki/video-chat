"use client";

import { sendMessage, newMessageId } from "@/lib/api";
import { useVideoChat } from "@/context/VideoChatStore";
import type { ChatMode } from "@/types";

export function useChat(sessionId: string) {
  const { dispatch, state } = useVideoChat();

  async function ask(message: string, mode: ChatMode): Promise<void> {
    if (!message.trim() || state.isLoading) return;

    // Add user message immediately
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: newMessageId(),
        role: "user",
        content: message,
        timestamps: [],
      },
    });

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await sendMessage(message, sessionId, mode);

      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: newMessageId(),
          role: "assistant",
          content: response.answer,
          timestamps: response.timestamps,
        },
      });
    } catch (err) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: newMessageId(),
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          timestamps: [],
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  return { ask };
}
