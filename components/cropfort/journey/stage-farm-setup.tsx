"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddFarmEstateBlock,
  useFarmEstate,
  useRemoveFarmEstateBlock,
  useUpdateFarmEstate,
  useUpdateFarmEstateBlock,
} from "@/hooks/use-farm-estates";

type Props = { farmId: string };

/** The workbook's Master sheet registers blocks as BLK-001…BLK-020. */
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

  if (isLoading || !farm) {
    return <p className="text-sm text-muted-foreground">Loading farm setup…</p>;
  }

  const termValue = termStartDate ?? farm.termStartDate ?? "";
  const blocksMissingArea = farm.blocks.filter((b) => b.areaHa == null || b.areaHa <= 0);
  const legacyBlocks = farm.blocks.filter((b) => !WORKBOOK_BLOCK_CODE.test(b.code));

  const draftFor = (block: (typeof farm.blocks)[number]) => drafts[block.id] ?? toDraft(block);

  const setDraft = (blockId: string, patch: Partial<BlockDraft>) =>
    setDrafts((prev) => ({
      ...prev,
      [blockId]: { ...(prev[blockId] ?? { areaHa: "", treeCount: "", varietyPlanted: "", plantingDate: "" }), ...patch },
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
    if (!window.confirm(`Remove block ${code}? This cannot be undone.`)) return;
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
    const codes = legacy.map((b) => b.code).join(", ");
    if (!window.confirm(`Remove ${legacy.length} block(s) not in the workbook (${codes})?`)) return;

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
      setRemoveError(`Could not remove ${failed.join(", ")} — still referenced by other records.`);
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="termStartDate">Term start date</Label>
          <div className="flex gap-2">
            <Input
              id="termStartDate"
              type="date"
              value={termValue}
              onChange={(e) => setTermStartDate(e.target.value)}
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
          <p className="text-xs text-muted-foreground">
            Drives election windows and the master plan calendar.
          </p>
        </div>
        <div className="space-y-1">
          <Label>Farm</Label>
          <p className="text-sm font-medium">{farm.name}</p>
          <p className="text-xs text-muted-foreground">
            {farm.blocks.length} block{farm.blocks.length === 1 ? "" : "s"} ·{" "}
            {blocksMissingArea.length
              ? `${blocksMissingArea.length} missing hectares`
              : "all blocks have hectares"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label>Blocks</Label>
          {legacyBlocks.length ? (
            <Button
              size="sm"
              variant="outline"
              disabled={removeBlock.isPending}
              onClick={onRemoveLegacyBlocks}
            >
              Remove {legacyBlocks.length} block{legacyBlocks.length === 1 ? "" : "s"} not in
              workbook
            </Button>
          ) : null}
        </div>
        {removeError ? <p className="text-sm text-destructive">{removeError}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Hectares</TableHead>
              <TableHead>Trees</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Planting date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {farm.blocks.map((block) => {
              const draft = draftFor(block);
              const dirty = Boolean(drafts[block.id]);
              return (
                <TableRow key={block.id}>
                  <TableCell className="font-medium">{block.code}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-8 w-24"
                      value={draft.areaHa}
                      onChange={(e) => setDraft(block.id, { areaHa: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      className="h-8 w-24"
                      value={draft.treeCount}
                      onChange={(e) => setDraft(block.id, { treeCount: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 w-32"
                      value={draft.varietyPlanted}
                      onChange={(e) => setDraft(block.id, { varietyPlanted: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      className="h-8 w-36"
                      value={draft.plantingDate}
                      onChange={(e) => setDraft(block.id, { plantingDate: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!dirty || updateBlock.isPending}
                        onClick={() => saveBlock(block.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={removeBlock.isPending}
                        onClick={() => onRemoveBlock(block.id, block.code)}
                        aria-label={`Remove block ${block.code}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="newBlockCode">New block code</Label>
          <Input
            id="newBlockCode"
            className="h-9 w-28"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="G"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="newBlockArea">Hectares</Label>
          <Input
            id="newBlockArea"
            type="number"
            step="0.01"
            min="0"
            className="h-9 w-28"
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
          Add block
        </Button>
      </div>
    </div>
  );
}
