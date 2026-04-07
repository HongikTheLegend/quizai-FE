interface HelperTipProps {
  title: string;
  steps: string[];
}

export function HelperTip({ title, steps }: HelperTipProps) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
