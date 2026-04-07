import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/page-hero";
import { StatTile } from "@/components/common/stat-tile";

export default function InstructorDashboardPage() {
  return (
    <section className="space-y-6">
      <PageHero
        title="교강사 대시보드"
        description="강의 업로드부터 세션 운영까지 한 화면에서 관리하세요."
        className="from-indigo-500/10 via-cyan-500/10 to-emerald-500/10"
        actions={
          <>
          <Button asChild>
            <a href="/instructor/lectures">퀴즈 만들기</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/instructor/sessions">세션 시작</a>
          </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile title="내 강의 수" description="업로드 완료된 강의 자료" value="0" delta="+0 이번 주" />
        <StatTile title="진행 중 세션" description="현재 활성화된 퀴즈 세션" value="0" delta="대기 중" />
        <StatTile title="평균 정답률" description="최근 7일 기준" value="0%" delta="+0.0%" />
      </div>
    </section>
  );
}
