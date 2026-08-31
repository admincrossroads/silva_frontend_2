import type { Schedule3Threshold } from "@/types";
import { formatEtb } from "@/lib/utils/format";

/** Resolve band letter from program thresholds (amounts in ETB). */
export function computeBandFromThresholds(estimatedCostEtb: number, thresholds: Schedule3Threshold[]): string {
  const amount = Number(estimatedCostEtb);
  const sorted = [...thresholds].sort((a, b) => a.minValueEtb - b.minValueEtb);

  const match = sorted.find((t) => {
    const min = t.minValueEtb;
    const max = t.maxValueEtb;
    if (max == null) return amount >= min;
    return amount >= min && amount <= max;
  });

  return match?.band ?? sorted[sorted.length - 1]?.band ?? "D";
}

export function formatBandRange(threshold: Schedule3Threshold): string {
  const { minValueEtb, maxValueEtb } = threshold;
  if (maxValueEtb == null) {
    return minValueEtb <= 0 ? "Open ended" : `≥ ${formatEtb(minValueEtb)}`;
  }
  if (minValueEtb <= 0) return `≤ ${formatEtb(maxValueEtb)}`;
  return `${formatEtb(minValueEtb)} – ${formatEtb(maxValueEtb)}`;
}

export function bandRangeLabel(band: string, thresholds?: Schedule3Threshold[]): string {
  const row = thresholds?.find((t) => t.band === band);
  return row ? formatBandRange(row) : "";
}
