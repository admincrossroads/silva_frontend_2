export type SeasonWindowTimeline = {
  id: string;
  activity: string;
  operatingDiscipline?: string;
  weekStart: number;
  weekEnd: number;
  status: string;
  linkedWorkOrderId?: string | null;
  notes?: string | null;
};

export const SEASON_STATUS_COLORS: Record<string, string> = {
  planned: "bg-muted text-muted-foreground border-muted-foreground/20",
  issued: "bg-sky-100 text-sky-900 border-sky-300",
  in_progress: "bg-amber-100 text-amber-900 border-amber-300",
  complete: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-rose-100 text-rose-900 border-rose-300",
};

export const SEASON_WEEKS = 52;

export function weekFromRatio(ratio: number): number {
  const clamped = Math.max(0, Math.min(1, ratio));
  return Math.max(1, Math.min(SEASON_WEEKS, Math.floor(clamped * SEASON_WEEKS) + 1));
}

export function weekRangeFromRatio(startRatio: number, endRatio: number): { weekStart: number; weekEnd: number } {
  const a = weekFromRatio(startRatio);
  const b = weekFromRatio(endRatio);
  return { weekStart: Math.min(a, b), weekEnd: Math.max(a, b) };
}

export function isWindowEditable(status: string): boolean {
  return status === "planned" || status === "issued";
}
