import { coerceOptionText, coerceQuestionText, coerceRenderableText } from "@/lib/normalize-quiz-shape";

export type QuizWsEvent =
  | {
      type: "session_joined";
      payload: {
        participant_count: number;
        nickname: string;
        user_id?: string;
        role?: string;
      };
    }
  | {
      type: "quiz_started";
      payload: {
        quiz_id: string;
        question: string;
        options: string[];
        time_limit: number;
        question_index?: number;
        question_total?: number;
      };
    }
  | {
      type: "answer_update";
      payload: { total: number; answered: number; rate: number; distribution: number[] };
    }
  | { type: "answer_revealed"; payload: { correct_option: number; explanation?: string | null } }
  | { type: "session_ended"; payload: { session_id: string } }
  | { type: "participant_answer"; payload: { nickname: string; quiz_id: string; submitted: boolean } }
  | { type: "error"; payload: { message: string } };

export type LiveParticipantRow = {
  nickname: string;
  /** 서버가 주면 동명이인·재입장 구분에 사용 */
  userId?: string;
  role?: string;
  joinedAt: number;
  answeredCurrent: boolean;
};

export type LiveSessionState = {
  participantCount: number | null;
  participants: LiveParticipantRow[];
  /** 서버가 세션 종료를 알린 뒤 true */
  liveEnded: boolean;
  liveEndedAt: number | null;
  activeQuiz: {
    quiz_id: string;
    question: string;
    options: string[];
    time_limit: number;
    startedAt: number;
    question_index?: number;
    question_total?: number;
  } | null;
  /** 서버가 보내는 집계(보기별 선택 수 등). 없으면 빈 배열. */
  answerProgress: {
    answered: number;
    total: number;
    rate: number;
    distribution: number[];
  } | null;
};

export const initialLiveSessionState = (): LiveSessionState => ({
  participantCount: null,
  participants: [],
  liveEnded: false,
  liveEndedAt: null,
  activeQuiz: null,
  answerProgress: null,
});

export const reduceLiveSessionState = (
  prev: LiveSessionState,
  event: QuizWsEvent,
): LiveSessionState => {
  switch (event.type) {
    case "session_joined": {
      const { nickname, participant_count, user_id, role } = event.payload;
      const key = (user_id ?? nickname).trim();
      const exists = prev.participants.some(
        (p) => (p.userId ?? p.nickname).trim() === key || p.nickname === nickname,
      );
      const row: LiveParticipantRow = {
        nickname,
        userId: user_id,
        role,
        joinedAt: Date.now(),
        answeredCurrent: false,
      };
      const participants = exists
        ? prev.participants.map((p) =>
            (p.userId ?? p.nickname).trim() === key || p.nickname === nickname
              ? { ...p, ...row, answeredCurrent: p.answeredCurrent }
              : p,
          )
        : [...prev.participants, row];
      return {
        ...prev,
        participantCount: participant_count,
        participants,
      };
    }
    case "quiz_started": {
      const { quiz_id, question, options, time_limit, question_index, question_total } = event.payload;
      if (
        typeof question_index === "number" &&
        Number.isFinite(question_index) &&
        prev.activeQuiz?.question_index !== undefined &&
        question_index < prev.activeQuiz.question_index
      ) {
        return prev;
      }
      const safeOptions = Array.isArray(options) ? options : [];
      return {
        ...prev,
        activeQuiz: {
          quiz_id,
          question,
          options: safeOptions,
          time_limit,
          startedAt: Date.now(),
          ...(typeof question_index === "number" && Number.isFinite(question_index)
            ? { question_index: Math.max(0, Math.round(question_index)) }
            : {}),
          ...(typeof question_total === "number" && Number.isFinite(question_total)
            ? { question_total: Math.max(1, Math.round(question_total)) }
            : {}),
        },
        answerProgress: null,
        participants: prev.participants.map((p) => ({ ...p, answeredCurrent: false })),
      };
    }
    case "answer_update":
      return {
        ...prev,
        answerProgress: {
          answered: event.payload.answered,
          total: event.payload.total,
          rate: event.payload.rate,
          distribution: Array.isArray(event.payload.distribution) ? event.payload.distribution : [],
        },
      };
    case "participant_answer": {
      const { nickname, submitted } = event.payload;
      const exists = prev.participants.some((p) => p.nickname === nickname);
      const participants = exists
        ? prev.participants.map((p) =>
            p.nickname === nickname ? { ...p, answeredCurrent: submitted } : p,
          )
        : [...prev.participants, { nickname, joinedAt: Date.now(), answeredCurrent: submitted }];
      return {
        ...prev,
        participants,
      };
    }
    case "session_ended":
      return {
        ...prev,
        activeQuiz: null,
        answerProgress: null,
        liveEnded: true,
        liveEndedAt: Date.now(),
      };
    case "answer_revealed":
    case "error":
    default:
      return prev;
  }
};

