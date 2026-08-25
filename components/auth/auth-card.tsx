"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandLogo } from "@/components/brand/spx-farm-logo";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-lg shadow-primary/5", className)}>
      <CardHeader className="space-y-1.5 px-4 pb-3 pt-5 sm:space-y-1 sm:px-6 sm:pb-4 sm:pt-6">
        <CardTitle className="font-display text-xl tracking-tight sm:text-2xl">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm leading-relaxed sm:text-[0.925rem]">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-5 sm:space-y-6 sm:px-6 sm:pb-6">{children}</CardContent>
      {footer ? (
        <div className="border-t px-4 py-3.5 text-center text-sm text-muted-foreground sm:px-6 sm:py-4">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}

export function AuthMobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b bg-background/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm lg:hidden">
      <Link href="/" aria-label={`${siteConfig.name} home`} className="min-w-0">
        <BrandLogo size="sm" withWordmark showTagline={false} />
      </Link>
      <ThemeToggle />
    </header>
  );
}

export function AuthBackLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "mb-4 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:mb-6 lg:inline-flex",
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to home
    </Link>
  );
}
