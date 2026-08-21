"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useVendor } from "@/hooks/use-vendors";
import { vendorApi } from "@/lib/api/vendors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Shield, Users, FileText, Star } from "lucide-react";

export default function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const router = useRouter();
  const { data: vendor, isLoading } = useVendor(vendorId);

  const scorecards = useQuery({
    queryKey: ["vendor-scorecards", vendorId],
    queryFn: () => vendorApi.listScorecards({ vendorId }),
    enabled: !!vendorId,
  });

  const users = useQuery({
    queryKey: ["vendor-users", vendorId],
    queryFn: () => vendorApi.listUsers(vendorId),
    enabled: !!vendorId,
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  if (!vendor) return <div className="py-12 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">{vendor.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{vendor.category.replace(/_/g, " ")}</p>
        </div>
        <div className="flex items-center gap-2">
          {vendor.isDefaultExecutionPartner && <Badge variant="default">Default Partner</Badge>}
          <StatusBadge status={vendor.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Vendor Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="ID" value={vendor.id} />
            <Row label="Category" value={vendor.category.replace(/_/g, " ")} />
            <Row label="Services" value={vendor.servicesProvided} />
            <Row label="Prequalified" value={vendor.prequalified ? "Yes" : "No"} />
            <Row label="Registered" value={formatDate(vendor.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Insurance (Schedule 4)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Insurance on File" value={vendor.insuranceOnFile ? "Yes" : "No"} />
            <Row
              label="Expiry"
              value={vendor.insuranceExpiry ? formatDate(vendor.insuranceExpiry) : "N/A"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Scorecards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scorecards.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (scorecards.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No scorecards yet.</p>
            ) : (
              (scorecards.data as Array<{ id: string; reviewPeriod: string; overallScore: number }>).map(
                (s) => (
                  <div key={s.id} className="flex justify-between text-sm border-b border-border/60 py-2 last:border-0">
                    <span>{s.reviewPeriod}</span>
                    <span className="font-mono font-medium">{s.overallScore}/100</span>
                  </div>
                ),
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (users.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No users linked.</p>
            ) : (
              (users.data as Array<{ id: string; name: string; email: string; role: string }>).map((u) => (
                <div key={u.id} className="flex justify-between text-sm border-b border-border/60 py-2 last:border-0">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{u.role.replaceAll("_", " ")}</span>
                </div>
              ))
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
