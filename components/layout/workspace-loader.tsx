"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/spx-farm-logo";

type WorkspaceLoaderProps = {
  label?: string;
  className?: string;
};

export function WorkspaceLoader({ label = "Loading workspace…", className }: WorkspaceLoaderProps) {
  return (
    <div className={cn("flex h-dvh flex-col items-center justify-center bg-muted/30", className)}>
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <BrandLogo size="xl" withWordmark />
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 animate-fade-in">
      <BrandLogo size="lg" withWordmark showTagline={false} />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {label}
      </div>
    </div>
  );
}
