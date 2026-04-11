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

const JOIN_META_KEY = "quizai:lastJoinMeta";

type JoinMeta = { sessionId: string; nickname: string };

/** POST /sessions/join 시 사용한 닉네임을 같은 세션 WebSocket에 맞추기 위해 저장합니다. */
export const rememberJoinNickname = (sessionId: string, nickname: string): void => {
  if (typeof window === "undefined" || !sessionId?.trim() || !nickname?.trim()) {
    return;
  }
  try {
    const payload: JoinMeta = { sessionId: sessionId.trim(), nickname: nickname.trim() };
    sessionStorage.setItem(JOIN_META_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

export const getRememberedJoinNickname = (sessionId: string): string | undefined => {
  if (typeof window === "undefined" || !sessionId?.trim()) {
    return undefined;
  }
  try {
    const raw = sessionStorage.getItem(JOIN_META_KEY);
    if (!raw) {
      return undefined;
    }
    const o = JSON.parse(raw) as JoinMeta;
    if (o.sessionId === sessionId.trim() && typeof o.nickname === "string" && o.nickname.trim()) {
      return o.nickname.trim();
    }
  } catch {
    // ignore
  }
  return undefined;
};
