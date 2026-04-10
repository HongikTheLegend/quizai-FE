"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { ConnectionStatus } from "@/components/common/connection-status";
import { FlowSteps } from "@/components/common/flow-steps";
import { HelperTip } from "@/components/common/helper-tip";
import { LiveQuizStatusPanel } from "@/components/common/live-quiz-status-panel";
import { PageHero } from "@/components/common/page-hero";
import { TechDetails } from "@/components/common/tech-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuizDeadlineCountdown } from "@/hooks/use-quiz-deadline-countdown";
import { useStartSessionMutation } from "@/hooks/api/use-start-session-mutation";
import { useQuizSocket } from "@/hooks/use-quiz-socket";
import type { QuizWsEvent } from "@/lib/quiz-ws-live-state";
import { liveRoomPhaseLabel } from "@/lib/session-user-copy";
import type { Session, StartSessionRequest } from "@/types/api";

function describeLiveEvent(event: QuizWsEvent | null): string {
  if (!event) {
    return "아직 표시할 활동이 없어요. 학생이 입장하거나 문항이 시작되면 이곳에 요약됩니다.";
  }
  switch (event.type) {
    case "session_joined":
      return `${event.payload.nickname}님이 퀴즈방에 들어왔습니다. (함께하는 인원 약 ${event.payload.participant_count}명)`;
    case "quiz_started":
      return "새 문항이 시작되었습니다. 수강생 화면에 문제가 열렸는지 확인하세요.";
    case "answer_update":
      return `응답 현황: ${event.payload.answered}/${event.payload.total}명 제출 (${Math.round(event.payload.rate)}%).`;
    case "participant_answer":
      return `${event.payload.nickname}님이 현재 문항 답안을 ${event.payload.submitted ? "제출했습니다" : "취소/대기 상태입니다"}.`;
    case "answer_revealed":
      return "정답이 공개되었습니다.";
    case "session_ended":
      return "이번 라이브 퀴즈가 종료되었습니다.";
    case "error":
      return `알림: ${event.payload.message}`;
    default:
      return "새로운 활동이 감지되었습니다.";
  }
}

