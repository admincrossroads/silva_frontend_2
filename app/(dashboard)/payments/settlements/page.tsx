"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { settlementColumns } from "@/components/data-table/columns/settlement-columns";
import { useSettlements, useCreateSettlement, useAuthorizeSettlement, useMarkSettled } from "@/hooks/use-settlements";
import { SettlementForm } from "@/components/forms/settlement/settlement-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { DraggableBoardView } from "@/components/items/draggable-board-view";
import { BOARD_TRANSITIONS, boardTransitionKey, SETTLEMENT_COLUMNS, settlementToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import type { BoardItem } from "@/components/items/types";
import { useRole } from "@/hooks/use-role";
import { usePermissions } from "@/hooks/use-permissions";
import { Plus } from "lucide-react";

export default function SettlementsPage() {
  const { isSpx, isSystemAdmin } = useRole();
  const { has } = usePermissions();
  const canManageSettlements = isSpx || isSystemAdmin;
  const canAuthorize = has("settlements.authorize");
  const canMarkSettled = has("settlements.mark_settled");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModuleViewMode>("board");
  const { data = [], isLoading } = useSettlements();
  const create = useCreateSettlement();
  const authorize = useAuthorizeSettlement();
  const markSettled = useMarkSettled();
  const boardItems = data.map(settlementToBoardItem);

  const handleMove = (item: BoardItem, toStatus: string) => {
    const action = BOARD_TRANSITIONS.settlement[boardTransitionKey(item.status, toStatus)];
    if (action === "authorize") {
      if (!canAuthorize) return;
      authorize.mutate(item.id);
    } else if (action === "markSettled") {
      if (!canMarkSettled) return;
      markSettled.mutate(item.id);
    }
  };

  return (
    <ModulePageShell
      moduleId="billing"
      title="Settlements"
      view={view}
      onViewChange={setView}
      actions={
        canManageSettlements ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Settlement
          </Button>
        ) : undefined
      }
    >
      {view === "board" ? (
        <DraggableBoardView
          columns={SETTLEMENT_COLUMNS}
          items={boardItems}
          loading={isLoading}
          onItemMove={handleMove}
        />
      ) : isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <DataTable columns={settlementColumns} data={data} searchKey="payee" getRowStatus={(row) => row.status} />
      )}

      {canManageSettlements ? (
        <Modal open={open} onClose={() => setOpen(false)} title="Create Settlement">
          <SettlementForm
            isPending={create.isPending}
            onSubmit={(values) => {
              create.mutate(values, { onSuccess: () => setOpen(false) });
            }}
          />
        </Modal>
      ) : null}
    </ModulePageShell>
  );
}
