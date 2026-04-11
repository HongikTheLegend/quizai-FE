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
export default function StudentJoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const joinSessionMutation = useJoinSessionMutation();

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = await joinSessionMutation.mutateAsync({ joinCode });
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
              onChange={(event) => setJoinCode(event.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="강의에서 안내받은 참여 코드"
              required
              minLength={1}
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
