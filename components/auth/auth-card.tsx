"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Coffee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AuthCardProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="font-display text-2xl tracking-tight">{title}</CardTitle>
        {description ? <CardDescription className="text-sm leading-relaxed">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
      {footer ? <div className="border-t px-6 py-4 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </Card>
  );
}

export function AuthMobileHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Coffee className="h-4 w-4 text-primary" />
        </span>
        <span className="font-display text-base font-semibold">Coffee Field OS</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}

export function AuthBackLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to home
    </Link>
  );
}
