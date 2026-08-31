"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { boardColumnTheme } from "@/lib/items/board-theme";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TableIdLink({ href, id, short = 8 }: { href: string; id: string; short?: number }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline"
    >
      {id.slice(0, short)}
      <ArrowUpRight className="h-3 w-3 opacity-60" />
    </Link>
  );
}

export function TablePrimaryCell({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="group block min-w-0 max-w-[260px] py-0.5">
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>
      ) : null}
    </Link>
  );
}

export function TableMoney({
  amount,
  currency = "ETB",
  className,
}: {
  amount: number | null | undefined;
  currency?: string;
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap text-sm font-semibold tabular-nums text-foreground", className)}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

export function TableMuted({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-xs leading-snug text-muted-foreground", className)}>{children}</span>
  );
}

export function TableChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}

export function TableRowActionsTrigger({ disabled }: { disabled?: boolean }) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={disabled}>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );
}

export function TableStatusStripe({ status }: { status: string }) {
  const theme = boardColumnTheme(status);
  return <span className={cn("absolute inset-y-0 left-0 w-[3px] rounded-r-full", theme.dot)} aria-hidden />;
}
