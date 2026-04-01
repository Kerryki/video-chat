"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { AppState, AppAction } from "@/types";

const initialState: AppState = {
  sessionId: "",
  videos: [],
  activeVideoId: null,
  messages: [],
  isLoading: false,
  seekTarget: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_VIDEO":
      return {
        ...state,
        videos: [...state.videos, action.payload],
        // First video becomes active automatically
        activeVideoId: state.activeVideoId ?? action.payload.video_id,
      };

    case "SET_ACTIVE_VIDEO":
      return { ...state, activeVideoId: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SEEK":
      return {
        ...state,
        activeVideoId: action.payload.videoId,
        seekTarget: action.payload,
      };

    default:
      return state;
  }
}

interface VideoChatContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const VideoChatContext = createContext<VideoChatContextValue | null>(null);

export function VideoChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <VideoChatContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoChatContext.Provider>
  );
}

export function useVideoChat(): VideoChatContextValue {
  const ctx = useContext(VideoChatContext);
  if (!ctx) throw new Error("useVideoChat must be used within VideoChatProvider");
  return ctx;
}
