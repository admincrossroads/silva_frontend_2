"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  useRateCardLines,
  useApproveRateCardLine,
  useReturnRateCardLine,
} from "@/hooks/use-rate-card";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

function formatEtb(value: number | string | null | undefined) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(n);
}

export default function RateCardApprovalsPage() {
  const { isSilva } = useRole();
  const { data: lines = [], isLoading } = useRateCardLines("submitted");
  const approve = useApproveRateCardLine();
  const returnLine = useReturnRateCardLine();
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (!isSilva) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Silva approvers only — submitted rate card lines appear here for line-level approval.
      </div>
    );
  }

  const handleReturn = async () => {
    if (!returnTarget || !comment.trim()) return;
    await returnLine.mutateAsync({ lineId: returnTarget, comment: comment.trim() });
    setReturnTarget(null);
    setComment("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rate card approvals</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Resource</th>
                <th className="px-3 py-2 font-medium text-right">Rate ETB</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No lines awaiting approval.
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{line.resourceCode}</td>
                    <td className="px-3 py-2">{line.resourceName}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatEtb(line.rateEtb)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {line.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approve.isPending}
                          onClick={() => approve.mutate({ lineId: line.id })}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setReturnTarget(line.id);
                            setComment("");
                          }}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Return
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title="Return rate line"
        description="A comment is required when returning a line to SPX."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Decision comment</Label>
            <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReturnTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!comment.trim() || returnLine.isPending}
              onClick={handleReturn}
            >
              Return line
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
