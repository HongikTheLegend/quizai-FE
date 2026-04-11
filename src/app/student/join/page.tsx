"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/common/page-hero";
import { StudentFlowRail } from "@/components/student/student-flow-rail";
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
      <StudentFlowRail />
      <PageHero
        title="참여 코드"
        description="강의에서 안내받은 코드를 입력하면 퀴즈 화면으로 연결됩니다."
        actions={
          <Link href="/student/lectures" className={cn(buttonVariants({ variant: "outline" }))}>
            강의 신청
          </Link>
        }
      />

      <Card className="mx-auto max-w-xl border-border/80 shadow-md">
        <CardHeader>
          <CardTitle>코드 입력</CardTitle>
          <CardDescription>영문·숫자 조합, 공백 없이 입력하세요.</CardDescription>
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
      {joinedSession && (
        <Card className="mx-auto max-w-xl border-primary/25 bg-gradient-to-br from-primary/[0.06] to-card shadow-md">
          <CardHeader>
            <CardTitle>입장했습니다</CardTitle>
            <CardDescription>퀴즈가 시작되면 아래에서 화면으로 이동하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">참여 코드</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-primary">
                {joinedSession.session_code}
              </p>
            </div>
            <Button
              type="button"
              className="h-11 w-full text-base"
              onClick={() => router.push(`/student/play?sessionId=${joinedSession.session_id}`)}
            >
              퀴즈 화면 열기
            </Button>
            <TechDetails title="세션 참조 번호">
              <p className="break-all font-mono text-[11px] text-muted-foreground">{joinedSession.session_id}</p>
            </TechDetails>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
