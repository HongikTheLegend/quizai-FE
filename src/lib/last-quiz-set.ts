const STORAGE_KEY = "quizai:lastQuizSet";

export type LastQuizSetInfo = {
  quizSetId: string;
  lectureTitle?: string;
  totalQuestions: number;
  updatedAt: string;
};

export function saveLastQuizSet(info: {
  quizSetId: string;
  lectureTitle?: string;
  totalQuestions: number;
}): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: LastQuizSetInfo = {
      ...info,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage full or disabled
  }
}

export function readLastQuizSet(): LastQuizSetInfo | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as LastQuizSetInfo;
    if (typeof parsed.quizSetId !== "string" || !parsed.quizSetId.trim()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