function coerceQuizTimeLimitSec(v: unknown, fallback: number): number {
  const n =
    typeof v === "number" && Number.isFinite(v)
      ? v
      : typeof v === "string" && v.trim()
        ? Number(v)
        : Number.NaN;
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(600, Math.max(5, Math.round(n)));
}

/** `payload` 래핑·`quiz_start` 별칭·문자열 time_limit·choices 키 등 서버 차이 흡수 */
function tryParseQuizStartedEvent(raw: unknown, o: { type?: string; payload?: unknown }): QuizWsEvent | null {
  const body = (() => {
    const p = o.payload;
    if (p && typeof p === "object" && !Array.isArray(p)) {
      return p as Record<string, unknown>;
    }
    if (raw && typeof raw === "object") {
      const full = raw as Record<string, unknown>;
      const { type: _ty, payload: _pl, ...rest } = full;
      if (
        rest.quiz_id !== undefined ||
        rest.quizId !== undefined ||
        (rest as { id?: unknown }).id !== undefined ||
        rest.question !== undefined ||
        rest.options !== undefined ||
        rest.choices !== undefined
      ) {
        return rest;
      }
    }
    return null;
  })();

  if (!body) {
    return null;
  }

  const idRaw = body.quiz_id ?? body.quizId ?? (body as { id?: unknown }).id;
  const quiz_id =
    typeof idRaw === "string" && idRaw.trim()
      ? idRaw.trim()
      : idRaw != null && String(idRaw).trim()
        ? String(idRaw).trim()
        : "";
  if (!quiz_id) {
    return null;
  }

  const question = coerceQuestionText(body.question ?? body.text ?? body.stem ?? body.prompt);
  if (!question.trim()) {
    return null;
  }

  let optsRaw: unknown[] = [];
  if (Array.isArray(body.options)) {
    optsRaw = body.options;
  } else if (Array.isArray(body.choices)) {
    optsRaw = body.choices;
  } else if (body.options && typeof body.options === "object") {
    optsRaw = Object.values(body.options as Record<string, unknown>);
  }
  const options = optsRaw.map(coerceOptionText).filter((s) => s.trim().length > 0);
  if (options.length === 0) {
    return null;
  }

  const time_limit = coerceQuizTimeLimitSec(
    body.time_limit ?? body.timeLimit ?? body.limit_seconds ?? body.limit,
    30,
  );

  const parseOptIdx = (v: unknown): number | undefined => {
    if (typeof v === "number" && Number.isFinite(v)) {
      return Math.round(v);
    }
    if (typeof v === "string" && v.trim()) {
      const n = Number(v.trim());
      return Number.isFinite(n) ? Math.round(n) : undefined;
    }
    return undefined;
  };
  const question_index = parseOptIdx(body.question_index ?? body.questionIndex);
  const question_total = parseOptIdx(body.question_total ?? body.questionTotal);

  return {
    type: "quiz_started",
    payload: {
      quiz_id,
      question,
      options,
      time_limit,
      ...(question_index !== undefined ? { question_index } : {}),
      ...(question_total !== undefined ? { question_total } : {}),
    },
  };
}

function normalizeQuizEventTypeName(t: string): string {
  const key = t.trim().toLowerCase().replace(/-/g, "_");
  const aliases: Record<string, string> = {
    quiz_start: "quiz_started",
    start_quiz: "quiz_started",
    new_question: "quiz_started",
    question_started: "quiz_started",
    quiz_question: "quiz_started",
    current_question: "quiz_started",
    broadcast_quiz: "quiz_started",
    quiz: "quiz_started",
  };
  if (key === "quiz_started") {
    return "quiz_started";
  }
  return aliases[key] ?? t.trim();
}

