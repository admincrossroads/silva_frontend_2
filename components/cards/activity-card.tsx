import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  description: string;
  time: string;
}

interface ActivityCardProps {
  title?: string;
  items: ActivityItem[];
  className?: string;
}

export function ActivityCard({ title = "Recent Activity", items, className }: ActivityCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-border space-y-4 ml-2">
          {items.map((item) => (
            <li key={item.id} className="ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <p className="text-sm text-foreground">{item.description}</p>
              <time className="text-xs text-muted-foreground">{item.time}</time>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
