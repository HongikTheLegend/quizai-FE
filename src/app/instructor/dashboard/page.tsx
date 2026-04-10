"use client";

import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/page-hero";
import { StatTile } from "@/components/common/stat-tile";
import { useInstructorDashboardQuery } from "@/hooks/api/use-instructor-dashboard-query";

export default function InstructorDashboardPage() {
  const dashboardQuery = useInstructorDashboardQuery();
  const data = dashboardQuery.data;
  const recent = data?.recent_sessions ?? [];

  return (
    <section className="space-y-6">
      <PageHero
        eyebrow="Instructor home"
        title="안녕하세요, 남혁님"
        description={`오늘 수업 참여율은 약 ${Math.round(data?.avg_participation_rate ?? 0)}%예요. 정답률이 낮은 문항부터 짧게 보충하면 학습 효과가 커집니다.`}
        actions={
          <>
            <Button onClick={() => window.location.assign("/instructor/lectures")}>자료 올리고 퀴즈 만들기</Button>
            <Button variant="outline" onClick={() => window.location.assign("/instructor/sessions")}>
              라이브 퀴즈 열기
            </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile
          title="진행한 라이브 퀴즈"
          description="누적 횟수"
          value={String(data?.total_sessions ?? 0)}
          delta={dashboardQuery.isFetching ? "동기화 중" : "최신"}
        />
        <StatTile
          title="평균 참여율"
          description="학생 참여 비율"
          value={`${Math.round(data?.avg_participation_rate ?? 0)}%`}
          delta="실시간"
        />
        <StatTile
          title="평균 정답률"
          description="문항별 정답 비율"
          value={`${Math.round(data?.avg_correct_rate ?? 0)}%`}
          delta={`품질 ${Math.round(data?.quality_score.total ?? 0)}점`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">최근 수업 이해도</p>
          <div className="mt-3 space-y-3">
            {recent.length > 0 ? (
              recent.slice(0, 4).map((session) => (
                <div key={session.session_id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{session.lecture_title}</span>
                    <span>{Math.round(session.avg_score)}점</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                      style={{ width: `${Math.min(100, Math.max(0, session.avg_score))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">아직 표시할 라이브 퀴즈 기록이 없습니다.</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">AI 인사이트</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="rounded-xl border border-border/80 bg-primary/[0.06] p-3 text-foreground">
              3번 문항의 정답률이 낮아요. 보충 설명을 넣어 볼까요?
            </p>
            <p className="rounded-xl border border-border/60 p-3">
              평균 점수가 70점 이하인 퀴즈는 난이도나 시간을 조정해 보는 것이 좋습니다.
            </p>
            <p className="rounded-xl border border-border/60 p-3">
              다음 라이브 전, 오답이 많았던 개념을 5분 요약으로 복습해 보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
