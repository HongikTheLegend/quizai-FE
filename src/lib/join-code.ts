/**
 * 참여 코드(세션 코드) — **항상 서버가 발급한 값**이 기준입니다.
 * 수강생 입력란·교강사 화면 표시는 같은 문자열을 씁니다(길이는 API가 정함).
 * 프론트는 검증을 위해 길이 범위만 둡니다.
 */
/** 백엔드가 4자리 코드를 쓰는 경우가 많아 최소 4로 둡니다. */
export const JOIN_CODE_MIN_LENGTH = 4;
export const JOIN_CODE_MAX_LENGTH = 12;

/** 로컬 목/데모용 난수 길이(실제 라이브는 POST /sessions/start 응답의 session_code 사용). */
export const DEMO_JOIN_CODE_LENGTH = 6;

export const normalizeJoinCode = (raw: string): string =>
  raw.trim().toUpperCase().replace(/\s+/g, "");
