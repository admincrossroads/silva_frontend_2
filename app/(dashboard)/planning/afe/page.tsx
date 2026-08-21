"use client";

import { useState } from "react";
import { useAfes } from "@/hooks/use-afes";
import { afeColumns } from "@/components/data-table/columns/afe-columns";
import { DataTable } from "@/components/data-table/data-table";
import { Modal } from "@/components/ui/modal";
import { AfeForm } from "@/components/forms/afe/afe-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const STATUSES = ["draft", "submitted", "validated", "approved", "rejected", "closed"];
const BANDS = ["A", "B", "C", "D"];

export default function AfePage() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const [band, setBand] = useState<string | undefined>();

  const { data: afes = [], isLoading } = useAfes({ status, band });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AFE Register</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create AFE
        </Button>
      </div>

      <div className="flex items-center gap-4">
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

        <Select
          value={band ?? "all"}
          onValueChange={(v) => setBand(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Band" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bands</SelectItem>
            {BANDS.map((b) => (
              <SelectItem key={b} value={b}>
                Band {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={afeColumns} data={afes} searchKey="description" />

      <Modal
        title="Create AFE"
        description="Add a new Authorization for Expenditure."
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <AfeForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
