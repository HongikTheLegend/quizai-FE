"use client";

import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/api";

const OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "student", label: "수강생", description: "퀴즈 참여·결과" },
  { value: "instructor", label: "교강사", description: "자료·라이브 퀴즈" },
  { value: "admin", label: "운영자", description: "전체 모니터링" },
];

interface AuthRolePickerProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function AuthRolePicker({ value, onChange, disabled }: AuthRolePickerProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">1. 역할 선택</legend>
      <p className="text-xs text-muted-foreground">로그인 후 이동할 화면이 여기서 정해집니다.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={value === opt.value ? "default" : "outline"}
            className="h-auto flex-col gap-0.5 py-3"
            onClick={() => onChange(opt.value)}
          >
            <span className="font-semibold">{opt.label}</span>
            <span className="text-[10px] font-normal opacity-90">{opt.description}</span>
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
