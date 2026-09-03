import { useEffect, useMemo } from "react";
import { useBudgetEstimate } from "@/hooks/use-budget-estimate";
import { cn } from "@/lib/utils";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(
    value,
  );
}

type BlockOption = {
  id: string;
  code: string;
  estateName: string;
  estateId: string;
};

type ActivityOption = {
  id: string;
  name: string;
  code: string;
};

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        selected ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

export function BlockActivityEstimateSection({
  farmEstateId,
  blockIds,
  activityIds,
  blocks,
  activities,
  onBlockIdsChange,
  onActivityIdsChange,
  onEstimatedTotal,
}: {
  farmEstateId?: string;
  blockIds: string[];
  activityIds: string[];
  blocks: BlockOption[];
  activities: ActivityOption[];
  onBlockIdsChange: (ids: string[]) => void;
  onActivityIdsChange: (ids: string[]) => void;
  onEstimatedTotal: (total: number | null) => void;
}) {
  const estimate = useBudgetEstimate();

  const scopedBlocks = useMemo(() => {
    if (!farmEstateId) return blocks;
    return blocks.filter((b) => b.estateId === farmEstateId);
  }, [blocks, farmEstateId]);

  useEffect(() => {
    if (!activityIds.length) {
      onEstimatedTotal(null);
      return;
    }
    if (!blockIds.length && !farmEstateId) {
      onEstimatedTotal(null);
      return;
    }

    const timer = setTimeout(() => {
      estimate.mutate(
        {
          farmEstateId: farmEstateId || undefined,
          blockIds: blockIds.length ? blockIds : undefined,
          activityIds,
        },
        {
          onSuccess: (data) => onEstimatedTotal(data.totals.totalCostEtb),
          onError: () => onEstimatedTotal(null),
        },
      );
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- estimate on selection change only
  }, [activityIds, blockIds, farmEstateId, onEstimatedTotal]);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Blocks (optional)</p>
        <div className="flex flex-wrap gap-2">
          {scopedBlocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocks configured.</p>
          ) : (
            scopedBlocks.map((b) => (
              <ToggleChip
                key={b.id}
                label={`${b.code} · ${b.estateName}`}
                selected={blockIds.includes(b.id)}
                onClick={() => {
                  const next = blockIds.includes(b.id)
                    ? blockIds.filter((id) => id !== b.id)
                    : [...blockIds, b.id];
                  onBlockIdsChange(next);
                }}
              />
            ))
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Activities</p>
        <div className="flex flex-wrap gap-2">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities in master.</p>
          ) : (
            activities.map((a) => (
              <ToggleChip
                key={a.id}
                label={a.name}
                selected={activityIds.includes(a.id)}
                onClick={() => {
                  const next = activityIds.includes(a.id)
                    ? activityIds.filter((id) => id !== a.id)
                    : [...activityIds, a.id];
                  onActivityIdsChange(next);
                }}
              />
            ))
          )}
        </div>
      </div>
      {estimate.data ? (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Estimated budget: {formatEtb(estimate.data.totals.totalCostEtb)}</p>
          {estimate.data.warnings.length > 0 ? (
            <ul className="mt-2 list-disc pl-4 text-muted-foreground">
              {estimate.data.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {estimate.isPending ? <p className="text-sm text-muted-foreground">Calculating estimate…</p> : null}
    </div>
  );
}
