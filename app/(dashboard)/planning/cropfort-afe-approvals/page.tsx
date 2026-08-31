"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useCropfortAfes, useApproveCropfortAfe, useReturnCropfortAfe } from "@/hooks/use-cropfort-afes";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function CropfortAfeApprovalsPage() {
  const { isSilva } = useRole();
  const { data: afes = [], isLoading } = useCropfortAfes({ status: "submitted" });
  const approve = useApproveCropfortAfe();
  const returnAfe = useReturnCropfortAfe();
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (!isSilva) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Silva approvers only — submitted Cropfort AFEs appear here for approval.
      </div>
    );
  }

  const handleReturn = async () => {
    if (!returnTarget || !comment.trim()) return;
    await returnAfe.mutateAsync({ afeId: returnTarget, comment: comment.trim() });
    setReturnTarget(null);
    setComment("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cropfort AFE approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or return Birr AFE commitments — band is fixed at submission based on amount.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium text-right">Amount ETB</th>
                <th className="px-3 py-2 font-medium">Band</th>
                <th className="px-3 py-2 font-medium">Source</th>
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
              ) : afes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No AFEs awaiting approval.
                  </td>
                </tr>
              ) : (
                afes.map((afe) => (
                  <tr key={afe.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2">{afe.title}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatEtb(afe.amountEtb)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline">Band {afe.band}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{afe.sourceType.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approve.isPending}
                          onClick={() => approve.mutate({ afeId: afe.id })}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setReturnTarget(afe.id);
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
        title="Return AFE"
        description="A comment is required when returning an AFE to SPX."
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
            <Button variant="destructive" disabled={!comment.trim() || returnAfe.isPending} onClick={handleReturn}>
              Return AFE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
