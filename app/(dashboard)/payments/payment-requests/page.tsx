"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { paymentRequestColumns } from "@/components/data-table/columns/payment-request-columns";
import { usePaymentRequests, useCreatePaymentRequest } from "@/hooks/use-payment-requests";
import { PaymentRequestForm } from "@/components/forms/payment-request/payment-request-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PaymentRequestsPage() {
  const [open, setOpen] = useState(false);
  const { data = [], isLoading } = usePaymentRequests();
  const create = useCreatePaymentRequest();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Requests</h1>
          <p className="text-sm text-muted-foreground">Manage payment requests for field operations</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {isLoading ? (
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
    </div>
  );
}
