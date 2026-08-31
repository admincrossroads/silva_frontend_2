"use client";

import { useState } from "react";
import { useWorkOrders, useCreateWorkOrder, useIssueWorkOrder, useStartWorkOrder, useCompleteWorkOrder, useCloseWorkOrder } from "@/hooks/use-work-orders";
import { DataTable } from "@/components/data-table/data-table";
import { workOrderColumns } from "@/components/data-table/columns/work-order-columns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderForm } from "@/components/forms/work-order/work-order-form";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { DraggableBoardView } from "@/components/items/draggable-board-view";
import { SeasonCalendarEmbed } from "@/components/calendar/season-calendar-embed";
import { WO_WORKFLOW } from "@/lib/config/procore-modules";
import { BOARD_TRANSITIONS, boardTransitionKey, workOrderToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BoardItem } from "@/components/items/types";
import { useRole } from "@/hooks/use-role";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "In Progress", value: "in_progress" },
  { label: "Complete", value: "complete" },
  { label: "Closed", value: "closed" },
];

export default function WorkOrdersPage() {
  const { isSpx, isSystemAdmin } = useRole();
  const canManageWo = isSpx || isSystemAdmin;
  const [view, setView] = useState<ModuleViewMode>("board");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: workOrders = [], isLoading } = useWorkOrders(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const createMutation = useCreateWorkOrder();
  const issueMutation = useIssueWorkOrder();
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const closeMutation = useCloseWorkOrder();
  const boardItems = workOrders.map(workOrderToBoardItem);

  const handleMove = (item: BoardItem, toStatus: string) => {
    const action = BOARD_TRANSITIONS.work_order[boardTransitionKey(item.status, toStatus)];
    if (action === "issue") {
      if (!canManageWo) return;
      issueMutation.mutate({ id: item.id, comment: "" });
    } else if (action === "start") startMutation.mutate(item.id);
    else if (action === "complete") completeMutation.mutate(item.id);
    else if (action === "close") {
      if (!canManageWo) return;
      closeMutation.mutate({ id: item.id, comment: "" });
    }
  };

  return (
    <ModulePageShell
      moduleId="schedule"
      view={view}
      onViewChange={setView}
      viewModes={["board", "table", "calendar"]}
      actions={
        canManageWo ? (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        ) : undefined
      }
      filters={
        view !== "calendar" ? (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value || "__all__"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
    >
      {view === "calendar" ? (
        <SeasonCalendarEmbed />
      ) : view === "board" ? (
        <DraggableBoardView
          columns={WO_WORKFLOW}
          items={boardItems}
          loading={isLoading}
          onItemMove={handleMove}
        />
      ) : isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <DataTable columns={workOrderColumns} data={workOrders} searchKey="activity" getRowStatus={(row) => row.status} />
      )}

      {canManageWo ? (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Work Order">
          <WorkOrderForm
            isPending={createMutation.isPending}
            onSubmit={(values) =>
              createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
            }
          />
        </Modal>
      ) : null}
    </ModulePageShell>
  );
}
