import { boardColumnTheme } from "@/lib/items/board-theme";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const theme = boardColumnTheme(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-sm",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)} />
      {theme.label}
    </span>
  );
}
