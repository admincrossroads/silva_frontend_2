"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useAddWorkOrderAssignment,
  usePatchWorkOrderAssignment,
  useWorkOrderAssignments,
} from "@/hooks/use-work-orders";
import { usePermissions } from "@/hooks/use-permissions";
import { vendorApi } from "@/lib/api/vendors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { Users } from "lucide-react";

type VendorUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
};

type Props = {
  workOrderId: string;
  assignedVendorId: string | null;
  closed: boolean;
};

export function WorkOrderCrewPanel({ workOrderId, assignedVendorId, closed }: Props) {
  const { has } = usePermissions();
  const canAssign = has("work_orders.assign") && !closed;
  const { data: assignments = [], isLoading } = useWorkOrderAssignments(workOrderId);
  const addAssignment = useAddWorkOrderAssignment(workOrderId);
  const patchAssignment = usePatchWorkOrderAssignment(workOrderId);

  const [leadId, setLeadId] = useState("");
  const [asPrimary, setAsPrimary] = useState(true);

  const usersQuery = useQuery({
    queryKey: ["vendor-users", assignedVendorId, "leads"],
    queryFn: () => vendorApi.listUsers(assignedVendorId as string),
    enabled: canAssign && !!assignedVendorId,
  });

  const leads = useMemo(() => {
    const rows = (usersQuery.data ?? []) as VendorUser[];
    return rows.filter((u) => u.role === "vendor_field_lead" && u.active !== false);
  }, [usersQuery.data]);

  const assignedUserIds = useMemo(() => new Set(assignments.map((a) => a.userId)), [assignments]);
  const availableLeads = leads.filter((l) => !assignedUserIds.has(l.id));

  const onAssign = async () => {
    if (!leadId) return;
    await addAssignment.mutateAsync({
      userId: leadId,
      roleOnOrder: "vendor_field_lead",
      isPrimary: asPrimary || assignments.length === 0,
    });
    setLeadId("");
    setAsPrimary(true);
  };

  return (
    <Card className="p-5">
      <h3 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Field leads
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Assign B-Agro field leads who will execute and ticket this work order.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No field leads assigned yet.</p>
      ) : (
        <ul className="mb-4 divide-y rounded-md border">
          {assignments.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.userName || row.userId}</p>
                <p className="truncate text-xs text-muted-foreground">{row.userEmail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {row.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
                {canAssign && !row.isPrimary ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={patchAssignment.isPending}
                    onClick={() =>
                      patchAssignment.mutate({ assignmentId: row.id, isPrimary: true })
                    }
                  >
                    Make primary
                  </Button>
                ) : null}
                {canAssign ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={patchAssignment.isPending}
                    onClick={() => patchAssignment.mutate({ assignmentId: row.id, active: false })}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAssign ? (
        <div className="space-y-3 border-t pt-4">
          {!assignedVendorId ? (
            <p className="text-sm text-muted-foreground">This work order has no vendor yet.</p>
          ) : (
            <>
              <Select
                id="assign-lead"
                label="Assign field lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                disabled={usersQuery.isLoading || addAssignment.isPending}
              >
                <option value="">
                  {usersQuery.isLoading ? "Loading leads…" : "Select a field lead…"}
                </option>
                {availableLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.email})
                  </option>
                ))}
              </Select>
              {availableLeads.length === 0 && !usersQuery.isLoading ? (
                <p className="text-xs text-muted-foreground">
                  All field leads are already assigned, or none exist for this vendor.
                </p>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  checked={asPrimary}
                  onChange={(e) => setAsPrimary(e.target.checked)}
                />
                Set as primary lead
              </label>
              <Button
                className="w-full"
                disabled={!leadId || addAssignment.isPending}
                onClick={onAssign}
              >
                {addAssignment.isPending ? "Assigning…" : "Assign lead"}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}
