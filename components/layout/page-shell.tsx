"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Standard page wrapper — use on every dashboard page */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 space-y-4 animate-fade-in sm:space-y-6", className)}>{children}</div>;
}

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
};

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
        {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageFilters({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-3", className)}>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </Card>
  );
}

export function PageContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

type DetailHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  badges?: ReactNode;
  actions?: ReactNode;
};

export function DetailPageHeader({
  title,
  backHref,
  backLabel = "Back",
  badges,
  actions,
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {backHref ? (
        <Button variant="ghost" size="sm" className="h-8 -ml-2 gap-1.5 text-muted-foreground" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 -ml-2 gap-1.5 text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Button>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">{title}</h1>
            {badges}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-4 w-96 max-w-full rounded bg-muted" />
      <div className="h-64 rounded-xl bg-muted/60" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="border-b bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}
