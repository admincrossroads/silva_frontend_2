"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  useActivityMaster,
  useActivityTemplates,
  useCreateActivityMaster,
} from "@/hooks/use-activity-master";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ActivityMasterPage() {
  const { isSpx, isSystemAdmin } = useRole();
  const canEdit = isSpx || isSystemAdmin;
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [laborNorm, setLaborNorm] = useState("");
  const [materialNorm, setMaterialNorm] = useState("");

  const { data: activities = [], isLoading } = useActivityMaster();
  const { data: templates = [] } = useActivityTemplates();
  const createActivity = useCreateActivityMaster();

  const latestByCode = useMemo(() => {
    const map = new Map<string, (typeof activities)[number]>();
    for (const row of activities) {
      if (!map.has(row.code)) map.set(row.code, row);
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [activities]);

  const handleCreate = async () => {
    if (!templateId) return;
    await createActivity.mutateAsync({
      templateId,
      laborNorm: laborNorm ? Number(laborNorm) : null,
      materialNorm: materialNorm ? Number(materialNorm) : null,
    });
    setTemplateId("");
    setLaborNorm("");
    setMaterialNorm("");
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity master</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Program norms linked to the global template library — used for block AFP costing.
          </p>
        </div>
        {canEdit ? (
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add from template
          </Button>
        ) : null}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium text-right">Labor norm</th>
                <th className="px-3 py-2 font-medium text-right">Material norm</th>
                <th className="px-3 py-2 font-medium">UoM</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Loading activities…
                  </td>
                </tr>
              ) : latestByCode.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No program activities yet. {canEdit ? "Add activities from the template library." : ""}
                  </td>
                </tr>
              ) : (
                latestByCode.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.template?.category ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{row.laborNorm ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{row.materialNorm ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.template?.unitOfMeasure ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add activity from template">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.code} — {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Labor norm</Label>
              <Input type="number" min={0} step="0.0001" value={laborNorm} onChange={(e) => setLaborNorm(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Material norm</Label>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={materialNorm}
                onChange={(e) => setMaterialNorm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!templateId || createActivity.isPending}>
              Add activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
