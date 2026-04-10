"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { LiveQuizStatusPanel } from "@/components/common/live-quiz-status-panel";
import { PageHero } from "@/components/common/page-hero";
import { TechDetails } from "@/components/common/tech-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizDeadlineCountdown } from "@/hooks/use-quiz-deadline-countdown";
import { useQuizSocket } from "@/hooks/use-quiz-socket";
import { AUTH_KEYS, getStoredUser } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";

const FALLBACK_QUESTION = {
  quiz_id: "preview-1",
  question: "지도학습과 비지도학습의 가장 큰 차이는 무엇인가요?",
  options: [
    "레이블 데이터 사용 여부",
    "모델의 실행 속도",
    "GPU 사용 여부",
    "데이터셋 파일 형식",
  ],
  time_limit: 30,
};

function StudentPlayContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const user = getStoredUser();
  const token =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_KEYS.accessToken) : null;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const socket = useQuizSocket({
    sessionId,
    enabled: sessionId.length > 0,
    nickname: user?.name ?? "student",
    token: token ?? undefined,
  });

  const active = socket.liveSession.activeQuiz;

  const currentQuestion = useMemo(() => {
    if (active) {
      return {
        quiz_id: active.quiz_id,
        question: active.question,
        options: active.options,
        time_limit: active.time_limit,
      };
    }
    return FALLBACK_QUESTION;
  }, [active]);

  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
  }, [active?.quiz_id]);

  const deadlineMs = active ? active.startedAt + active.time_limit * 1000 : null;
  const remainingSec = useQuizDeadlineCountdown(deadlineMs);

  const handleSubmit = () => {
    if (selectedOption === null) {
      toast.error("답을 고른 뒤 제출해주세요.");
      return;
    }
    socket.sendAnswer(currentQuestion.quiz_id, selectedOption);
    setSubmitted(true);
    toast.success("답안을 보냈어요.");
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <PageHero
        eyebrow="Live quiz"
        title="실시간 퀴즈"
        description="강사님이 문항을 열면 제한 시간이 바로 시작돼요. 아래에서 남은 시간·참여 인원·제출 현황을 함께 볼 수 있습니다."
      />

      {sessionId ? (
        <LiveQuizStatusPanel
          variant="student"
          live={socket.liveSession}
          remainingSec={remainingSec}
          isConnected={socket.isConnected}
          selfSubmitted={submitted}
        />
      ) : null}

      <Card className="overflow-hidden border-border/80 shadow-md">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <CardTitle className="text-base">연결</CardTitle>
          <CardDescription>
            {sessionId
              ? "퀴즈방과 연결되어 있으면 실시간으로 갱신됩니다."
              : "주소에 방 정보가 없어요. ‘퀴즈방 입장’에서 참여코드를 입력해 주세요."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {sessionId ? (
            <TechDetails title="문제가 있을 때만 · 연결 정보">
              <p className="break-all text-muted-foreground">
                내부 방 ID: <span className="font-mono text-foreground">{sessionId}</span>
              </p>
            </TechDetails>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg leading-snug md:text-xl">{currentQuestion.question}</CardTitle>
          <CardDescription>
            {active
              ? `강사가 연 문항 · 제한 ${currentQuestion.time_limit}초`
              : `예시 문항(강사 연결 전) · 제한 ${currentQuestion.time_limit}초`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={`${currentQuestion.quiz_id}-${index}`}
              type="button"
              onClick={() => {
                setSelectedOption(index);
                setSubmitted(false);
              }}
              className={cn(
                "w-full rounded-2xl border px-4 py-3.5 text-left text-sm transition-all",
                selectedOption === index
                  ? "border-primary bg-primary/10 font-medium text-primary shadow-sm ring-2 ring-primary/20"
                  : "border-border/90 bg-card hover:border-primary/30 hover:bg-muted/50",
              )}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              {option}
            </button>
          ))}
          <Button
            onClick={handleSubmit}
            className="mt-2 h-11 w-full text-base"
            size="lg"
            disabled={!active}
          >
            {active ? "답안 제출하기" : "강사가 문항을 열면 제출할 수 있어요"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default function StudentPlayPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-2xl space-y-6">
          <Card className="border-dashed shadow-sm">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              퀴즈 화면을 준비하고 있어요…
            </CardContent>
          </Card>
        </section>
      }
    >
      <StudentPlayContent />
    </Suspense>
  );
}
