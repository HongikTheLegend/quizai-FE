import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/common/page-hero";
import { StatTile } from "@/components/common/stat-tile";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <PageHero
        title="운영자 대시보드"
        description="서비스 상태, 사용자 권한, 세션 품질을 통합 모니터링합니다."
        className="from-slate-500/10 via-emerald-500/10 to-sky-500/10"
        actions={
          <>
          <Button asChild>
            <a href="/admin/users">사용자 관리</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/sessions">세션 모니터링</a>
          </Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile title="전체 사용자" description="학생/교강사/관리자 합계" value="0" />
        <StatTile title="오늘 세션 수" description="생성된 세션 기준" value="0" />
        <StatTile title="시스템 상태" description="API/WS 가용성 모니터링" value="정상" />
      </div>
    </section>
  );
}
