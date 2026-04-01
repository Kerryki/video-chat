"use client";

import type { ReactNode } from "react";
import { useVideoChat } from "@/context/VideoChatStore";
import { TimestampChip } from "./TimestampChip";
import type { ChatMessage as ChatMessageType, VideoMeta } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

const TIMESTAMP_RE = /\[([A-Za-z0-9_-]{11})@(\d+(?::\d{2})?)\]/g;

function parseSeconds(value: string): number {
  if (value.includes(":")) {
    const [m, s] = value.split(":");
    return parseInt(m, 10) * 60 + parseInt(s, 10);
  }
  return parseInt(value, 10);
}

function fmtSeconds(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Split a string on **bold** markers and return text/bold nodes. */
function renderBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/** Replace [VIDEO_ID@SECONDS] markers with inline TimestampChip components,
 *  and render **bold** text within plain segments. */
function renderInline(text: string, videos: VideoMeta[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(TIMESTAMP_RE.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(...renderBold(text.slice(last, match.index)));
    }

    const videoId = match[1];
    const seconds = parseSeconds(match[2]);
    const video = videos.find((v) => v.video_id === videoId);

    if (video) {
      nodes.push(
        <TimestampChip
          key={`${videoId}-${seconds}-${match.index}`}
          ref_={{ video_id: videoId, seconds, display: fmtSeconds(seconds) }}
          videoTitle={video.title}
          embeddable={video.embeddable}
          fallbackUrl={video.fallback_url}
        />
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(...renderBold(text.slice(last)));
  }

  return nodes;
}

/** Render a single line, handling bullet prefixes (* or -). */
function Line({
  text,
  videos,
  isLast,
}: {
  text: string;
  videos: VideoMeta[];
  isLast: boolean;
}) {
  const trimmed = text.trimStart();
  const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
  const isHeader = trimmed.startsWith("**") && trimmed.endsWith("**") && !isBullet;
  const lineContent = isBullet ? trimmed.slice(2) : text;

  if (isHeader) {
    return (
      <div className={`font-semibold text-gray-800 ${isLast ? "" : "mt-2 mb-0.5"}`}>
        {trimmed.slice(2, -2)}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-1.5 ${isLast ? "" : "mb-1"}`}>
      {isBullet && (
        <span className="mt-0.5 text-gray-400 select-none flex-shrink-0">•</span>
      )}
      <span className="flex flex-wrap items-center gap-1 leading-relaxed">
        {renderInline(lineContent, videos)}
      </span>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { state } = useVideoChat();
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-blue-600 text-white">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const lines = message.content.split("\n");

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-gray-100 text-gray-900">
          {lines.map((line, i) => (
            <Line
              key={i}
              text={line}
              videos={state.videos}
              isLast={i === lines.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
