"use client";

import { Toaster } from "sonner";

/** Global toast host — mount once in the root layout. */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-card-foreground shadow-lg font-sans",
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          success: "border-primary/25",
          error: "border-destructive/30",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton: "bg-card border-border text-muted-foreground",
        },
      }}
    />
  );
}
