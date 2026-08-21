"use client";

import { useState } from "react";
import { useFieldTickets, useCreateFieldTicket } from "@/hooks/use-field-tickets";
import { DataTable } from "@/components/data-table/data-table";
import { fieldTicketColumns } from "@/components/data-table/columns/field-ticket-columns";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldTicketForm } from "@/components/forms/field-ticket/field-ticket-form";
import { Plus } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Validated", value: "validated" },
  { label: "Rejected", value: "rejected" },
];

export default function FieldTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: fieldTickets = [], isLoading } = useFieldTickets(
    statusFilter ? { status: statusFilter } : undefined
  );
  const createMutation = useCreateFieldTicket();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Field Tickets</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Field Ticket
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
        <DataTable columns={fieldTicketColumns} data={fieldTickets} searchKey="activityRecorded" />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Field Ticket">
        <FieldTicketForm
          isPending={createMutation.isPending}
          onSubmit={(values) =>
            createMutation.mutate(values, { onSuccess: () => setModalOpen(false) })
          }
        />
      </Modal>
    </div>
  );
}
