import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";

interface ListItem {
  id: string;
  title: string;
  status: string;
}

interface ListCardProps {
  title: string;
  items: ListItem[];
  viewAllHref: string;
  className?: string;
}

export function ListCard({ title, items, viewAllHref, className }: ListCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{item.title}</span>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href={viewAllHref} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardFooter>
    </Card>
  );
}
