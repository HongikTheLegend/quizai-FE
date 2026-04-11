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
import { Input } from "@/components/ui/input";
import { useJoinSessionMutation } from "@/hooks/api/use-join-session-mutation";
import {
  JOIN_CODE_MAX_LENGTH,
  JOIN_CODE_MIN_LENGTH,
  normalizeJoinCode,
} from "@/lib/join-code";
import { rememberSessionWsUrl } from "@/lib/session-ws-url";

export default function StudentJoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const joinSessionMutation = useJoinSessionMutation();

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const code = normalizeJoinCode(joinCode);
      if (code.length < JOIN_CODE_MIN_LENGTH) {
        toast.error(`참여 코드를 ${JOIN_CODE_MIN_LENGTH}자 이상 입력해주세요.`);
        return;
      }
      const data = await joinSessionMutation.mutateAsync({ joinCode: code });
      rememberSessionWsUrl(data.session_id, data.ws_url);
      toast.success("퀴즈 화면으로 이동합니다.");
      router.push(`/student/play?sessionId=${encodeURIComponent(data.session_id)}`);
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
        description="교강사 화면에 표시된 참여 코드를 그대로 입력하면 됩니다. (코드 한 종류·길이는 서버가 정합니다)"
        actions={
          <Link href="/student/lectures" className={cn(buttonVariants({ variant: "outline" }))}>
            강의 신청
          </Link>
        }
      />

      <Card className="mx-auto max-w-xl border-border/80 shadow-md">
        <CardHeader>
          <CardTitle>코드 입력</CardTitle>
          <CardDescription>
            교강사「라이브 퀴즈」에 보이는 참여 코드와 동일합니다. 영문·숫자, 공백 없이{" "}
            {JOIN_CODE_MIN_LENGTH}~{JOIN_CODE_MAX_LENGTH}자.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              value={joinCode}
              onChange={(event) =>
                setJoinCode(event.target.value.toUpperCase().replace(/\s/g, "").slice(0, JOIN_CODE_MAX_LENGTH))
              }
              placeholder="예: 화면에 보이는 코드"
              required
              minLength={JOIN_CODE_MIN_LENGTH}
              maxLength={JOIN_CODE_MAX_LENGTH}
              autoComplete="off"
              inputMode="text"
              className="h-12 text-center font-mono text-xl tracking-[0.12em]"
            />
            <Button type="submit" disabled={joinSessionMutation.isPending} className="h-11 w-full">
              {joinSessionMutation.isPending ? "참여 중..." : "참여하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
