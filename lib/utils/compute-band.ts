import type { Schedule3Threshold } from "@/types";

/** Mirror server computeBand — resolves band letter from program thresholds. */
export function computeBandFromThresholds(
  estimatedCostUsd: number,
  thresholds: Schedule3Threshold[],
): string {
  const amount = Number(estimatedCostUsd);
  const sorted = [...thresholds].sort((a, b) => a.minValueUsd - b.minValueUsd);

  const match = sorted.find((t) => {
    const min = t.minValueUsd;
    const max = t.maxValueUsd;
    if (max == null) return amount >= min;
    return amount >= min && amount <= max;
  });

  return match?.band ?? sorted[sorted.length - 1]?.band ?? "D";
}

export function formatBandRange(threshold: Schedule3Threshold): string {
  const { minValueUsd, maxValueUsd } = threshold;
  if (maxValueUsd == null) {
    return minValueUsd <= 0 ? "Open ended" : `≥ $${minValueUsd.toLocaleString()}`;
  }
  if (minValueUsd <= 0) return `≤ $${maxValueUsd.toLocaleString()}`;
  return `$${minValueUsd.toLocaleString()} – $${maxValueUsd.toLocaleString()}`;
}

export function bandRangeLabel(band: string, thresholds?: Schedule3Threshold[]): string {
  const row = thresholds?.find((t) => t.band === band);
  return row ? formatBandRange(row) : "";
}
