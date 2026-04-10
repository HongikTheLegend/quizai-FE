"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/common/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateQuizMutation } from "@/hooks/api/use-generate-quiz-mutation";
import { useUploadLectureMutation } from "@/hooks/api/use-upload-lecture-mutation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateQuizRequest, Lecture, QuizQuestion } from "@/types/api";

export default function InstructorLecturesPage() {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [lectureId, setLectureId] = useState("");
  const [count, setCount] = useState("5");
  const [extraCount, setExtraCount] = useState("5");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizSetId, setQuizSetId] = useState("");
  const [uploadedLecture, setUploadedLecture] = useState<Lecture | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const uploadLectureMutation = useUploadLectureMutation();
  const generateQuizMutation = useGenerateQuizMutation();

  const isBusy = uploadLectureMutation.isPending || generateQuizMutation.isPending;

  const aiKeywords = useMemo(
    () =>
      uploadedLecture
        ? ["핵심 개념 분류", "난이도 자동 균형", "오답 유도 포인트 탐지"]
        : ["강의 텍스트 정규화", "키워드 추출", "문항 포맷 최적화"],
    [uploadedLecture],
  );

  const runGenerate = async (
    lecId: string,
    quizCount: number,
    mode: "replace" | "append",
  ) => {
    const payload: GenerateQuizRequest = {
      lecture_id: lecId,
      count: quizCount,
    };
    const data = await generateQuizMutation.mutateAsync(payload);
    setQuizSetId(data.quiz_set_id);
    if (mode === "replace") {
      setQuestions(data.quizzes);
    } else {
      setQuestions((prev) => [...prev, ...data.quizzes]);
    }
    return data;
  };

  const handleUploadLecture = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("강의 제목을 입력해주세요.");
      return;
    }
    if (!pdfFile) {
      toast.error("PDF 파일을 선택해주세요.");
      return;
    }

    const n = Number(count);
    const quizCount = Number.isFinite(n) && n >= 1 ? Math.min(20, n) : 5;

    try {
      const lecture = await uploadLectureMutation.mutateAsync({
        file: pdfFile,
        title,
      });
      setUploadedLecture(lecture);
      setLectureId(lecture.lecture_id);
      toast.success("업로드 완료. 같은 강의로 퀴즈를 자동 생성합니다…");

      await runGenerate(lecture.lecture_id, quizCount, "replace");
      toast.success(`퀴즈 ${quizCount}문항 생성이 완료되었습니다.`);
    } catch {
      // api-client / generate 실패 시 토스트는 인터셉터·뮤테이션에서 처리
    }
  };

  const handleGenerateMore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lectureId.trim()) {
      toast.error("강의 ID가 없습니다. 먼저 파일을 업로드하세요.");
      return;
    }
    const n = Number(extraCount);
    const quizCount = Number.isFinite(n) && n >= 1 ? Math.min(20, n) : 5;

    try {
      await runGenerate(lectureId.trim(), quizCount, "append");
      toast.success(`추가로 ${quizCount}문항을 붙였습니다.`);
    } catch {
      // apiRequest에서 토스트
    }
  };

  const handleManualRegenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lectureId.trim()) {
      toast.error("lecture_id를 입력하세요.");
      return;
    }
    const n = Number(count);
    const quizCount = Number.isFinite(n) && n >= 1 ? Math.min(20, n) : 5;

    try {
      await runGenerate(lectureId.trim(), quizCount, "replace");
      toast.success("퀴즈를 새로 덮어썼습니다.");
    } catch {
      // apiRequest에서 토스트
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== questionId));
  };

  const handleQuestionTextUpdate = (questionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, question: text } : question,
      ),
    );
  };

  return (
    <section className="space-y-6">
      <PageHero
        eyebrow="AI Builder"
        title="한 번 업로드하면 퀴즈까지 이어집니다"
        description="PDF와 강의 제목만 올리면 업로드 직후 같은 강의(lecture)에 대해 AI 퀴즈가 자동으로 생성됩니다. 부족하면 같은 강의로 문항만 추가 생성할 수 있어요."
        actions={
          <Button type="button" onClick={() => window.location.assign("/instructor/sessions")}>
            라이브 퀴즈로 이동
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          className={`border-2 ${dragOver ? "border-primary bg-primary/5" : "border-dashed border-border bg-card"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file) {
              setPdfFile(file);
              if (!title.trim()) {
                setTitle(file.name.replace(/\.[^/.]+$/, ""));
              }
            }
          }}
        >
          <CardHeader>
            <CardTitle>1) 강의 업로드 → 자동 퀴즈</CardTitle>
            <CardDescription>
              제목·파일·첫 생성 문항 수를 정한 뒤 업로드하면, 완료 즉시 퀴즈 생성 API가 호출됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadLecture} className="space-y-3">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="강의 제목"
                required
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">첫 자동 생성 문항 수 (1–20)</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                  required
                />
              </div>
              <Input
                type="file"
                accept="application/pdf,text/plain,.docx"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                required
              />
              <Button type="submit" disabled={isBusy} className="w-full">
                {uploadLectureMutation.isPending
                  ? "업로드 중…"
                  : generateQuizMutation.isPending
                    ? "퀴즈 자동 생성 중…"
                    : "업로드 후 퀴즈 자동 생성"}
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              {pdfFile ? `선택 파일: ${pdfFile.name}` : "선택된 파일이 없습니다."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2) 진행 상태</CardTitle>
            <CardDescription>업로드와 퀴즈 생성이 한 흐름으로 이어집니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">
              {uploadLectureMutation.isPending
                ? "파일을 서버에 올리는 중…"
                : generateQuizMutation.isPending
                  ? "같은 강의에 대해 AI가 문항을 만들고 있어요…"
                  : uploadedLecture
                    ? "준비됨. 아래에서 문항을 더 붙이거나 덮어쓸 수 있어요."
                    : "업로드하면 자동으로 퀴즈 생성이 시작됩니다."}
            </p>
            <div className="space-y-2">
              {aiKeywords.map((keyword) => (
                <div key={keyword} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{keyword}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      generateQuizMutation.isPending ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {generateQuizMutation.isPending ? "running" : "idle"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>3) 같은 강의로 더 만들기 (선택)</CardTitle>
          <CardDescription>
            업로드는 한 번만. 추가 분량이 필요하면 lecture_id는 그대로 두고 문항만 더 뽑습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleGenerateMore} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <Input
              value={lectureId}
              onChange={(event) => setLectureId(event.target.value)}
              placeholder="lecture_id (업로드 시 자동 입력)"
              className="font-mono text-sm"
            />
            <Input
              type="number"
              min={1}
              max={20}
              value={extraCount}
              onChange={(event) => setExtraCount(event.target.value)}
              title="추가 문항 수"
            />
            <Button type="submit" disabled={isBusy || !lectureId.trim()}>
              {generateQuizMutation.isPending ? "생성 중…" : "문항 더 붙이기"}
            </Button>
          </form>

          <div className="border-t border-border/80 pt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">다시 처음부터 덮어쓰기</p>
            <form onSubmit={handleManualRegenerate} className="grid gap-3 md:grid-cols-[1fr_100px_auto]">
              <Input
                value={lectureId}
                onChange={(event) => setLectureId(event.target.value)}
                placeholder="동일 lecture_id"
                className="font-mono text-sm"
              />
              <Input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
              <Button type="submit" variant="outline" disabled={isBusy || !lectureId.trim()}>
                전체 새로 생성
              </Button>
            </form>
          </div>

          {uploadedLecture ? (
            <p className="text-xs text-muted-foreground">
              현재 강의: <span className="font-medium text-foreground">{uploadedLecture.title}</span> ·{" "}
              <span className="font-mono">{uploadedLecture.lecture_id}</span>
            </p>
          ) : null}
          {quizSetId ? (
            <p className="text-xs text-primary">마지막 quiz_set_id: {quizSetId}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>퀴즈 리뷰</CardTitle>
          <CardDescription>생성된 퀴즈를 다듬은 뒤, 라이브 퀴즈 화면에서 방을 열어 수업에 사용하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {generateQuizMutation.isPending ? (
            <div className="grid gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : questions.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">총 {questions.length}문항</p>
              {questions.map((question) => (
              <article key={question.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  {editingQuestionId === question.id ? (
                    <Input
                      value={question.question}
                      onChange={(event) =>
                        handleQuestionTextUpdate(question.id, event.target.value)
                      }
                    />
                  ) : (
                    <p className="font-medium">{question.question}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingQuestionId((prev) =>
                          prev === question.id ? null : question.id,
                        )
                      }
                    >
                      {editingQuestionId === question.id ? "완료" : "수정"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {question.options.map((option, idx) => (
                    <li key={`${question.id}-${idx}`}>
                      {idx + 1}. {option}
                    </li>
                  ))}
                </ul>
              </article>
              ))}
            </>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              아직 생성된 퀴즈가 없습니다. 위에서 업로드하면 자동으로 채워집니다.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
