const storageKey = (sessionId: string) => `quizai_ws_url:${sessionId}`;

/** 새로고침·다른 탭에서도 join 시 받은 URL 을 쓰기 위한 localStorage 백업 키 */
const localBackupKey = (sessionId: string) => `quizai:student_ws_url:${sessionId.trim()}`;

/** POST /sessions/join 직후, 같은 세션의 WebSocket에 쓸 공식 URL을 저장합니다. */
export const rememberSessionWsUrl = (sessionId: string, wsUrl: string | undefined): void => {
  if (typeof window === "undefined" || !sessionId?.trim() || !wsUrl?.trim()) {
    return;
  }
  const id = sessionId.trim();
  const url = wsUrl.trim();
  try {
    sessionStorage.setItem(storageKey(id), url);
  } catch {
    // ignore quota / private mode
  }
  try {
    localStorage.setItem(localBackupKey(id), url);
  } catch {
    // ignore
  }
};

export const getRememberedSessionWsUrl = (sessionId: string): string | undefined => {
  if (typeof window === "undefined" || !sessionId?.trim()) {
    return undefined;
  }
  const id = sessionId.trim();
  try {
    const fromSession = sessionStorage.getItem(storageKey(id));
    if (fromSession) {
      return fromSession;
    }
  } catch {
    // ignore
  }
  try {
    return localStorage.getItem(localBackupKey(id)) ?? undefined;
  } catch {
    return undefined;
  }
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
