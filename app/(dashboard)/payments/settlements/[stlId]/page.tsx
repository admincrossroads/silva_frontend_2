"use client";

import { useParams, useRouter } from "next/navigation";
import { useSettlement, useAuthorizeSettlement, useMarkSettled } from "@/hooks/use-settlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft } from "lucide-react";

export default function SettlementDetailPage() {
  const { stlId } = useParams<{ stlId: string }>();
  const router = useRouter();
  const { data: stl, isLoading } = useSettlement(stlId);
  const authorize = useAuthorizeSettlement();
  const markSettled = useMarkSettled();

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  if (!stl) return <div className="py-12 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settlement</h1>
          <p className="font-mono text-sm text-muted-foreground">{stl.id}</p>
        </div>
        <StatusBadge status={stl.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Work Order" value={stl.workOrderId} />
            <Row label="Payment Request" value={stl.paymentRequestId} />
            <Row label="Type" value={stl.type.replace(/_/g, " ")} />
            <Row label="Payee" value={stl.payee} />
            <Row label="Amount (ETB)" value={formatCurrency(stl.amountEtb, "ETB")} />
            <Row label="Created" value={formatDate(stl.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stl.status === "pending" && (
              <Button className="w-full" onClick={() => authorize.mutate(stlId)} disabled={authorize.isPending}>
                Authorize Settlement
              </Button>
            )}
            {stl.status === "authorized" && (
              <Button className="w-full" onClick={() => markSettled.mutate(stlId)} disabled={markSettled.isPending}>
                Mark as Settled
              </Button>
            )}
            {stl.status === "settled" && (
              <p className="text-sm text-muted-foreground text-center py-4">This settlement has been completed.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
