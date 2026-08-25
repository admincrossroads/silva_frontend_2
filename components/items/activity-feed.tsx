"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { MessageSquare, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddItemComment, useItemActivity } from "@/hooks/use-item-activity";
import { formatWorkflowLabel } from "@/lib/config/procore-modules";
import { cn } from "@/lib/utils";

type ActivityFeedProps = {
  entityType: string;
  entityId: string;
  className?: string;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityLine({ entry }: { entry: ReturnType<typeof useItemActivity>["data"] extends (infer T)[] | undefined ? T : never }) {
  if (entry.type === "comment") {
    return (
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquare className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-medium">{entry.userName}</span>
            <span className="text-muted-foreground"> commented</span>
          </p>
          <p className="mt-1 text-sm text-foreground">{entry.content}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{formatWhen(entry.timestamp)}</p>
        </div>
      </div>
    );
  }

  const label = entry.action ? formatWorkflowLabel(entry.action.replace(/_/g, " ")) : "Updated";
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{entry.userName}</span>
          <span className="text-muted-foreground"> · {label}</span>
        </p>
        {entry.comment ? <p className="mt-1 text-sm text-muted-foreground">{entry.comment}</p> : null}
        <p className="mt-1 text-[11px] text-muted-foreground">{formatWhen(entry.timestamp)}</p>
      </div>
    </div>
  );
}

export function ActivityFeed({ entityType, entityId, className }: ActivityFeedProps) {
  const { data = [], isLoading } = useItemActivity(entityType, entityId);
  const addComment = useAddItemComment(entityType, entityId);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addComment.mutate(text, { onSuccess: () => setDraft("") });
  };

  return (
    <Card className={cn("p-5", className)}>
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Activity className="h-3.5 w-3.5" />
        Activity
      </h3>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading activity…</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          data.map((entry) => <ActivityLine key={entry.id} entry={entry} />)
        )}
      </div>

      <div className="mt-5 space-y-2 border-t pt-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
          className="text-sm"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={!draft.trim() || addComment.isPending}>
            {addComment.isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-lg border bg-muted/20 p-3", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{value}</dd>
      </div>
    </div>
  );
}

export function StatusTimeline({
  steps,
  current,
  rejected,
}: {
  steps: readonly string[];
  current: string;
  rejected?: boolean;
}) {
  const currentStep = steps.indexOf(current);

  return (
    <ol className="relative space-y-0">
      {steps.map((step, idx) => {
        const completed = !rejected && idx < currentStep;
        const active = !rejected && idx === currentStep;
        const isLast = idx === steps.length - 1;
        return (
          <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[9px] top-5 h-[calc(100%-4px)] w-px",
                  completed ? "bg-primary" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                completed && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10",
                !completed && !active && "border-muted-foreground/30 bg-background",
              )}
            >
              {completed ? (
                <span className="text-[10px] text-primary-foreground">✓</span>
              ) : active ? (
                <span className="h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm", completed || active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {formatWorkflowLabel(step)}
              </p>
              {active ? (
                <p className="mt-0.5 text-xs text-primary">In progress</p>
              ) : completed ? (
                <p className="mt-0.5 text-xs text-muted-foreground">Done</p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground">Upcoming</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
