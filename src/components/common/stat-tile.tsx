import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatTileProps {
  title: string;
  description: string;
  value: string;
  delta?: string;
}

export function StatTile({ title, description, value, delta }: StatTileProps) {
  return (
    <Card className="border-border/50 transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(15,23,42,0.12)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          {delta ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {delta}
            </span>
          ) : null}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-3xl font-bold tracking-tight text-foreground">{value}</CardContent>
    </Card>
  );
}
