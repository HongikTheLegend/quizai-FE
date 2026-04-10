"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHero } from "@/components/common/page-hero";
import { SessionResultPanel } from "@/components/student/session-result-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelperTip } from "@/components/common/helper-tip";
import { StatTile } from "@/components/common/stat-tile";
import { useSessionResultQuery } from "@/hooks/api/use-session-result-query";
import { useStudentQuizResultsQuery } from "@/hooks/api/use-student-quiz-results-query";
import { getStoredUser } from "@/lib/auth-storage";
import { gradeLabelKo } from "@/lib/session-user-copy";
import { cn } from "@/lib/utils";

function StudentDashboardInner() {
  const user = getStoredUser();
  const searchParams = useSearchParams();
  const myResultsQuery = useStudentQuizResultsQuery();
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const resultQuery = useSessionResultQuery(selectedSessionId);

  useEffect(() => {
    const fromQuery = searchParams.get("open") === "quiz-results";
    const fromHash = typeof window !== "undefined" && window.location.hash === "#quiz-results";
    if (fromQuery || fromHash) {
      window.requestAnimationFrame(() => {
        document.getElementById("quiz-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const list = myResultsQuery.data?.results ?? [];
    if (list.length > 0 && !selectedSessionId) {
      setSelectedSessionId(list[0].session_id);
    }
  }, [myResultsQuery.data?.results, selectedSessionId]);

  const summaries = myResultsQuery.data?.results ?? [];

  return (
    <section className="space-y-6">
      <PageHero
        eyebrow="Learner home"
        title="나의 학습 홈"
        description="참여한 퀴즈 결과는 여기 모입니다. 기록 번호를 외울 필요 없이, 로그인한 계정 기준으로 목록이 채워집니다."
        actions={
          <>
            <Button variant="outline" onClick={() => window.location.assign("/student/lectures")}>
              수업 신청
            </Button>
            <Button onClick={() => window.location.assign("/student/join")}>퀴즈방 입장</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile title="이해도 점수" description="오늘 학습 기준" value="85%" delta="+7%" />
        <StatTile title="평균 점수" description="최근 3회 기준" value="78점" delta="+4점" />
        <StatTile title="정답률" description="전체 문제 대비" value="82%" delta="+6.5%" />
      </div>

      <Card id="quiz-results" className="scroll-mt-6 border-primary/15 shadow-sm">
        <CardHeader>
          <CardTitle>내 퀴즈 결과</CardTitle>
          <CardDescription>
            서버가 <code className="rounded bg-muted px-1 text-xs">GET /students/me/quiz-results</code>를 제공하면
            자동으로 목록이 나옵니다. 항목을 누르면 상세 집계를 불러옵니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {myResultsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">참여 기록을 불러오는 중…</p>
          ) : myResultsQuery.isError ? (
            <p className="text-sm text-destructive">목록을 불러오지 못했습니다. 백엔드 경로를 확인해주세요.</p>
          ) : summaries.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              아직 연동된 퀴즈 기록이 없습니다. 라이브 퀴즈에 참여하면 여기에 쌓입니다.
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {summaries.map((row) => (
                <li key={row.session_id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionId(row.session_id)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left text-sm transition-all",
                      selectedSessionId === row.session_id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 bg-card hover:border-primary/30",
                    )}
                  >
                    <p className="font-semibold text-foreground">{row.title ?? "퀴즈 세션"}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{row.session_id}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {row.attended_at ? <span>{new Date(row.attended_at).toLocaleString()}</span> : null}
                      {typeof row.my_score === "number" ? (
                        <span className="font-medium text-foreground">내 점수 {row.my_score}점</span>
                      ) : null}
                      {row.grade ? (
                        <span className="rounded-full bg-muted px-2 py-0.5">{gradeLabelKo(row.grade)}</span>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedSessionId ? (
            <div className="border-t border-border/80 pt-6">
              <p className="mb-3 text-sm font-medium text-foreground">선택한 퀴즈 상세</p>
              <SessionResultPanel
                result={resultQuery.data}
                isLoading={resultQuery.isFetching}
                highlightUserId={user?.id}
                highlightNickname={user?.name}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>오답 노트 (AI 요약)</CardTitle>
            <CardDescription>오늘 놓친 핵심 개념을 AI가 정리했습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 과적합: 학습 데이터에 지나치게 맞춰 일반화 성능이 낮아진 상태</p>
            <p>• 정규화: 모델 복잡도를 제한해 과적합을 줄이는 기법</p>
            <p>• 실전 팁: 오답 문항의 정답 근거를 한 줄로 다시 써보기</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>플레이 성장 트랙</CardTitle>
            <CardDescription>게임처럼 진행되는 학습 성장 지표</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>참여왕 배지</span>
                <span>60%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span>정답률 마스터</span>
                <span>25%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <HelperTip
        title="학습 효율 올리기"
        steps={[
          "퀴즈방에 나온 직후, 오답만 골라 짧게 복습하세요.",
          "주 3회 이상 짧은 퀴즈로 기억을 고정하세요.",
          "점수보다 정답 근거를 설명하는 연습을 해보세요.",
        ]}
      />
    </section>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-6 p-4 text-sm text-muted-foreground">대시보드를 불러오는 중…</section>
      }
    >
      <StudentDashboardInner />
    </Suspense>
  );
}
