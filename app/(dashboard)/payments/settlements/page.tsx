"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { settlementColumns } from "@/components/data-table/columns/settlement-columns";
import { useSettlements, useCreateSettlement } from "@/hooks/use-settlements";
import { SettlementForm } from "@/components/forms/settlement/settlement-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SettlementsPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useSettlements();
  const create = useCreateSettlement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settlements</h1>
          <p className="text-sm text-muted-foreground">Track owner settlement payments</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Settlement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <DataTable columns={settlementColumns} data={data} searchKey="payee" />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Settlement">
        <SettlementForm
          isPending={create.isPending}
          onSubmit={(values) => {
            create.mutate(values, { onSuccess: () => setOpen(false) });
          }}
        />
      </Modal>
    </div>
  );
}
