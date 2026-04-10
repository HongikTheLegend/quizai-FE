"use client";

import { FormEvent, useState } from "react";

import { LiveQuizStatusPanel } from "@/components/common/live-quiz-status-panel";
import { PageHero } from "@/components/common/page-hero";
import { StatTile } from "@/components/common/stat-tile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuizDeadlineCountdown } from "@/hooks/use-quiz-deadline-countdown";
import { useQuizSocket } from "@/hooks/use-quiz-socket";
import { AUTH_KEYS } from "@/lib/auth-storage";

export default function AdminSessionsPage() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [wsUrlInput, setWsUrlInput] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [activeWsUrl, setActiveWsUrl] = useState<string | undefined>(undefined);

  const token =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_KEYS.accessToken) : null;

  const socket = useQuizSocket({
    sessionId: activeRoomId,
    directWsUrl: activeWsUrl,
    enabled: activeRoomId.length > 0,
    nickname: "운영-모니터",
    token: token ?? undefined,
  });

  const active = socket.liveSession.activeQuiz;
  const deadlineMs = active ? active.startedAt + active.time_limit * 1000 : null;
  const remainingSec = useQuizDeadlineCountdown(deadlineMs);

  const handleConnect = (e: FormEvent) => {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (!id) {
      return;
    }
    const ws = wsUrlInput.trim();
    setActiveRoomId(id);
    setActiveWsUrl(ws.length > 0 ? ws : undefined);
  };

  const handleDisconnect = () => {
    setActiveRoomId("");
    setActiveWsUrl(undefined);
  };

  return (
    <section className="space-y-8">
      <PageHero
        eyebrow="Operations"
        title="라이브 퀴즈 모니터링"
        description="내부 방 ID와(필요 시) WebSocket 주소를 넣으면 교강사 화면과 동일한 실시간 지표·참여자 목록을 볼 수 있습니다."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile title="모니터링 중" description="연결된 방" value={activeRoomId ? "ON" : "OFF"} delta="실시간" />
        <StatTile
          title="참여 인원"
          description="마지막 이벤트 기준"
          value={socket.liveSession.participantCount != null ? String(socket.liveSession.participantCount) : "—"}
          delta="WS"
        />
        <StatTile title="제출" description="집계" value={socket.liveSession.answerProgress ? `${socket.liveSession.answerProgress.answered}/${socket.liveSession.answerProgress.total}` : "—"} delta="서버" />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>방 연결</CardTitle>
          <CardDescription>
            방 ID는 교강사 화면의「고급 · 기술 정보」에 있습니다. WebSocket URL을 비우면 환경변수 기본 호스트로 연결합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleConnect} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Input
              value={roomIdInput}
              onChange={(ev) => setRoomIdInput(ev.target.value)}
              placeholder="내부 방 ID"
              className="font-mono text-sm"
            />
            <Input
              value={wsUrlInput}
              onChange={(ev) => setWsUrlInput(ev.target.value)}
              placeholder="wss://… (선택)"
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button type="submit">연결</Button>
              <Button type="button" variant="outline" onClick={handleDisconnect} disabled={!activeRoomId}>
                끊기
              </Button>
            </div>
          </form>
          {!token ? (
            <p className="text-xs text-amber-800">로그인 토큰이 없으면 서버가 거절할 수 있습니다. 운영자 계정으로 로그인한 뒤 사용하세요.</p>
          ) : null}
        </CardContent>
      </Card>

      {activeRoomId ? (
        <LiveQuizStatusPanel
          variant="admin"
          live={socket.liveSession}
          remainingSec={remainingSec}
          isConnected={socket.isConnected}
        />
      ) : (
        <Card className="border-dashed shadow-sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            방 ID를 입력하고 연결하면 실시간 패널이 나타납니다.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
