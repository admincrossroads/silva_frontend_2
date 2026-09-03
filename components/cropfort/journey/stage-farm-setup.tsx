"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SimplePagination, useClientPagination } from "@/components/ui/simple-pagination";
import {
  useAddFarmEstateBlock,
  useFarmEstate,
  useRemoveFarmEstateBlock,
  useUpdateFarmEstate,
  useUpdateFarmEstateBlock,
} from "@/hooks/use-farm-estates";

type Props = { farmId: string };

const WORKBOOK_BLOCK_CODE = /^BLK-\d+$/;

type BlockDraft = {
  areaHa: string;
  treeCount: string;
  varietyPlanted: string;
  plantingDate: string;
};

function toDraft(block: {
  areaHa: number | null;
  treeCount: number | null;
  varietyPlanted?: string | null;
  plantingDate?: string | null;
}): BlockDraft {
  return {
    areaHa: block.areaHa != null ? String(block.areaHa) : "",
    treeCount: block.treeCount != null ? String(block.treeCount) : "",
    varietyPlanted: block.varietyPlanted || "",
    plantingDate: block.plantingDate || "",
  };
}

const cellInput =
  "h-8 min-w-0 w-full rounded-md border border-input bg-background px-2 text-sm tabular-nums shadow-none";

export function StageFarmSetup({ farmId }: Props) {
  const qc = useQueryClient();
  const { data: farm, isLoading } = useFarmEstate(farmId);
  const updateFarm = useUpdateFarmEstate();
  const updateBlock = useUpdateFarmEstateBlock();
  const addBlock = useAddFarmEstateBlock();
  const removeBlock = useRemoveFarmEstateBlock();

  const refreshGates = () => qc.invalidateQueries({ queryKey: ["farm-workflow", farmId] });

  const [termStartDate, setTermStartDate] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, BlockDraft>>({});
  const [newCode, setNewCode] = useState("");
  const [newAreaHa, setNewAreaHa] = useState("");
  const [removeError, setRemoveError] = useState<string | null>(null);

  const blocks = farm?.blocks ?? [];
  const pagination = useClientPagination(blocks, 10);

  if (isLoading || !farm) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const termValue = termStartDate ?? farm.termStartDate ?? "";
  const blocksMissingArea = farm.blocks.filter((b) => b.areaHa == null || b.areaHa <= 0);
  const legacyBlocks = farm.blocks.filter((b) => !WORKBOOK_BLOCK_CODE.test(b.code));

  const draftFor = (block: (typeof farm.blocks)[number]) => drafts[block.id] ?? toDraft(block);

  const setDraft = (blockId: string, patch: Partial<BlockDraft>) =>
    setDrafts((prev) => ({
      ...prev,
      [blockId]: {
        ...(prev[blockId] ?? { areaHa: "", treeCount: "", varietyPlanted: "", plantingDate: "" }),
        ...patch,
      },
    }));

  const saveBlock = async (blockId: string) => {
    const block = farm.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const draft = draftFor(block);
    await updateBlock.mutateAsync({
      estateId: farmId,
      blockId,
      areaHa: draft.areaHa === "" ? null : Number(draft.areaHa),
      treeCount: draft.treeCount === "" ? null : Number(draft.treeCount),
      varietyPlanted: draft.varietyPlanted.trim() || null,
      plantingDate: draft.plantingDate || null,
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
    await refreshGates();
  };

  const onRemoveBlock = async (blockId: string, code: string) => {
    setRemoveError(null);
    if (!window.confirm(`Remove block ${code}?`)) return;
    try {
      await removeBlock.mutateAsync({ estateId: farmId, blockId });
      await refreshGates();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message;
      setRemoveError(message || `Could not remove block ${code}.`);
    }
  };

  const onRemoveLegacyBlocks = async () => {
    setRemoveError(null);
    const legacy = farm.blocks.filter((b) => !WORKBOOK_BLOCK_CODE.test(b.code));
    if (!legacy.length) return;
    if (!window.confirm(`Remove ${legacy.length} non-workbook block(s)?`)) return;

    const failed: string[] = [];
    for (const block of legacy) {
      try {
        await removeBlock.mutateAsync({ estateId: farmId, blockId: block.id });
      } catch {
        failed.push(block.code);
      }
    }
    await refreshGates();
    if (failed.length) {
      setRemoveError(`Could not remove ${failed.join(", ")}.`);
    }
  };

  const onAddBlock = async () => {
    if (!newCode.trim()) return;
    await addBlock.mutateAsync({
      estateId: farmId,
      code: newCode.trim(),
      areaHa: newAreaHa === "" ? undefined : Number(newAreaHa),
    });
    setNewCode("");
    setNewAreaHa("");
    await refreshGates();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="termStartDate">Term start</Label>
          <div className="flex gap-2">
            <Input
              id="termStartDate"
              type="date"
              value={termValue}
              onChange={(e) => setTermStartDate(e.target.value)}
              className="h-8"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={updateFarm.isPending || !termValue || termValue === farm.termStartDate}
              onClick={() =>
                updateFarm
                  .mutateAsync({ id: farmId, termStartDate: termValue })
                  .then(() => setTermStartDate(null))
                  .then(refreshGates)
              }
            >
              Save
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Summary</Label>
          <p className="text-sm text-muted-foreground">
            {farm.blocks.length} blocks
            {blocksMissingArea.length ? ` · ${blocksMissingArea.length} missing ha` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Blocks</Label>
          {legacyBlocks.length ? (
            <Button
              size="sm"
              variant="outline"
              disabled={removeBlock.isPending}
              onClick={onRemoveLegacyBlocks}
            >
              Remove {legacyBlocks.length} non-workbook
            </Button>
          ) : null}
        </div>
        {removeError ? <p className="text-sm text-destructive">{removeError}</p> : null}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Code</th>
                  <th className="px-2 py-2 font-medium">Ha</th>
                  <th className="px-2 py-2 font-medium">Trees</th>
                  <th className="px-2 py-2 font-medium">Variety</th>
                  <th className="px-2 py-2 font-medium">Planted</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pagination.slice.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      No blocks
                    </td>
                  </tr>
                ) : (
                  pagination.slice.map((block) => {
                    const draft = draftFor(block);
                    const dirty = Boolean(drafts[block.id]);
                    return (
                      <tr key={block.id} className="border-b last:border-0">
                        <td className="px-2 py-1.5 font-medium">{block.code}</td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={cellInput}
                            value={draft.areaHa}
                            onChange={(e) => setDraft(block.id, { areaHa: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            min="0"
                            className={cellInput}
                            value={draft.treeCount}
                            onChange={(e) => setDraft(block.id, { treeCount: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            className={cellInput.replace(" tabular-nums", "")}
                            value={draft.varietyPlanted}
                            onChange={(e) => setDraft(block.id, { varietyPlanted: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="date"
                            className={cellInput}
                            value={draft.plantingDate}
                            onChange={(e) => setDraft(block.id, { plantingDate: e.target.value })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              disabled={!dirty || updateBlock.isPending}
                              onClick={() => saveBlock(block.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              disabled={removeBlock.isPending}
                              onClick={() => onRemoveBlock(block.id, block.code)}
                              aria-label={`Remove block ${block.code}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <SimplePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </Card>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="newBlockCode">Code</Label>
          <Input
            id="newBlockCode"
            className="h-8 w-24"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="BLK-021"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="newBlockArea">Ha</Label>
          <Input
            id="newBlockArea"
            type="number"
            step="0.01"
            min="0"
            className="h-8 w-24"
            value={newAreaHa}
            onChange={(e) => setNewAreaHa(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={!newCode.trim() || addBlock.isPending}
          onClick={onAddBlock}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
