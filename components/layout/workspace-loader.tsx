"use client";

import { Coffee, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkspaceLoaderProps = {
  label?: string;
  className?: string;
};

export function WorkspaceLoader({ label = "Loading workspace…", className }: WorkspaceLoaderProps) {
  return (
    <div className={cn("flex h-dvh flex-col items-center justify-center bg-muted/30", className)}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Coffee className="h-7 w-7 text-primary" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {label}
        </div>
      </div>
    </div>
  );
}

export function AuthRedirectLoader({ label = "Opening your workspace…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 animate-fade-in">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
