"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowSteps } from "@/components/common/flow-steps";
import { HelperTip } from "@/components/common/helper-tip";
import { PageHero } from "@/components/common/page-hero";
import { TechDetails } from "@/components/common/tech-details";
import { Input } from "@/components/ui/input";
import { useJoinSessionMutation } from "@/hooks/api/use-join-session-mutation";
import type { Session } from "@/types/api";

export default function StudentJoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joinedSession, setJoinedSession] = useState<Session | null>(null);
  const joinSessionMutation = useJoinSessionMutation();

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = await joinSessionMutation.mutateAsync({ joinCode });
      setJoinedSession(data);
      toast.success("퀴즈방에 입장했습니다!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "입장에 실패했습니다. 참여코드를 다시 확인해주세요.";
      toast.error(message);
    }
  };

  return (
    <section className="space-y-6">
      <PageHero
        eyebrow="Join"
        title="퀴즈방 입장"
        description="강사님이 알려준 참여코드만 입력하면 바로 연결돼요. 수업에 먼저 신청해야 하는 경우, 아래에서 수업 신청으로 이동할 수 있습니다."
        actions={
          <Link href="/student/lectures" className={cn(buttonVariants({ variant: "outline" }))}>
            수업 신청하러 가기
          </Link>
        }
      />
      <FlowSteps
        className="max-w-3xl"
        steps={[
          { title: "코드 확인", description: "슬라이드·채팅·QR 등에서 공유된 영숫자 코드를 확인해요." },
          { title: "입력 후 입장", description: "대소문자는 자동으로 맞춰 드려요." },
          { title: "퀴즈 시작 대기", description: "강사님이 문항을 열면 자동으로 이어져요." },
        ]}
      />

      <Card className="mx-auto max-w-xl border-border/80 shadow-md">
        <CardHeader>
          <CardTitle>참여코드</CardTitle>
          <CardDescription>공백 없이 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="참여코드 6자리"
              required
              className="h-12 text-center text-xl tracking-[0.35em]"
            />
            <Button type="submit" disabled={joinSessionMutation.isPending} className="h-11 w-full">
              {joinSessionMutation.isPending ? "참여 중..." : "참여하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <HelperTip
        title="플레이 시작 전"
        steps={[
          "참여가 거절되면 먼저 수업 신청(강의 목록)에서 해당 과목을 신청했는지 확인하세요.",
          "문항은 한 화면에 하나씩 노출됩니다.",
          "선택지 클릭 시 즉시 피드백이 제공됩니다.",
          "종료 후 개인 리포트를 확인할 수 있습니다.",
        ]}
      />
      {joinedSession && (
        <Card className="mx-auto max-w-xl border-primary/25 bg-gradient-to-br from-primary/[0.06] to-card shadow-md">
          <CardHeader>
            <CardTitle>입장 완료</CardTitle>
            <CardDescription>이제 실시간 퀴즈 화면으로 이동할 수 있어요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">내가 입력한 코드</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-primary">
                {joinedSession.session_code}
              </p>
            </div>
            <Button
              type="button"
              className="h-11 w-full text-base"
              onClick={() => router.push(`/student/play?sessionId=${joinedSession.session_id}`)}
            >
              실시간 퀴즈로 이동
            </Button>
            <TechDetails title="나중에 결과 보기">
              <p className="text-muted-foreground">
                종료 후에는 <strong className="font-medium text-foreground">내 홈 · 결과</strong>에서 참여한 퀴즈 목록으로
                다시 볼 수 있어요. (서버에 내 기록 API가 연동된 경우)
              </p>
              <p className="mt-2 break-all font-mono text-[11px] text-foreground">{joinedSession.session_id}</p>
            </TechDetails>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
