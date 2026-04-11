"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 수강생 핵심 여정: 강의 → 입장 → 풀이 → 결과 (현재 페이지에 따라 강조).
 */
export function StudentFlowRail() {
  const pathname = usePathname();

  const phase: "lectures" | "join" | "play" | "home" = pathname.startsWith("/student/lectures")
    ? "lectures"
    : pathname.startsWith("/student/join")
      ? "join"
      : pathname.startsWith("/student/play")
        ? "play"
        : "home";

  const steps: { id: typeof phase | "solve"; label: string; href?: string; note?: string }[] = [
    { id: "lectures", label: "강의 신청", href: "/student/lectures" },
    { id: "join", label: "참여 코드", href: "/student/join" },
    { id: "solve", label: "퀴즈 풀이", note: "입장 후" },
    { id: "home", label: "결과", href: "/student/dashboard?open=quiz-results" },
  ];

  const isActive = (s: (typeof steps)[number]) => {
    if (s.id === "solve") {
      return phase === "play";
    }
    if (s.id === "home") {
      return phase === "home";
    }
    return phase === s.id;
  };

  return (
    <nav
      aria-label="학습 진행 순서"
      className="flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2.5 text-xs md:text-sm"
    >
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1">
          {i > 0 ? (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
          ) : null}
          {s.href ? (
            <Link
              href={s.href}
              className={cn(
                "rounded-lg px-2 py-1 font-medium transition-colors",
                isActive(s)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {s.label}
            </Link>
          ) : (
            <span
              className={cn(
                "rounded-lg px-2 py-1 font-medium",
                isActive(s) ? "bg-primary/15 text-primary" : "text-muted-foreground",
              )}
              title={s.note}
            >
              {s.label}
              {s.note ? (
                <span className="ml-1 font-normal text-muted-foreground">({s.note})</span>
              ) : null}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
