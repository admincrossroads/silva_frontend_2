"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAfes } from "@/hooks/use-afes";
import { afeColumns } from "@/components/data-table/columns/afe-columns";
import { DataTable } from "@/components/data-table/data-table";
import { Modal } from "@/components/ui/modal";
import { AfeForm } from "@/components/forms/afe/afe-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { DraggableBoardView } from "@/components/items/draggable-board-view";
import { DEFAULT_WORKFLOW } from "@/lib/config/procore-modules";
import { afeToBoardItem, BOARD_TRANSITIONS, boardTransitionKey } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BoardItem } from "@/components/items/types";
import {
  useSubmitAfe,
  useValidateAfe,
  useApproveAfe,
} from "@/hooks/use-afes";
import { useRole } from "@/hooks/use-role";
import { usePermissions } from "@/hooks/use-permissions";

const STATUSES = ["draft", "submitted", "validated", "approved", "rejected", "closed"];
const BANDS = ["A", "B", "C", "D"];
const BOARD_COLUMNS = [...DEFAULT_WORKFLOW, "rejected"] as const;

export default function AfePage() {
  const router = useRouter();
  const { isSilva } = useRole();
  const { has } = usePermissions();
  const canCreate = !isSilva && has("afe.create");

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModuleViewMode>("board");
  const [status, setStatus] = useState<string | undefined>();
  const [band, setBand] = useState<string | undefined>();

  useEffect(() => {
    if (isSilva) router.replace("/planning/afp");
  }, [isSilva, router]);

  const { data: afes = [], isLoading } = useAfes({ status, band });
  const submitAfe = useSubmitAfe();
  const validateAfe = useValidateAfe();
  const approveAfe = useApproveAfe();
  const boardItems = afes.map(afeToBoardItem);

  const handleMove = (item: BoardItem, toStatus: string) => {
    const action = BOARD_TRANSITIONS.afe[boardTransitionKey(item.status, toStatus)];
    if (action === "submit") submitAfe.mutate({ id: item.id, comment: "" });
    else if (action === "validate") validateAfe.mutate({ id: item.id, comment: "" });
    else if (action === "approve") approveAfe.mutate({ id: item.id, comment: "" });
  };

  if (isSilva) return null;

  return (
    <ModulePageShell
      moduleId="commitments"
      view={view}
      onViewChange={setView}
      actions={
        canCreate ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create AFE
          </Button>
        ) : null
      }
      filters={
        <>
          <Select value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={band ?? "all"} onValueChange={(v) => setBand(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Band" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bands</SelectItem>
              {BANDS.map((b) => (
                <SelectItem key={b} value={b}>
                  Band {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      {view === "board" ? (
        <DraggableBoardView columns={BOARD_COLUMNS} items={boardItems} loading={isLoading} onItemMove={handleMove} />
      ) : (
        <DataTable columns={afeColumns} data={afes} searchKey="description" />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create AFE">
        <AfeForm onSuccess={() => setOpen(false)} />
      </Modal>
    </ModulePageShell>
  );
}
