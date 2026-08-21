"use client";

import { useState } from "react";
import { useWorkOrders, useCreateWorkOrder } from "@/hooks/use-work-orders";
import { DataTable } from "@/components/data-table/data-table";
import { workOrderColumns } from "@/components/data-table/columns/work-order-columns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderForm } from "@/components/forms/work-order/work-order-form";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Closed", value: "closed" },
];

export default function WorkOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: workOrders = [], isLoading } = useWorkOrders(
    statusFilter ? { status: statusFilter } : undefined
  );
  const createMutation = useCreateWorkOrder();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      <div className="flex items-center gap-4">
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
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <DataTable columns={workOrderColumns} data={workOrders} searchKey="activity" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Work Order">
        <WorkOrderForm
          isPending={createMutation.isPending}
          onSubmit={(values) =>
            createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
          }
        />
      </Modal>
    </div>
  );
}
