"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/api/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RevenueRow = {
  id: string;
  description?: string;
  amountUsd: number;
  paymentStatus: string;
  period?: string;
  createdAt?: string;
};

export default function RevenueLedgerPage() {
  const { has } = usePermissions();
  const router = useRouter();
  const allowed = has("revenue_ledger.full");

  useEffect(() => {
    if (!allowed) router.replace("/dashboard");
  }, [allowed, router]);

  const { data = [], isLoading } = useQuery<RevenueRow[]>({
    queryKey: ["revenue-ledger"],
    queryFn: () => platformApi.listRevenue(),
    enabled: allowed,
  });

  if (!allowed) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">SPX Revenue Ledger</h1>
        <p className="page-description">
          Principal-only. Never shared with Silva or vendors — application firewall enforced.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ledger entries.</p>
          ) : (
            <div className="divide-y">
              {data.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{row.description || row.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.period || "—"} · {row.createdAt ? formatDate(row.createdAt) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">{formatCurrency(row.amountUsd)}</span>
                    <StatusBadge status={row.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
