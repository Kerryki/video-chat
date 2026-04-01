"use client";

import { useState } from "react";
import Image from "next/image";
import { useVideoChat } from "@/context/VideoChatStore";
import { VideoInput } from "./VideoInput";
import type { VideoMeta } from "@/types";

interface VideoSidebarProps {
  sessionId: string;
}

export function VideoSidebar({ sessionId }: VideoSidebarProps) {
  const { state, dispatch } = useVideoChat();
  const { videos, activeVideoId } = state;

  if (videos.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {videos.map((v) => (
        <VideoCard
          key={v.video_id}
          video={v}
          active={v.video_id === activeVideoId}
          onSelect={() =>
            dispatch({ type: "SET_ACTIVE_VIDEO", payload: v.video_id })
          }
        />
      ))}
      <div className="pt-1">
        <VideoInput sessionId={sessionId} compact />
      </div>
    </div>
  );
}

function VideoCard({
  video,
  active,
  onSelect,
}: {
  video: VideoMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 cursor-pointer transition-colors ${
        active
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <Image
          src={video.thumbnail_url}
          alt={video.title}
          width={80}
          height={45}
          className="rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {video.title}
          </p>
          {!video.embeddable && (
            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Links only
            </span>
          )}
        </div>
      </div>

      <button
        className="mt-2 text-xs text-blue-600 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
      >
        {expanded ? "Hide summary" : "Show summary"}
      </button>

      {expanded && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 leading-relaxed">
            {video.summary}
          </p>
          {video.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.topics.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
