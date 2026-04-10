import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Layers,
  Radio,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Sparkles,
    title: "AI 퀴즈 생성",
    description: "강의 자료를 올리면 객관식·해설까지 자동 초안을 만듭니다. 수정 후 바로 수업에 씁니다.",
  },
  {
    icon: Radio,
    title: "라이브 실시간",
    description: "참여코드 한 번으로 입장. 남은 시간·응답 현황·참여자를 같은 화면에서 확인합니다.",
  },
  {
    icon: BarChart3,
    title: "학습 인사이트",
    description: "정답률·취약 개념·참여율을 한눈에. 교강사와 운영자가 같은 데이터로 의사결정합니다.",
  },
];

const stepsInstructor = [
  "자료 업로드 후 퀴즈 세트 생성",
  "라이브 퀴즈방 열고 참여코드 공유",
  "실시간 응답과 결과로 수업 조율",
];

const stepsStudent = [
  "수업 신청 후 퀴즈방 입장",
  "제한 시간 안에 문항 풀이",
  "결과·복습 포인트 확인",
];

export function HomeLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-lg text-transparent">
              QuizAI
            </span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">실시간 학습 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}>
              로그인
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              무료로 시작
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_280/0.25),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="size-3.5" aria-hidden />
              차세대 교실을 위한 실시간 피드백
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              자료는 올리고,
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-600 to-violet-500 bg-clip-text text-transparent">
                퀴즈는 AI가, 수업은 라이브로.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              QuizAI는 강의 자료 기반 퀴즈 생성부터 참여코드 입장·타이머·응답 집계까지 한 흐름으로 이어 주는 교육용
              플랫폼입니다. 수강생·교강사·운영자가 같은 현장 데이터를 공유합니다.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25",
                )}
              >
                지금 시작하기
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-6 text-base")}>
                계정이 있어요
              </Link>
            </div>
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              {["PDF·텍스트 기반 생성", "WebSocket 라이브", "역할별 대시보드"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-border/50 bg-card/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-primary">Why QuizAI</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-2xl font-bold md:text-3xl">수업 현장에 맞춘 세 가지 축</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/[0.07] to-transparent p-8">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="size-5" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-wide">교강사</span>
                </div>
                <h3 className="mt-3 text-xl font-bold">준비부터 리캡까지 한 화면에서</h3>
                <ol className="mt-6 space-y-4">
                  {stepsInstructor.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-violet-500/[0.06] to-transparent p-8">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                  <BookOpen className="size-5" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-wide">수강생</span>
                </div>
                <h3 className="mt-3 text-xl font-bold">코드만으로 집중하는 퀴즈 경험</h3>
                <ol className="mt-6 space-y-4">
                  {stepsStudent.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-700 dark:text-violet-300">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-muted/30 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="size-5" aria-hidden />
                  <span className="text-sm font-medium">운영 · 품질</span>
                </div>
                <h3 className="mt-2 text-2xl font-bold md:text-3xl">같은 라이브를 운영자도 모니터링</h3>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  방 ID로 실시간 지표에 접속해, 수업 품질과 장애 대응을 지원할 수 있습니다.
                </p>
              </div>
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "shrink-0 gap-2")}>
                팀으로 써보기
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-violet-500/10 px-6 py-12 text-center md:px-12">
            <h2 className="text-2xl font-bold md:text-3xl">다음 수업부터 QuizAI로 연결해 보세요</h2>
            <p className="mt-3 text-muted-foreground">회원가입 시 역할만 고르면 바로 맞춤 화면으로 들어갑니다.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "min-w-[200px]")}>
                무료 회원가입
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-w-[160px]")}>
                로그인
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} QuizAI · AI 기반 실시간 교육 피드백</p>
      </footer>
    </div>
  );
}
