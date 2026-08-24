"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { vendorColumns } from "@/components/data-table/columns/vendor-columns";
import { useVendors, useCreateVendor } from "@/hooks/use-vendors";
import { VendorForm } from "@/components/forms/vendor/vendor-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ModulePageShell } from "@/components/items/module-page-shell";
import { BoardView } from "@/components/items/board-view";
import { VENDOR_COLUMNS, vendorToBoardItem } from "@/lib/items/board-adapters";
import type { ModuleViewMode } from "@/lib/config/procore-modules";
import { useRole } from "@/hooks/use-role";
import { Plus } from "lucide-react";

export default function VendorsPage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModuleViewMode>("board");
  const { isSilva, isSpx } = useRole();
  const { data = [], isLoading } = useVendors();
  const create = useCreateVendor();
  const boardItems = data.map(vendorToBoardItem);

  const title = isSilva ? "Assigned vendors" : "Vendor Register";
  const emptyMessage = isSilva
    ? "No execution vendors are assigned to your farm areas yet. SPX will map vendors after onboarding."
    : "No vendors yet.";

  return (
    <ModulePageShell
      moduleId="directory"
      title={title}
      view={view}
      onViewChange={setView}
      actions={
        isSpx ? (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        ) : undefined
      }
    >
      {isSilva ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Read-only view of execution partners SPX has assigned to your farm areas.
        </p>
      ) : null}

      {view === "board" ? (
        !isLoading && boardItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          <BoardView columns={VENDOR_COLUMNS} items={boardItems} loading={isLoading} />
        )
      ) : isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      ) : (
        <DataTable columns={vendorColumns} data={data} searchKey="name" />
      )}

      {isSpx ? (
        <Modal open={open} onClose={() => setOpen(false)} title="Add Vendor">
          <VendorForm
            isPending={create.isPending}
            onSubmit={(values) => {
              create.mutate(values as Record<string, unknown>, { onSuccess: () => setOpen(false) });
            }}
          />
        </Modal>
      ) : null}
    </ModulePageShell>
  );
}
