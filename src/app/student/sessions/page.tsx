import { redirect } from "next/navigation";

/** 퀴즈 결과는 개인 대시보드에서 확인합니다. */
export default function StudentSessionsRedirectPage() {
  redirect("/student/dashboard?open=quiz-results");
}
