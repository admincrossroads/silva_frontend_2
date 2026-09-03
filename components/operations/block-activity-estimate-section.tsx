"use client";

import { useEffect, useMemo, useState } from "react";
import { useBudgetEstimate } from "@/hooks/use-budget-estimate";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
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
        "rounded-md border px-2.5 py-1 text-xs transition-colors",
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
  const [activityQuery, setActivityQuery] = useState("");

  const scopedBlocks = useMemo(() => {
    if (!farmEstateId) return [];
    return blocks.filter((b) => b.estateId === farmEstateId);
  }, [blocks, farmEstateId]);

  const filteredActivities = useMemo(() => {
    const q = activityQuery.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
    );
  }, [activities, activityQuery]);

  // Drop block selections that don't belong to the current farm
  useEffect(() => {
    if (!farmEstateId) {
      if (blockIds.length) onBlockIdsChange([]);
      return;
    }
    const allowed = new Set(scopedBlocks.map((b) => b.id));
    const next = blockIds.filter((id) => allowed.has(id));
    if (next.length !== blockIds.length) onBlockIdsChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when farm/blocks change
  }, [farmEstateId, scopedBlocks]);

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
        {!farmEstateId ? (
          <p className="text-sm text-muted-foreground">Select a farm estate to choose blocks.</p>
        ) : scopedBlocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocks on this farm.</p>
        ) : (
          <div className="max-h-36 overflow-y-auto rounded-md border p-2">
            <div className="flex flex-wrap gap-1.5">
              {scopedBlocks.map((b) => (
                <ToggleChip
                  key={b.id}
                  label={b.code}
                  selected={blockIds.includes(b.id)}
                  onClick={() => {
                    const next = blockIds.includes(b.id)
                      ? blockIds.filter((id) => id !== b.id)
                      : [...blockIds, b.id];
                    onBlockIdsChange(next);
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {blockIds.length ? (
          <p className="mt-1 text-xs text-muted-foreground">{blockIds.length} selected</p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Activities</p>
        <Input
          id="activity-search"
          placeholder="Search activities…"
          value={activityQuery}
          onChange={(e) => setActivityQuery(e.target.value)}
          className="mb-2 h-8"
        />
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities in master.</p>
        ) : filteredActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-md border p-2">
            <div className="flex flex-wrap gap-1.5">
              {filteredActivities.map((a) => (
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
              ))}
            </div>
          </div>
        )}
        {activityIds.length ? (
          <p className="mt-1 text-xs text-muted-foreground">{activityIds.length} selected</p>
        ) : null}
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
