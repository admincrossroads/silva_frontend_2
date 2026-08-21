"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { vendorColumns } from "@/components/data-table/columns/vendor-columns";
import { useVendors, useCreateVendor } from "@/hooks/use-vendors";
import { VendorForm } from "@/components/forms/vendor/vendor-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function VendorsPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = useVendors();
  const create = useCreateVendor();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Registry</h1>
          <p className="text-sm text-muted-foreground">Manage vendors and execution partners</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <DataTable columns={vendorColumns} data={data} searchKey="name" />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Vendor">
        <VendorForm
          isPending={create.isPending}
          onSubmit={(values) => {
            create.mutate(values as Record<string, unknown>, { onSuccess: () => setOpen(false) });
          }}
        />
      </Modal>
    </div>
  );
}
