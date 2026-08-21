import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { BAND_COLORS } from "@/lib/utils/constants";

const BAND_THRESHOLDS: Record<string, string> = {
  A: "≤ $5,000",
  B: "$5,001 – $25,000",
  C: "$25,001 – $100,000",
  D: "> $100,000",
};

interface BandBadgeProps {
  band: string;
  className?: string;
}

export function BandBadge({ band, className }: BandBadgeProps) {
  const bandColor = BAND_COLORS[band as keyof typeof BAND_COLORS];
  const colorClass = bandColor ? `${bandColor.bg} ${bandColor.text}` : "";
  const threshold = BAND_THRESHOLDS[band] ?? "";

  return (
    <Tooltip content={`Band ${band}: ${threshold}`}>
      <Badge colorClass={colorClass} className={className}>
        Band {band}
      </Badge>
    </Tooltip>
  );
}
