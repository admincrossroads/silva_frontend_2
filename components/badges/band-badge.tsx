import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { BAND_COLORS } from "@/lib/utils/constants";
import { bandRangeLabel } from "@/lib/utils/compute-band";
import type { Schedule3Threshold } from "@/types";

interface BandBadgeProps {
  band: string;
  className?: string;
  thresholds?: Schedule3Threshold[];
}

export function BandBadge({ band, className, thresholds }: BandBadgeProps) {
  const bandColor = BAND_COLORS[band as keyof typeof BAND_COLORS];
  const colorClass = bandColor ? `${bandColor.bg} ${bandColor.text}` : "";
  const threshold = bandRangeLabel(band, thresholds);

  return (
    <Tooltip content={threshold ? `Band ${band}: ${threshold}` : `Band ${band}`}>
      <Badge colorClass={colorClass} className={className}>
        Band {band}
      </Badge>
    </Tooltip>
  );
}
