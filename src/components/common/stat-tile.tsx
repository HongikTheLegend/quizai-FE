import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatTileProps {
  title: string;
  description: string;
  value: string;
}

export function StatTile({ title, description, value }: StatTileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-3xl font-bold tracking-tight">{value}</CardContent>
    </Card>
  );
}
