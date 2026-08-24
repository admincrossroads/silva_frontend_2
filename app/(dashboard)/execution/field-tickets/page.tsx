"use client";

import { useEffect, useState } from "react";
import {
  useFieldTickets,
  useCreateFieldTicket,
  useSubmitFieldTicket,
  useVendorReviewFieldTicket,
  useValidateFieldTicket,
} from "@/hooks/use-field-tickets";
import { DataTable } from "@/components/data-table/data-table";
import { fieldTicketColumns } from "@/components/data-table/columns/field-ticket-columns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldTicketForm } from "@/components/forms/field-ticket/field-ticket-form";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { DraggableBoardView } from "@/components/items/draggable-board-view";
import { BOARD_TRANSITIONS, boardTransitionKey, fieldTicketToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BoardItem } from "@/components/items/types";
import {
  listOfflineFieldTicketDrafts,
  removeOfflineFieldTicketDraft,
  type OfflineFieldTicketDraft,
} from "@/lib/offline/field-ticket-drafts";
import { Plus, WifiOff } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Vendor reviewed", value: "vendor_reviewed" },
  { label: "Validated", value: "validated" },
  { label: "Rejected", value: "rejected" },
];

const BOARD_COLUMNS = ["draft", "submitted", "vendor_reviewed", "validated", "rejected"] as const;

export default function FieldTicketsPage() {
  const [view, setView] = useState<ModuleViewMode>("board");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineFieldTicketDraft[]>([]);

  const { data: fieldTickets = [], isLoading } = useFieldTickets(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const createMutation = useCreateFieldTicket();
  const submitMutation = useSubmitFieldTicket();
  const reviewMutation = useVendorReviewFieldTicket();
  const validateMutation = useValidateFieldTicket();
  const boardItems = fieldTickets.map(fieldTicketToBoardItem);

  useEffect(() => {
    setOfflineDrafts(listOfflineFieldTicketDrafts());
  }, [modalOpen]);

  const handleMove = (item: BoardItem, toStatus: string) => {
    const action = BOARD_TRANSITIONS.field_ticket[boardTransitionKey(item.status, toStatus)];
    if (action === "submit") submitMutation.mutate(item.id);
    else if (action === "review") reviewMutation.mutate(item.id);
    else if (action === "validate") validateMutation.mutate({ id: item.id, comment: "" });
  };

  const syncDraft = (draft: OfflineFieldTicketDraft) => {
    createMutation.mutate(
      {
        workOrderId: draft.workOrderId,
        activityRecorded: draft.activityRecorded,
        areaHa: draft.areaHa,
        laborCount: draft.laborCount,
        ticketDate: draft.ticketDate,
        materialsUsed: draft.materialsUsed,
      },
      {
        onSuccess: () => {
          removeOfflineFieldTicketDraft(draft.id);
          setOfflineDrafts(listOfflineFieldTicketDrafts());
        },
      },
    );
  };

  return (
    <ModulePageShell
      moduleId="daily_log"
      view={view}
      onViewChange={setView}
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New daily log entry
        </Button>
      }
      filters={
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
      }
    >
      {offlineDrafts.length > 0 ? (
        <Card className="mb-4 border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <WifiOff className="h-4 w-4 text-amber-700" />
            {offlineDrafts.length} offline draft{offlineDrafts.length === 1 ? "" : "s"}
          </div>
          <ul className="mt-3 space-y-2">
            {offlineDrafts.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {d.activityRecorded} · {d.workOrderId.slice(0, 8)} · {new Date(d.savedAt).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => syncDraft(d)} disabled={createMutation.isPending}>
                    Sync
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removeOfflineFieldTicketDraft(d.id);
                      setOfflineDrafts(listOfflineFieldTicketDrafts());
                    }}
                  >
                    Discard
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {view === "board" ? (
        <DraggableBoardView columns={BOARD_COLUMNS} items={boardItems} loading={isLoading} onItemMove={handleMove} />
      ) : isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <DataTable columns={fieldTicketColumns} data={fieldTickets} searchKey="activityRecorded" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Field Ticket">
        <FieldTicketForm
          isPending={createMutation.isPending}
          onSubmit={(values) =>
            createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
          }
          offlineEnabled
          onOfflineSave={() => setModalOpen(false)}
        />
      </Modal>
    </ModulePageShell>
  );
}