/** Lenient parse: unknown shapes fall back to null (caller may still use last raw message). */
export const tryParseQuizWsEvent = (raw: unknown): QuizWsEvent | null => {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (Array.isArray(raw)) {
    return raw.length > 0 ? tryParseQuizWsEvent(raw[0]) : null;
  }
  if (typeof raw !== "object") {
    return null;
  }

  const o = raw as Record<string, unknown>;
  const tRaw =
    typeof o.type === "string"
      ? o.type
      : typeof o.event === "string"
        ? o.event
        : typeof o.action === "string"
          ? o.action
          : null;

  const payloadRoot = o.payload ?? o.data ?? o.body;

  /** type 없이 문항 필드만 오는 백엔드 */
  if (typeof tRaw !== "string") {
    const hasQuizShape =
      (typeof o.quiz_id === "string" && o.quiz_id.trim()) ||
      typeof o.quizId === "string" ||
      o.options !== undefined ||
      o.choices !== undefined;
    if (hasQuizShape) {
      return tryParseQuizStartedEvent(raw, { type: "quiz_started", payload: undefined });
    }
    return null;
  }

  const t = normalizeQuizEventTypeName(tRaw);
  if (t === "quiz_started") {
    const merged =
      payloadRoot && typeof payloadRoot === "object"
        ? { ...o, type: "quiz_started", payload: payloadRoot }
        : { ...o, type: "quiz_started" };
    return tryParseQuizStartedEvent(merged, merged as { type: string; payload?: unknown });
  }

  if (t === "session_joined") {
    const src =
      payloadRoot && typeof payloadRoot === "object" && !Array.isArray(payloadRoot)
        ? (payloadRoot as Record<string, unknown>)
        : o;
    const pcRaw = src.participant_count ?? src.participantCount;
    const participant_count =
      typeof pcRaw === "number" && Number.isFinite(pcRaw)
        ? Math.round(pcRaw)
        : typeof pcRaw === "string" && pcRaw.trim()
          ? Number(pcRaw.trim())
          : Number.NaN;
    if (!Number.isFinite(participant_count)) {
      return null;
    }
    const nickname = coerceRenderableText(src.nickname).trim() || "참여자";
    const user_id =
      typeof src.user_id === "string" && src.user_id.trim()
        ? src.user_id.trim()
        : typeof src.userId === "string" && src.userId.trim()
          ? src.userId.trim()
          : undefined;
    const role =
      typeof src.role === "string" && src.role.trim() ? src.role.trim() : undefined;
    return {
      type: "session_joined",
      payload: { participant_count, nickname, user_id, role },
    };
  }

  if (t === "session_ended") {
    const pl =
      payloadRoot && typeof payloadRoot === "object" && !Array.isArray(payloadRoot)
        ? (payloadRoot as Record<string, unknown>)
        : o;
    const session_id =
      typeof pl.session_id === "string" && pl.session_id.trim()
        ? pl.session_id.trim()
        : typeof o.session_id === "string" && o.session_id.trim()
          ? o.session_id.trim()
          : "";
    if (!session_id) {
      return null;
    }
    return { type: "session_ended", payload: { session_id } };
  }

  const p = payloadRoot;
  if (!p || typeof p !== "object") {
    return null;
  }
  switch (t) {
    case "answer_update": {
      const pl = p as {
        total?: number;
        answered?: number;
        rate?: number;
        distribution?: number[];
      };
      if (typeof pl.total !== "number" || typeof pl.answered !== "number" || typeof pl.rate !== "number") {
        return null;
      }
      const distribution = Array.isArray(pl.distribution)
        ? pl.distribution.map((n) => (typeof n === "number" && Number.isFinite(n) ? n : 0))
        : [];
      return {
        type: "answer_update",
        payload: {
          total: pl.total,
          answered: pl.answered,
          rate: pl.rate,
          distribution,
        },
      };
    }
    case "participant_answer": {
      const pl = p as { nickname?: unknown; quiz_id?: string; submitted?: boolean };
      if (typeof pl.quiz_id !== "string" || typeof pl.submitted !== "boolean") {
        return null;
      }
      const nickname = coerceRenderableText(pl.nickname).trim() || "참여자";
      return { type: "participant_answer", payload: { nickname, quiz_id: pl.quiz_id, submitted: pl.submitted } };
    }
    case "answer_revealed": {
      const pl = p as { correct_option?: number; explanation?: unknown };
      if (typeof pl.correct_option !== "number") {
        return null;
      }
      const explanation =
        pl.explanation === null || pl.explanation === undefined
          ? null
          : coerceRenderableText(pl.explanation) || null;
      return {
        type: "answer_revealed",
        payload: { correct_option: pl.correct_option, explanation },
      };
    }
    case "error": {
      const pl = p as { message?: unknown };
      const message = coerceRenderableText(pl.message).trim() || "오류가 발생했습니다.";
      return { type: "error", payload: { message } };
    }
    default:
      return null;
  }
};
