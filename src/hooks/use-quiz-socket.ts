"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  initialLiveSessionState,
  reduceLiveSessionState,
  tryParseQuizWsEvent,
  type LiveSessionState,
  type QuizWsEvent,
} from "@/lib/quiz-ws-live-state";

interface UseQuizSocketOptions {
  sessionId: string;
  directWsUrl?: string;
  enabled?: boolean;
  wsBaseUrl?: string;
  nickname?: string;
  token?: string;
  onQuizStarted?: (payload: QuizWsEvent & { type: "quiz_started" }) => void;
  onAnswerUpdate?: (payload: QuizWsEvent & { type: "answer_update" }) => void;
  onSessionEnded?: (payload: QuizWsEvent & { type: "session_ended" }) => void;
}

interface UseQuizSocketResult {
  isConnected: boolean;
  lastEvent: QuizWsEvent | null;
  liveSession: LiveSessionState;
  sendAnswer: (quizId: string, selectedOption: number) => void;
  disconnect: () => void;
}

const DEFAULT_WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL?.trim() || "wss://quizai-be.onrender.com";

export function useQuizSocket({
  sessionId,
  directWsUrl,
  enabled = true,
  wsBaseUrl = DEFAULT_WS_BASE_URL,
  nickname,
  token,
  onQuizStarted,
  onAnswerUpdate,
  onSessionEnded,
}: UseQuizSocketOptions): UseQuizSocketResult {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<QuizWsEvent | null>(null);
  const [liveSession, setLiveSession] = useState<LiveSessionState>(initialLiveSessionState);

  const url = useMemo(() => {
    if (directWsUrl) {
      return directWsUrl;
    }

    const params = new URLSearchParams();
    if (nickname) {
      params.set("nickname", nickname);
    }
    if (token) {
      params.set("token", token);
    }
    const query = params.toString();
    return `${wsBaseUrl}/sessions/${sessionId}/join${query ? `?${query}` : ""}`;
  }, [directWsUrl, nickname, sessionId, token, wsBaseUrl]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setLiveSession(initialLiveSessionState());
      setLastEvent(null);
      return;
    }

    setLiveSession(initialLiveSessionState());
    setLastEvent(null);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      toast.success("실시간 퀴즈방에 연결되었습니다.");
    };

    socket.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data) as unknown;
        const parsed = tryParseQuizWsEvent(raw);
        if (parsed) {
          setLastEvent(parsed);
          setLiveSession((prev) => reduceLiveSessionState(prev, parsed));

          if (parsed.type === "quiz_started") {
            onQuizStarted?.(parsed);
          }
          if (parsed.type === "answer_update") {
            onAnswerUpdate?.(parsed);
          }
          if (parsed.type === "session_ended") {
            onSessionEnded?.(parsed);
            toast.info("이번 퀴즈가 종료되었습니다.");
          }
        }
      } catch {
        toast.error("실시간 알림을 읽는 데 문제가 있었습니다.");
      }
    };

    socket.onerror = () => {
      toast.error("연결이 불안정합니다. 새로고침 후 다시 시도해주세요.");
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [
    enabled,
    onAnswerUpdate,
    onQuizStarted,
    onSessionEnded,
    sessionId,
    url,
  ]);

  const sendAnswer = useCallback((quizId: string, selectedOption: number) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error("아직 퀴즈방에 완전히 연결되지 않았어요. 잠시 후 다시 눌러주세요.");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "submit_answer",
        quiz_id: quizId,
        selected_option: selectedOption,
      }),
    );
  }, []);

  return {
    isConnected,
    lastEvent,
    liveSession,
    sendAnswer,
    disconnect,
  };
}
