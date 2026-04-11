"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { queryKeys } from "@/lib/query-keys";
import { sessionService } from "@/services/session-service";

export const useSessionResultQuery = (sessionId: string) =>
  useQuery({
    queryKey: queryKeys.sessions.result(sessionId),
    queryFn: () => sessionService.getResult(sessionId),
    enabled: sessionId.trim().length > 0,
    /** 403·404·401 은 재시도 무의미(백엔드 권한·세션 불일치) */
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const s = error.response?.status;
        if (s === 403 || s === 404 || s === 401) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
