import { apiRequest } from "@/lib/api-client";
import type { StudentMyQuizResultsResponse } from "@/types/api";

export const studentService = {
  listMyQuizResults() {
    return apiRequest<StudentMyQuizResultsResponse>({
      method: "GET",
      url: "/students/me/quiz-results",
    });
  },
};