export default function InstructorSessionsPage() {
  const [quizSetId, setQuizSetId] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [session, setSession] = useState<Session | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [answer, setAnswer] = useState("0");
  const startSessionMutation = useStartSessionMutation();

  const sessionId = session?.session_id ?? "";

  const socket = useQuizSocket({
    sessionId,
    directWsUrl: session?.ws_url,
    enabled: Boolean(session?.session_id),
  });

  const active = socket.liveSession.activeQuiz;
  const deadlineMs = active ? active.startedAt + active.time_limit * 1000 : null;
  const remainingSec = useQuizDeadlineCountdown(deadlineMs);

  const activitySummary = useMemo(() => describeLiveEvent(socket.lastEvent), [socket.lastEvent]);
  const rawEventText = useMemo(
    () => (socket.lastEvent ? JSON.stringify(socket.lastEvent, null, 2) : ""),
    [socket.lastEvent],
  );

  const handleStartSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload: StartSessionRequest = {
        quiz_set_id: quizSetId,
        time_limit: Number(timeLimit),
      };
      const startedSession = await startSessionMutation.mutateAsync(payload);
      setSession(startedSession);
      toast.success("라이브 퀴즈방이 열렸습니다. 참여코드를 학생에게 알려주세요.");
    } catch {
      // api-client 인터셉터에서 토스트를 처리합니다.
    }
  };

  const handleCopyJoinCode = async () => {
    if (!session?.session_code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(session.session_code);
      toast.success("참여코드를 복사했습니다.");
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  const handleSendAnnouncement = () => {
    if (!announcement.trim()) {
      toast.error("공지 내용을 입력해주세요.");
      return;
    }
    toast.success("수강생에게 공지를 보냈습니다.");
    setAnnouncement("");
  };

  return (
    <section className="space-y-8">
      <PageHero
        eyebrow="Live classroom"
        title="라이브 퀴즈 운영"
        description="퀴즈 세트만 준비되어 있으면 방을 열고, 학생은 참여코드만으로 입장합니다. 복잡한 기술 용어 없이 수업 흐름에 집중하세요."
      />

      <FlowSteps
        steps={[
          {
            title: "퀴즈방 열기",
            description: "만들어 둔 퀴즈 세트와 문항당 시간만 정하면 방이 생성됩니다.",
          },
          {
            title: "참여코드 공유",
            description: "화면에 나온 코드를 수업 채팅·QR 등으로 나눠 주세요.",
          },
          {
            title: "함께 보기",
            description: "입장·응답 현황을 이 페이지에서 한눈에 확인합니다.",
          },
        ]}
      />

      <HelperTip
        title="운영 팁"
        steps={[
          "코드를 공유한 뒤 30초 정도 기다렸다가 문항을 시작하면 입장률이 올라갑니다.",
          "응답이 늦으면 난이도·시간을 점검해 보세요.",
          "문제가 있으면 아래 ‘고급 · 기술 정보’에서 연결 진단에 쓰는 값을 복사할 수 있습니다.",
        ]}
      />

      <Card className="border-primary/15 bg-gradient-to-br from-card to-primary/[0.03] shadow-sm">
        <CardHeader>
          <CardTitle>AI 운영 코멘트</CardTitle>
          <CardDescription>응답 패턴을 가정한 예시입니다. 실제 분석 API 연동 시 자동으로 갱신할 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="rounded-xl border border-border/80 bg-card/90 p-3 leading-relaxed shadow-sm">
            3번 문항의 응답 분산이 큽니다. 정답 공개 전 짧은 힌트를 주면 이해도가 올라갑니다.
          </p>
          <p className="rounded-xl border border-border/60 bg-muted/40 p-3 leading-relaxed">
            평균 풀이 시간이 길어지고 있어요. 다음 문항은 선택지를 하나 줄이거나 시간을 10초 늘려 보세요.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>퀴즈방 만들기</CardTitle>
          <CardDescription>생성 즉시 참여코드가 나옵니다. 학생 앱에서는 이 코드만 입력하면 됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleStartSession} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">퀴즈 세트</label>
              <Input
                value={quizSetId}
                onChange={(e) => setQuizSetId(e.target.value)}
                placeholder="예: qs_로 시작하는 세트 ID"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">문항당 제한(초)</label>
              <Input
                type="number"
                min={10}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={startSessionMutation.isPending} className="w-full md:w-auto">
                {startSessionMutation.isPending ? "만드는 중…" : "퀴즈방 열기"}
              </Button>
            </div>
          </form>

          {session ? (
            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">참여코드</p>
                  <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em] text-primary md:text-4xl">
                    {session.session_code}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    진행 단계: <span className="font-medium text-foreground">{liveRoomPhaseLabel(session.status)}</span>
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={handleCopyJoinCode}>
                  코드 복사
                </Button>
              </div>
              <TechDetails title="고급 · 기술 정보 (지원·연동용)">
                <p className="break-all text-muted-foreground">
                  <span className="font-medium text-foreground">내부 방 ID:</span> {session.session_id}
                </p>
                <p className="mt-2 break-all text-muted-foreground">
                  <span className="font-medium text-foreground">실시간 주소:</span> {session.ws_url}
                </p>
              </TechDetails>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>라이브 활동</CardTitle>
            <CardDescription>지금 퀴즈방에서 일어나는 일을 쉬운 말로 보여 줍니다.</CardDescription>
          </div>
          <ConnectionStatus isConnected={socket.isConnected} />
        </CardHeader>
        <CardContent className="space-y-4">
          {!sessionId ? (
            <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              위에서 퀴즈방을 연 뒤에 실시간 활동이 여기에 표시됩니다.
            </p>
          ) : (
            <>
              <LiveQuizStatusPanel
                variant="instructor"
                live={socket.liveSession}
                remainingSec={remainingSec}
                isConnected={socket.isConnected}
              />
              <p className="rounded-xl border border-border/80 bg-card p-4 text-sm leading-relaxed">{activitySummary}</p>
              <TechDetails title="원본 이벤트 데이터 (개발·디버그)">
                {rawEventText ? (
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
                    {rawEventText}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">이벤트 없음</p>
                )}
              </TechDetails>
            </>
          )}

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">테스트용 · 답안 보내기</p>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="문항 ID (예: q_001)"
                disabled={!sessionId}
              />
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="선택한 보기 번호 (0부터)"
                disabled={!sessionId}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => socket.sendAnswer(questionId, Number(answer))}
                disabled={!sessionId || !questionId.trim() || Number.isNaN(Number(answer))}
              >
                테스트 제출
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>수업 공지</CardTitle>
          <CardDescription>수강생에게 한 줄 공지를 보냅니다. (연동 시 실제 채널로 전송되도록 확장 가능)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="예: 잠시 후 2번째 퀴즈를 시작합니다."
            />
            <Button type="button" onClick={handleSendAnnouncement}>
              공지 보내기
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
