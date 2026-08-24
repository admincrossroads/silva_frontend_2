"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { paymentRequestColumns } from "@/components/data-table/columns/payment-request-columns";
import { usePaymentRequests, useCreatePaymentRequest } from "@/hooks/use-payment-requests";
import { PaymentRequestForm } from "@/components/forms/payment-request/payment-request-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { BoardView } from "@/components/items/board-view";
import { DEFAULT_WORKFLOW } from "@/lib/config/procore-modules";
import { paymentRequestToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import { Plus } from "lucide-react";

const BOARD_COLUMNS = [...DEFAULT_WORKFLOW, "rejected"] as const;

export default function PaymentRequestsPage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModuleViewMode>("board");
  const { data = [], isLoading } = usePaymentRequests();
  const create = useCreatePaymentRequest();
  const boardItems = data.map(paymentRequestToBoardItem);

  return (
    <ModulePageShell
      moduleId="billing"
      view={view}
      onViewChange={setView}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New invoice
        </Button>
      }
    >
      {view === "board" ? (
        <BoardView columns={BOARD_COLUMNS} items={boardItems} loading={isLoading} />
      ) : isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <DataTable columns={paymentRequestColumns} data={data} searchKey="type" />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Payment Request">
        <PaymentRequestForm
          isPending={create.isPending}
          onSubmit={(values) => {
            create.mutate(values, { onSuccess: () => setOpen(false) });
          }}
        />
      </Modal>
    </ModulePageShell>
  );
}
