"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { pingBackend } from "@/lib/api";

// Generate once per page load — not persisted, so a refresh always starts a fresh session.
const PAGE_SESSION_ID = uuidv4();

// Railway free tier sleeps after ~5 min of inactivity. Ping every 4 min to keep it warm.
const KEEPALIVE_MS = 4 * 60 * 1000;

export function useSessionId(): string {
  const [sessionId] = useState<string>(PAGE_SESSION_ID);

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, KEEPALIVE_MS);
    return () => clearInterval(interval);
  }, []);

  return sessionId;
}
