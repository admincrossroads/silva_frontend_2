"use client";

import { useState } from "react";
import { useAfps } from "@/hooks/use-afps";
import { usePermissions } from "@/hooks/use-permissions";
import { afpColumns } from "@/components/data-table/columns/afp-columns";
import { DataTable } from "@/components/data-table/data-table";
import { Modal } from "@/components/ui/modal";
import { AfpForm } from "@/components/forms/afp/afp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const STATUSES = ["draft", "submitted", "approved", "closed"];

export default function AfpPage() {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const { has } = usePermissions();
  const canCreate = has("afp.create");

  const { data: afps = [] } = useAfps({ year, status });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AFP Register</h1>
        {canCreate && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create AFP
          </Button>
        )}
      </div>

      {!canCreate && (
        <p className="text-sm text-muted-foreground">
          Creating AFP lines requires an SPX Principal or Account Handler account (e.g.{" "}
          <span className="font-mono text-xs">principal@spx.example</span>).
        </p>
      )}

      <div className="flex items-center gap-4">
        <Input
          type="number"
          placeholder="Filter by year"
          className="w-32"
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
        />
        <Select
          value={status ?? "all"}
          onValueChange={(v) => setStatus(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={afpColumns} data={afps} searchKey="activity" />

      {canCreate && (
        <Modal
          title="Create AFP"
          description="Add a new Annual Field Plan line item."
          isOpen={open}
          onClose={() => setOpen(false)}
        >
          <AfpForm onSuccess={() => setOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
