"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { activityRequestApi, type ActivityRequest } from "@/lib/api/activity-requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/badges/status-badge";
import { formatDate } from "@/lib/utils/format";
import { Plus } from "lucide-react";

export default function MyActivityRequestsPage() {
  const { data: requests = [], isLoading } = useQuery<ActivityRequest[]>({
    queryKey: ["activity-requests", "mine"],
    queryFn: () => activityRequestApi.findAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My activity requests</h1>
          <p className="text-sm text-muted-foreground">
            Ad-hoc Silva asks (cupping, farm status, etc.) routed to SPX Planner intake.
          </p>
        </div>
        <Button asChild>
          <Link href="/planning/requests/new">
            <Plus className="mr-2 h-4 w-4" /> Request activity
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No requests yet. Submit an ad-hoc activity for the estate.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {r.requestType.replace(/_/g, " ")} · submitted {formatDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </CardHeader>
              <CardContent>
                <p className="text-sm">{r.description}</p>
                {r.convertedAfeId ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Converted to AFE{" "}
                    <Link href={`/planning/afe/${r.convertedAfeId}`} className="text-primary underline">
                      {r.convertedAfeId.slice(0, 8)}
                    </Link>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
