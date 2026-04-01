"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { pingBackend } from "@/lib/api";

export function useSessionId(): string {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let id = sessionStorage.getItem("videochat_session_id");
    if (!id) {
      id = uuidv4();
      sessionStorage.setItem("videochat_session_id", id);
    }
    setSessionId(id);

    // Wake Railway backend on first load
    pingBackend();
  }, []);

  return sessionId;
}
