"use client";

import { useEffect, useState } from "react";

/** `deadlineMs` = Unix epoch ms when the question timer hits zero. */
export function useQuizDeadlineCountdown(deadlineMs: number | null): number | null {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);

  useEffect(() => {
    if (deadlineMs === null) {
      setRemainingSec(null);
      return;
    }

    const tick = () => {
      const sec = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
      setRemainingSec(sec);
    };

    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [deadlineMs]);

  return remainingSec;
}
