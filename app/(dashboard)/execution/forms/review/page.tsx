"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ifsFormApi } from "@/lib/api/field-ops";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/badges/status-badge";
import { formatDate } from "@/lib/utils/format";

type IfsForm = {
  id: string;
  formType: string;
  title: string;
  blockRef: string | null;
  status: string;
  createdAt: string;
};

export default function FormsReviewQueuePage() {
  const qc = useQueryClient();
  const [error, setError] = useState("");

  const { data: queue = [], isLoading } = useQuery<IfsForm[]>({
    queryKey: ["ifs-forms", "review-queue"],
    queryFn: () => ifsFormApi.findAll({ status: "submitted" }),
  });

  const review = useMutation({
    mutationFn: (id: string) => ifsFormApi.vendorReview(id),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["ifs-forms"] });
    },
    onError: (err) => setError(getApiErrorMessage(err, "Could not approve log")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Form review queue</h1>
        <p className="text-sm text-muted-foreground">
          B-Agro Manager / Supervisor desk — approve field monitoring logs before SPX validation.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No submitted logs awaiting manager review.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {queue.map((form) => (
            <Card key={form.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {form.formType.replace(/_/g, " ")} · {form.blockRef || "—"} ·{" "}
                    {formatDate(form.createdAt)}
                  </p>
                </div>
                <StatusBadge status={form.status} />
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button
                  size="sm"
                  disabled={review.isPending}
                  onClick={() => review.mutate(form.id)}
                >
                  Approve for SPX validation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
