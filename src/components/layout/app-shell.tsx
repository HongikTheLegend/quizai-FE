"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, LayoutDashboard, LogOut, Menu, School, Shield, User, Users } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { clearAuthSession, getStoredRole } from "@/lib/auth-storage";
import { roleHomeHint } from "@/lib/session-user-copy";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const NAV_MAP: Record<UserRole, NavItem[]> = {
  instructor: [
    { href: "/instructor/dashboard", label: "대시보드", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/instructor/lectures", label: "강의 자료", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/instructor/sessions", label: "라이브 퀴즈", icon: <BarChart3 className="h-4 w-4" /> },
  ],
  student: [
    { href: "/student/dashboard", label: "내 홈 · 결과", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/student/lectures", label: "수업 신청", icon: <School className="h-4 w-4" /> },
    { href: "/student/join", label: "퀴즈방 입장", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/student/play", label: "실시간 퀴즈", icon: <BookOpen className="h-4 w-4" /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "관리자 대시보드", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/lectures", label: "강의 관리", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/admin/sessions", label: "세션 모니터링", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/admin/users", label: "사용자 관리", icon: <Users className="h-4 w-4" /> },
  ],
};

const SidebarLinks = ({
  items,
  pathname,
  onSelect,
}: {
  items: NavItem[];
  pathname: string;
  onSelect?: () => void;
}) => (
  <nav className="space-y-2">
    {items.map((item) => {
      const active = pathname.startsWith(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onSelect}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            active
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      );
    })}
  </nav>
);

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathnameRole = useMemo<UserRole>(() => {
    if (pathname.startsWith("/instructor")) {
      return "instructor";
    }
    if (pathname.startsWith("/admin")) {
      return "admin";
    }
    return "student";
  }, [pathname]);

  const [storedRole, setStoredRole] = useState<UserRole | null>(null);
  useEffect(() => {
    setStoredRole(getStoredRole());
  }, [pathname]);

  const role = storedRole ?? pathnameRole;

  const navItems = useMemo(() => NAV_MAP[role], [role]);
  const roleLabel = role === "instructor" ? "교강사" : role === "admin" ? "운영자" : "수강생";
  const roleIcon =
    role === "instructor" ? <Users className="h-4 w-4" /> : role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />;
  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-border/60 bg-card/75 px-4 py-6 shadow-sm backdrop-blur-md md:block">
        <h1 className="mb-1 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-lg font-bold tracking-tight text-transparent">
          QuizAI
        </h1>
        <p className="mb-4 text-[11px] leading-snug text-muted-foreground">{roleHomeHint(role)}</p>
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">역할</span>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
            {roleIcon}
            {roleLabel}
          </div>
        </div>
        <SidebarLinks items={navItems} pathname={pathname} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/70 bg-card/80 px-4 backdrop-blur-md md:px-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button variant="outline" size="icon" className="md:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </DialogTrigger>
            <DialogContent className="w-[280px] p-4 sm:max-w-[280px]">
              <DialogTitle className="mb-3">QuizAI 메뉴</DialogTitle>
              <SidebarLinks
                items={navItems}
                pathname={pathname}
                onSelect={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-3">
            <p className="ml-3 hidden text-sm font-medium text-muted-foreground sm:block">
              차세대 실시간 학습 · 피드백 플랫폼
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 md:pl-10">{children}</main>
      </div>
    </div>
  );
}
