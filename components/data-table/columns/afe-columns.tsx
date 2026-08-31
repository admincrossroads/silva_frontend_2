"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Afe } from "@/types";
import { StatusBadge } from "@/components/badges/status-badge";
import { BandBadge } from "@/components/badges/band-badge";
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
import {
  TableChip,
  TableMoney,
  TablePrimaryCell,
  TableRowActionsTrigger,
} from "../data-table-cells";

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
        <TableRowActionsTrigger disabled={busy} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/planning/afe/${afe.id}`}>View details</Link>
        </DropdownMenuItem>
        {afe.status === "draft" ? (
          <DropdownMenuItem onClick={() => run(() => submit.mutateAsync({ id: afe.id, comment: "" }))}>
            Submit
          </DropdownMenuItem>
        ) : null}
        {afe.status === "submitted" ? (
          <DropdownMenuItem onClick={() => run(() => validate.mutateAsync({ id: afe.id, comment: "" }))}>
            Validate
          </DropdownMenuItem>
        ) : null}
        {afe.status === "validated" || afe.status === "submitted" ? (
          <DropdownMenuItem onClick={() => run(() => approve.mutateAsync({ id: afe.id, comment: "" }))}>
            Approve
          </DropdownMenuItem>
        ) : null}
        {!["rejected", "closed"].includes(afe.status) ? (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => run(() => reject.mutateAsync({ id: afe.id, reason: "Rejected from register" }))}
          >
            Reject
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const afeColumns: ColumnDef<Afe>[] = [
  {
    accessorKey: "description",
    header: "Commitment",
    cell: ({ row }) => (
      <TablePrimaryCell
        href={`/planning/afe/${row.original.id}`}
        title={row.original.description}
        subtitle={row.original.operatingDiscipline}
      />
    ),
  },
  {
    accessorKey: "estimatedCostEtb",
    header: "Est. cost",
    cell: ({ row }) => (
      <div className="w-28 whitespace-nowrap">
        <TableMoney amount={row.original.estimatedCostEtb} />
      </div>
    ),
  },
  {
    accessorKey: "band",
    header: "Band",
    cell: ({ row }) => (
      <div className="w-24">
        <BandBadge band={row.original.band} />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="w-32">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "silvaApprovalRequired",
    header: "Silva",
    cell: ({ row }) => (
      <div className="w-28">
        <TableChip>{row.original.silvaApprovalRequired ? "Required" : "SPX only"}</TableChip>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 48,
    cell: ({ row }) => <AfeRowActions afe={row.original} />,
  },
];
