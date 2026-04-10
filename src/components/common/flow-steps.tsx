import { cn } from "@/lib/utils";

export interface FlowStepItem {
  title: string;
  description: string;
}

interface FlowStepsProps {
  steps: FlowStepItem[];
  className?: string;
}

export function FlowSteps({ steps, className }: FlowStepsProps) {
  return (
    <ol
      className={cn(
        "grid gap-3 md:grid-cols-3",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-sm font-semibold text-primary"
            aria-hidden
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{step.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
