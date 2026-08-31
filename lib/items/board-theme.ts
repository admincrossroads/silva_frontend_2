import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CheckCircle2,
  CircleDashed,
  FileCheck,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export type BoardColumnTheme = {
  label: string;
  hint?: string;
  dot: string;
  header: string;
  column: string;
  empty: string;
  cardAccent: string;
  icon: LucideIcon;
};

const DEFAULT: BoardColumnTheme = {
  label: "",
  dot: "bg-muted-foreground",
  header: "bg-muted/40",
  column: "bg-muted/15 border-border/80",
  empty: "text-muted-foreground",
  cardAccent: "border-l-muted-foreground/40",
  icon: CircleDashed,
};

export const BOARD_COLUMN_THEMES: Record<string, BoardColumnTheme> = {
  draft: {
    label: "Draft",
    hint: "Not yet submitted",
    dot: "bg-slate-400",
    header: "bg-slate-500/10",
    column: "bg-slate-500/[0.04] border-slate-200/80 dark:border-slate-700/50",
    empty: "text-slate-500/70",
    cardAccent: "border-l-slate-400",
    icon: CircleDashed,
  },
  submitted: {
    label: "Submitted",
    hint: "Awaiting review",
    dot: "bg-amber-500",
    header: "bg-amber-500/10",
    column: "bg-amber-500/[0.04] border-amber-200/70 dark:border-amber-900/40",
    empty: "text-amber-700/60 dark:text-amber-400/50",
    cardAccent: "border-l-amber-500",
    icon: Send,
  },
  validated: {
    label: "Validated",
    hint: "SPX validated",
    dot: "bg-sky-500",
    header: "bg-sky-500/10",
    column: "bg-sky-500/[0.04] border-sky-200/70 dark:border-sky-900/40",
    empty: "text-sky-700/60 dark:text-sky-400/50",
    cardAccent: "border-l-sky-500",
    icon: ShieldCheck,
  },
  approved: {
    label: "Approved",
    hint: "Authorized to proceed",
    dot: "bg-emerald-500",
    header: "bg-emerald-500/10",
    column: "bg-emerald-500/[0.04] border-emerald-200/70 dark:border-emerald-900/40",
    empty: "text-emerald-700/60 dark:text-emerald-400/50",
    cardAccent: "border-l-emerald-500",
    icon: CheckCircle2,
  },
  active: {
    label: "Active",
    hint: "In progress",
    dot: "bg-primary",
    header: "bg-primary/10",
    column: "bg-primary/[0.04] border-primary/20",
    empty: "text-primary/60",
    cardAccent: "border-l-primary",
    icon: CheckCircle2,
  },
  issued: {
    label: "Issued",
    hint: "Released to field",
    dot: "bg-blue-500",
    header: "bg-blue-500/10",
    column: "bg-blue-500/[0.04] border-blue-200/70 dark:border-blue-900/40",
    empty: "text-blue-700/60 dark:text-blue-400/50",
    cardAccent: "border-l-blue-500",
    icon: Send,
  },
  in_progress: {
    label: "In progress",
    hint: "Work underway",
    dot: "bg-violet-500",
    header: "bg-violet-500/10",
    column: "bg-violet-500/[0.04] border-violet-200/70 dark:border-violet-900/40",
    empty: "text-violet-700/60 dark:text-violet-400/50",
    cardAccent: "border-l-violet-500",
    icon: FileCheck,
  },
  complete: {
    label: "Complete",
    hint: "Work finished",
    dot: "bg-teal-500",
    header: "bg-teal-500/10",
    column: "bg-teal-500/[0.04] border-teal-200/70 dark:border-teal-900/40",
    empty: "text-teal-700/60 dark:text-teal-400/50",
    cardAccent: "border-l-teal-500",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    hint: "Archived",
    dot: "bg-zinc-400",
    header: "bg-zinc-500/10",
    column: "bg-zinc-500/[0.04] border-zinc-200/80 dark:border-zinc-700/50",
    empty: "text-zinc-500/70",
    cardAccent: "border-l-zinc-400",
    icon: Archive,
  },
  rejected: {
    label: "Rejected",
    hint: "Returned for revision",
    dot: "bg-rose-500",
    header: "bg-rose-500/10",
    column: "bg-rose-500/[0.04] border-rose-200/70 dark:border-rose-900/40",
    empty: "text-rose-700/60 dark:text-rose-400/50",
    cardAccent: "border-l-rose-500",
    icon: XCircle,
  },
  authorized: {
    label: "Authorized",
    hint: "Ready to settle",
    dot: "bg-indigo-500",
    header: "bg-indigo-500/10",
    column: "bg-indigo-500/[0.04] border-indigo-200/70 dark:border-indigo-900/40",
    empty: "text-indigo-700/60 dark:text-indigo-400/50",
    cardAccent: "border-l-indigo-500",
    icon: ShieldCheck,
  },
  settled: {
    label: "Settled",
    hint: "Payment complete",
    dot: "bg-emerald-600",
    header: "bg-emerald-600/10",
    column: "bg-emerald-600/[0.04] border-emerald-200/70 dark:border-emerald-900/40",
    empty: "text-emerald-700/60 dark:text-emerald-400/50",
    cardAccent: "border-l-emerald-600",
    icon: CheckCircle2,
  },
  on_track: {
    label: "On track",
    dot: "bg-emerald-500",
    header: "bg-emerald-500/10",
    column: "bg-emerald-500/[0.04] border-emerald-200/70",
    empty: "text-emerald-700/60",
    cardAccent: "border-l-emerald-500",
    icon: CheckCircle2,
  },
  watch: {
    label: "Watch",
    dot: "bg-amber-500",
    header: "bg-amber-500/10",
    column: "bg-amber-500/[0.04] border-amber-200/70",
    empty: "text-amber-700/60",
    cardAccent: "border-l-amber-500",
    icon: Send,
  },
  over_budget: {
    label: "Over budget",
    dot: "bg-rose-500",
    header: "bg-rose-500/10",
    column: "bg-rose-500/[0.04] border-rose-200/70",
    empty: "text-rose-700/60",
    cardAccent: "border-l-rose-500",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    header: "bg-amber-500/10",
    column: "bg-amber-500/[0.04] border-amber-200/70",
    empty: "text-amber-700/60",
    cardAccent: "border-l-amber-500",
    icon: CircleDashed,
  },
  expired: {
    label: "Expired",
    dot: "bg-rose-500",
    header: "bg-rose-500/10",
    column: "bg-rose-500/[0.04] border-rose-200/70",
    empty: "text-rose-700/60",
    cardAccent: "border-l-rose-500",
    icon: XCircle,
  },
  terminated: {
    label: "Terminated",
    dot: "bg-zinc-400",
    header: "bg-zinc-500/10",
    column: "bg-zinc-500/[0.04] border-zinc-200/80",
    empty: "text-zinc-500/70",
    cardAccent: "border-l-zinc-400",
    icon: Archive,
  },
  vendor_reviewed: {
    label: "Vendor reviewed",
    dot: "bg-sky-500",
    header: "bg-sky-500/10",
    column: "bg-sky-500/[0.04] border-sky-200/70",
    empty: "text-sky-700/60",
    cardAccent: "border-l-sky-500",
    icon: ShieldCheck,
  },
};

export function boardColumnTheme(status: string): BoardColumnTheme {
  const theme = BOARD_COLUMN_THEMES[status];
  if (!theme) {
    const label = status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { ...DEFAULT, label };
  }
  return theme;
}

export const ITEM_TYPE_LABELS: Record<string, string> = {
  afp: "AFP",
  afe: "AFE",
  work_order: "Work order",
  field_ticket: "Field ticket",
  payment_request: "Payment",
  settlement: "Settlement",
  vendor: "Vendor",
  bva: "BvA",
};
