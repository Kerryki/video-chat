"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useVideoChat } from "@/context/VideoChatStore";
import { useChat } from "@/hooks/useChat";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { ModeSelector } from "./ModeSelector";
import type { ChatMode } from "@/types";

interface ChatPanelProps {
  sessionId: string;
}

export function ChatPanel({ sessionId }: ChatPanelProps) {
  const { state } = useVideoChat();
  const { ask } = useChat(sessionId);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || state.isLoading) return;
    setInput("");
    await ask(trimmed, mode);
  }

  const hasVideos = state.videos.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {state.messages.length === 0 && hasVideos && (
          <div className="text-center text-sm text-gray-400 mt-8">
            <p>Ask anything about {state.videos.length === 1 ? "this video" : "these videos"}</p>
          </div>
        )}
        {state.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {state.isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 pt-3 pb-safe-plus-3 space-y-2">
        <ModeSelector
          mode={mode}
          onChange={setMode}
          videoCount={state.videos.length}
        />
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasVideos
                ? "Ask anything about this video..."
                : "Load a video first, then ask questions"
            }
            disabled={!hasVideos || state.isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!hasVideos || !input.trim() || state.isLoading}
            className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
