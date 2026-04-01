export interface VideoMeta {
  video_id: string;
  title: string;
  embeddable: boolean;
  summary: string;
  topics: string[];
  thumbnail_url: string;
  fallback_url: string | null;
}

export interface TimestampRef {
  video_id: string;
  seconds: number;
  display: string; // "MM:SS"
}

export interface ChunkSource {
  video_id: string;
  start_time: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamps: TimestampRef[];
}

export type ChatMode =
  | "chat"
  | "find_all"
  | "compare"
  | "unique_coverage";

export interface SeekTarget {
  videoId: string;
  seconds: number;
}

export interface AppState {
  sessionId: string;
  videos: VideoMeta[];
  activeVideoId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  seekTarget: SeekTarget | null;
}

export type AppAction =
  | { type: "ADD_VIDEO"; payload: VideoMeta }
  | { type: "SET_ACTIVE_VIDEO"; payload: string }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SEEK"; payload: SeekTarget };
