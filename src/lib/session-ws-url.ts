const storageKey = (sessionId: string) => `quizai_ws_url:${sessionId}`;

/** POST /sessions/join 직후, 같은 세션의 WebSocket에 쓸 공식 URL을 저장합니다. */
export const rememberSessionWsUrl = (sessionId: string, wsUrl: string | undefined): void => {
  if (typeof window === "undefined" || !sessionId?.trim() || !wsUrl?.trim()) {
    return;
  }
  try {
    sessionStorage.setItem(storageKey(sessionId.trim()), wsUrl.trim());
  } catch {
    // ignore quota / private mode
  }
};

export const getRememberedSessionWsUrl = (sessionId: string): string | undefined => {
  if (typeof window === "undefined" || !sessionId?.trim()) {
    return undefined;
  }
  return sessionStorage.getItem(storageKey(sessionId.trim())) ?? undefined;
};
