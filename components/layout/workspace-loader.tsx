"use client";

import { cn } from "@/lib/utils";
import { BrandLoader } from "@/components/brand/brand-loader";

type WorkspaceLoaderProps = {
  label?: string;
  className?: string;
};

export function WorkspaceLoader({ label = "Loading workspace…", className }: WorkspaceLoaderProps) {
  return <BrandLoader label={label} className={className} variant="fullscreen" size="xl" withWordmark showTagline />;
}

export function AuthRedirectLoader({ label = "Opening your workspace…" }: { label?: string }) {
  return (
    <BrandLoader
      label={label}
      variant="centered"
      size="lg"
      withWordmark
      showTagline={false}
    />
  );
}
