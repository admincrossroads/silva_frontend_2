"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Afe } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { BandBadge } from "@/components/badges/band-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useApproveAfe,
  useRejectAfe,
  useSubmitAfe,
  useValidateAfe,
} from "@/hooks/use-afes";
import { getApiErrorMessage } from "@/lib/api/errors";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function AfeRowActions({ afe }: { afe: Afe }) {
  const submit = useSubmitAfe();
  const validate = useValidateAfe();
  const approve = useApproveAfe();
  const reject = useRejectAfe();
  const busy = submit.isPending || validate.isPending || approve.isPending || reject.isPending;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (err) {
      window.alert(getApiErrorMessage(err, "Action failed"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={busy}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/planning/afe/${afe.id}`}>View</Link>
        </DropdownMenuItem>
        {afe.status === "draft" && (
          <DropdownMenuItem onClick={() => run(() => submit.mutateAsync({ id: afe.id, comment: "" }))}>
            Submit
          </DropdownMenuItem>
        )}
        {afe.status === "submitted" && (
          <DropdownMenuItem onClick={() => run(() => validate.mutateAsync({ id: afe.id, comment: "" }))}>
            Validate
          </DropdownMenuItem>
        )}
        {(afe.status === "validated" || afe.status === "submitted") && (
          <DropdownMenuItem onClick={() => run(() => approve.mutateAsync({ id: afe.id, comment: "" }))}>
            Approve
          </DropdownMenuItem>
        )}
        {!["rejected", "closed"].includes(afe.status) && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => run(() => reject.mutateAsync({ id: afe.id, reason: "Rejected from register" }))}
          >
            Reject
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const afeColumns: ColumnDef<Afe>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Link href={`/planning/afe/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
        {row.original.id}
      </Link>
    ),
  },
  { accessorKey: "operatingDiscipline", header: "Discipline" },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "estimatedCostUsd",
    header: "Est. Cost",
    cell: ({ row }) => formatUsd(row.original.estimatedCostUsd),
  },
  {
    accessorKey: "band",
    header: "Band",
    cell: ({ row }) => <BandBadge band={row.original.band} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "silvaApprovalRequired",
    header: "Silva Required",
    cell: ({ row }) => (row.original.silvaApprovalRequired ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => <AfeRowActions afe={row.original} />,
  },
];
