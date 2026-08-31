"use client";

import { useMemo, useState } from "react";
import { DollarSign, FileText, Layers, TrendingUp } from "lucide-react";
import { useAfps } from "@/hooks/use-afps";
import { usePermissions } from "@/hooks/use-permissions";
import { afpColumns } from "@/components/data-table/columns/afp-columns";
import { DataTable } from "@/components/data-table/data-table";
import { Modal } from "@/components/ui/modal";
import { AfpForm } from "@/components/forms/afp/afp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { BoardSummaryStrip } from "@/components/items/board-summary-strip";
import { afpToBoardItem, BOARD_TRANSITIONS, boardTransitionKey } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BoardItem } from "@/components/items/types";
import { useSubmitAfp, useApproveAfp } from "@/hooks/use-afps";
import { useRole } from "@/hooks/use-role";
import { formatEtb } from "@/lib/utils/format";

const STATUSES = ["draft", "submitted", "approved", "closed"];
const SPX_BOARD_COLUMNS = ["draft", "submitted", "approved", "closed"] as const;
const SILVA_BOARD_COLUMNS = ["draft", "approved", "closed"] as const;

export default function AfpPage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModuleViewMode>("board");
  const [year, setYear] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const { has } = usePermissions();
  const { isSilva } = useRole();
  const canCreate = !isSilva && has("afp.create");
  const BOARD_COLUMNS = isSilva ? SILVA_BOARD_COLUMNS : SPX_BOARD_COLUMNS;

  const { data: afps = [], isLoading } = useAfps({ year, status });
  const submitAfp = useSubmitAfp();
  const approveAfp = useApproveAfp();
  const boardItems = afps.map(afpToBoardItem);

  const totalBudget = useMemo(
    () => afps.reduce((sum, row) => sum + (row.budgetAllocatedEtb ?? 0), 0),
    [afps],
  );

  const approvedBudget = useMemo(
    () =>
      afps.filter((row) => row.status === "approved" || row.status === "closed").reduce((sum, row) => sum + (row.budgetAllocatedEtb ?? 0), 0),
    [afps],
  );

  const columnSummaries = useMemo(() => {
    const map: Record<string, string> = {};
    for (const col of BOARD_COLUMNS) {
      const total = afps.filter((row) => row.status === col).reduce((sum, row) => sum + (row.budgetAllocatedEtb ?? 0), 0);
      if (total > 0) map[col] = formatEtb(total);
    }
    return map;
  }, [afps, BOARD_COLUMNS]);

  const handleMove = (item: BoardItem, toStatus: string) => {
    const action = BOARD_TRANSITIONS.afp[boardTransitionKey(item.status, toStatus)];
    if (action === "submit") submitAfp.mutate({ id: item.id, comment: "" });
    else if (action === "approve") approveAfp.mutate({ id: item.id, comment: "" });
  };

  return (
    <ModulePageShell
      moduleId="budget"
      view={view}
      onViewChange={setView}
      actions={
        canCreate ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create AFP
          </Button>
        ) : undefined
      }
      filters={
        <>
          <Input
            type="number"
            placeholder="Year"
            className="w-28"
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Select value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      <div className="space-y-5">
        <BoardSummaryStrip
          stats={[
            {
              label: "Total lines",
              value: String(afps.length),
              sublabel: year ? `Plan year ${year}` : "All years",
              icon: Layers,
              tone: "primary",
            },
            {
              label: "Total budget",
              value: formatEtb(totalBudget),
              sublabel: "Allocated ETB",
              icon: DollarSign,
            },
            {
              label: "Approved budget",
              value: formatEtb(approvedBudget),
              sublabel: "Approved + closed",
              icon: TrendingUp,
              tone: "emerald",
            },
            {
              label: "In workflow",
              value: String(afps.filter((r) => r.status === "submitted" || r.status === "draft").length),
              sublabel: "Draft & submitted",
              icon: FileText,
              tone: "amber",
            },
          ]}
        />
        {view === "board" ? (
          <DraggableBoardView
            columns={BOARD_COLUMNS}
            items={boardItems}
            loading={isLoading}
            columnSummaries={columnSummaries}
            onItemMove={handleMove}
            emptyMessage="No AFP lines yet. Create a line to start building the annual farm program."
          />
        ) : (
          <DataTable
            columns={afpColumns}
            data={afps}
            searchKey="activity"
            emptyMessage="No AFP lines found"
            getRowStatus={(row) => row.status}
          />
        )}
      </div>

      {canCreate && (
        <Modal title="Create AFP" isOpen={open} onClose={() => setOpen(false)}>
          <AfpForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
    </ModulePageShell>
  );
}
