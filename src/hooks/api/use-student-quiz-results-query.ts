"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { studentService } from "@/services/student-service";

export const useStudentQuizResultsQuery = () =>
  useQuery({
    queryKey: queryKeys.student.myQuizResults,
    queryFn: () => studentService.listMyQuizResults(),
  });
