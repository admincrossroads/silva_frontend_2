"use client";

import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/spx-farm-logo";

type BrandLoaderProps = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withWordmark?: boolean;
  showTagline?: boolean;
  /** fullscreen = full viewport; centered = block in page flow */
  variant?: "fullscreen" | "centered" | "inline";
};

export function BrandLoader({
  label = "Loading…",
  className,
  size = "xl",
  withWordmark = true,
  showTagline = true,
  variant = "centered",
}: BrandLoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-5 animate-fade-in", className)} role="status" aria-live="polite">
      <BrandLogo size={size} withWordmark={withWordmark} showTagline={showTagline} animated />
      {label ? (
        <p className="text-sm font-medium tracking-wide text-muted-foreground brand-loader-label">{label}</p>
      ) : null}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-muted/30">{content}</div>
    );
  }

  if (variant === "inline") {
    return content;
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center py-16">{content}</div>
  );
}
