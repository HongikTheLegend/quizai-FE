import { cn } from "@/lib/utils";

import { liveConnectionLabel } from "@/lib/session-user-copy";

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        isConnected
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isConnected ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]" : "bg-amber-500 animate-pulse",
        )}
        aria-hidden
      />
      {liveConnectionLabel(isConnected)}
    </span>
  );
}
