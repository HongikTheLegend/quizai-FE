import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/page-hero";
import { StatTile } from "@/components/common/stat-tile";

export default function StudentDashboardPage() {
  return (
    <section className="space-y-6">
      <PageHero
        title="수강생 대시보드"
        description="참여코드로 세션에 입장하고, 결과를 바로 확인하세요."
        className="from-violet-500/10 via-pink-500/10 to-amber-500/10"
        actions={
          <Button asChild>
            <a href="/student/join">세션 참여하기</a>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile title="참여 세션 수" description="누적 퀴즈 세션 참여 횟수" value="0" />
        <StatTile title="평균 점수" description="최근 응답 결과 기반" value="0점" />
        <StatTile title="정답률" description="전체 문제 대비" value="0%" />
      </div>
    </section>
  );
}
