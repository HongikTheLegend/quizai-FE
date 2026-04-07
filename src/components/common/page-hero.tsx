import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({ title, description, actions, className }: PageHeroProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-cyan-500/10 p-5",
        className,
      )}
    >
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
