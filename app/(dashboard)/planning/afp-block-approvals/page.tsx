"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useAfpBlockLines, useApproveAfpBlockLine, useReturnAfpBlockLine } from "@/hooks/use-afp-blocks";
import { useRole } from "@/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

export default function AfpBlockApprovalsPage() {
  const { isSilva } = useRole();
  const { data: lines = [], isLoading } = useAfpBlockLines({ status: "submitted" });
  const approve = useApproveAfpBlockLine();
  const returnLine = useReturnAfpBlockLine();
  const [returnTarget, setReturnTarget] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (!isSilva) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Silva approvers only — submitted block AFP lines appear here for line-level approval.
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
        <h1 className="text-2xl font-bold tracking-tight">Block AFP approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve or return individual block plan lines submitted by SPX.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Block</th>
                <th className="px-3 py-2 font-medium">Activity</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium">Election</th>
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
                    <td className="px-3 py-2 font-mono text-xs">{line.block?.code ?? line.blockId}</td>
                    <td className="px-3 py-2">{line.activity?.name}</td>
                    <td className="px-3 py-2 text-right">{line.plannedQty}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="capitalize">
                        {line.electionStatus}
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
        title="Return block line"
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
