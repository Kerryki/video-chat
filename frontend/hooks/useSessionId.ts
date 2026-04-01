"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { pingBackend } from "@/lib/api";

// Generate once per page load — not persisted, so a refresh always starts a fresh session.
const PAGE_SESSION_ID = uuidv4();

export function useSessionId(): string {
  const [sessionId] = useState<string>(PAGE_SESSION_ID);

  useState(() => {
    pingBackend();
  });

  return sessionId;
}
