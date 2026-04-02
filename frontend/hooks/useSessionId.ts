"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { pingBackend } from "@/lib/api";

// Generate once per page load — not persisted, so a refresh always starts a fresh session.
const PAGE_SESSION_ID = uuidv4();

// Ping every 4 min to prevent Railway from sleeping (sleep threshold is ~5 min idle).
const KEEP_ALIVE_MS = 4 * 60 * 1000;

export function useSessionId(): string {
  const [sessionId] = useState<string>(PAGE_SESSION_ID);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, KEEP_ALIVE_MS);
    return () => clearInterval(interval);
  }, []);

  return sessionId;
}
