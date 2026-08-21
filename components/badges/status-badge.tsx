import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/utils/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? "";
  return (
    <Badge colorClass={colorClass} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
