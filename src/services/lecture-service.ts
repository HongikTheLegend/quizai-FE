import axios from "axios";
import { toast } from "sonner";

import { apiClient, apiRequest } from "@/lib/api-client";
import { coerceRenderableText } from "@/lib/normalize-quiz-shape";
import type { Lecture, LectureEnrollResponse, LecturesListResponse, UploadLectureRequest } from "@/types/api";

/**
 * `NEXT_PUBLIC_API_URL` 이 비어 있으면 브라우저는 `/api/proxy` 로 올립니다.
 * Vercel Serverless는 요청 본문이 수 MB를 넘기 쉽게 **413 Content Too Large** 를 반환합니다(멀티파트 오버헤드 포함).
 */
export const MAX_LECTURE_UPLOAD_VIA_PROXY_BYTES = 4 * 1024 * 1024;

/** 한도 초과 시 true 반환(토스트만 이미 띄움). */
export function notifyIfLectureFileTooLarge(file: File): boolean {
  if (file.size <= MAX_LECTURE_UPLOAD_VIA_PROXY_BYTES) {
    return false;
  }
  const mb = (file.size / (1024 * 1024)).toFixed(1);
  const limMb = Math.round(MAX_LECTURE_UPLOAD_VIA_PROXY_BYTES / (1024 * 1024));
  toast.error(`이 파일은 업로드할 수 없습니다. (${mb}MB — 약 ${limMb}MB 이하만 가능해요)`);
  return true;
}

const normalizeLecture = (raw: unknown): Lecture => {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    lecture_id: coerceRenderableText(r.lecture_id) || String(r.lecture_id ?? ""),
    title: coerceRenderableText(r.title) || "강의",
    file_url: typeof r.file_url === "string" ? r.file_url : undefined,
    text_length: typeof r.text_length === "number" ? r.text_length : undefined,
    quiz_count: typeof r.quiz_count === "number" ? r.quiz_count : undefined,
    created_at: typeof r.created_at === "string" ? r.created_at : new Date().toISOString(),
    is_enrolled: typeof r.is_enrolled === "boolean" ? r.is_enrolled : undefined,
  };
};

interface LectureUploadResponse {
  lecture_id: string;
  title: string;
  file_url: string;
  text_length: number;
  created_at: string;
}

export const lectureService = {
  async list(page = 1, limit = 20): Promise<LecturesListResponse> {
    const res = await apiRequest<LecturesListResponse>({
      method: "GET",
      url: "/lectures",
      params: { page, limit },
    });
    const lectures = Array.isArray(res.lectures) ? res.lectures.map(normalizeLecture) : [];
    const total = typeof res.total === "number" ? res.total : lectures.length;
    return { lectures, total };
  },

  enroll(lectureId: string) {
    return apiRequest<LectureEnrollResponse, Record<string, never>>({
      method: "POST",
      url: `/lectures/${encodeURIComponent(lectureId)}/enroll`,
      data: {},
    });
  },

  async uploadPdf(payload: UploadLectureRequest): Promise<Lecture> {
    if (notifyIfLectureFileTooLarge(payload.file)) {
      throw new Error("FILE_TOO_LARGE_FOR_VERCEL_PROXY");
    }

    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.title) {
      formData.append("title", payload.title);
    }
    if (payload.lectureId) {
      formData.append("lecture_id", payload.lectureId);
    }
    try {
      const response = await apiClient.post<LectureUploadResponse>("/lectures/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return normalizeLecture(response.data as unknown);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 413) {
        toast.error("이 파일은 서버 용량 제한으로 업로드할 수 없습니다. 더 작은 파일로 시도해 주세요.");
      }
      throw e;
    }
  },
};
