"use client";

import { useState } from "react";
import { Layers, Pencil } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Schedule3Threshold } from "@/types";
import { useSchedule3, usePatchSchedule3Band } from "@/hooks/use-schedule3";
import { useRole } from "@/hooks/use-role";
import { formatBandRange } from "@/lib/utils/compute-band";
import { BandBadge } from "@/components/badges/band-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SpendBandsPage() {
  const { isSilva, isSpxPrincipal, isSystemAdmin } = useRole();
  const canEdit = isSpxPrincipal || isSystemAdmin;
  const { data: bands = [], isLoading } = useSchedule3();
  const patch = usePatchSchedule3Band();
  const [editBand, setEditBand] = useState<Schedule3Threshold | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="space-y-6 max-w-5xl">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold">Schedule 3 spend bands</h1>
        <p className="text-sm text-muted-foreground">
          {canEdit
            ? "Configure USD thresholds and approval authorities per band. AFE band assignment uses these values automatically."
            : "Read-only view of spend bands SPX configured for this program. Higher bands require your approval before issue."}
        </p>
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" />
            Program bands
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading bands…</p>
          ) : bands.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No bands configured yet. SPX will register default bands when the program is provisioned.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Band</TableHead>
                  <TableHead>USD range</TableHead>
                  <TableHead>SPX authority</TableHead>
                  <TableHead>{isSilva ? "Your authority" : "Asset owner authority"}</TableHead>
                  <TableHead>Year</TableHead>
                  {canEdit ? <TableHead className="w-[80px]" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bands.map((band) => (
                  <TableRow key={band.band}>
                    <TableCell>
                      <BandBadge band={band.band} thresholds={bands} />
                    </TableCell>
                    <TableCell className="text-sm">{formatBandRange(band)}</TableCell>
                    <TableCell className="max-w-[220px] text-sm">{band.spxAuthority}</TableCell>
                    <TableCell className="max-w-[220px] text-sm">{band.silvaAuthority}</TableCell>
                    <TableCell className="text-sm">{band.effectiveYear}</TableCell>
                    {canEdit ? (
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setEditBand(band)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {canEdit ? (
        <p className="text-xs text-muted-foreground">
          Band letters (A–D) are fixed per program. SPX adjusts thresholds and authority text — asset owners
          approve spend against these configured bands, they do not register them.
        </p>
      ) : null}

      {editBand ? (
        <EditBandModal
          band={editBand}
          isPending={patch.isPending}
          onClose={() => {
            setEditBand(null);
            setError("");
          }}
          onSave={async (dto) => {
            setError("");
            try {
              await patch.mutateAsync({ band: editBand.band, ...dto });
              setEditBand(null);
            } catch (err) {
              setError(getApiErrorMessage(err, "Could not save band."));
            }
          }}
        />
      ) : null}
    </div>
  );
}

function EditBandModal({
  band,
  isPending,
  onClose,
  onSave,
}: {
  band: Schedule3Threshold;
  isPending: boolean;
  onClose: () => void;
  onSave: (dto: {
    minValueUsd: number;
    maxValueUsd: number | null;
    spxAuthority: string;
    silvaAuthority: string;
    effectiveYear: number;
  }) => void;
}) {
  const [minValueUsd, setMinValueUsd] = useState(String(band.minValueUsd));
  const [maxValueUsd, setMaxValueUsd] = useState(
    band.maxValueUsd == null ? "" : String(band.maxValueUsd),
  );
  const [spxAuthority, setSpxAuthority] = useState(band.spxAuthority);
  const [silvaAuthority, setSilvaAuthority] = useState(band.silvaAuthority);
  const [effectiveYear, setEffectiveYear] = useState(String(band.effectiveYear));

  return (
    <Modal open onClose={onClose} title={`Edit band ${band.band}`}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Min USD"
            type="number"
            min="0"
            step="0.01"
            value={minValueUsd}
            onChange={(e) => setMinValueUsd(e.target.value)}
          />
          <Input
            label="Max USD (empty = open ended)"
            type="number"
            min="0"
            step="0.01"
            value={maxValueUsd}
            onChange={(e) => setMaxValueUsd(e.target.value)}
          />
        </div>
        <Input
          label="Effective year"
          type="number"
          value={effectiveYear}
          onChange={(e) => setEffectiveYear(e.target.value)}
        />
        <Textarea
          label="SPX authority"
          value={spxAuthority}
          onChange={(e) => setSpxAuthority(e.target.value)}
        />
        <Textarea
          label="Asset owner authority"
          value={silvaAuthority}
          onChange={(e) => setSilvaAuthority(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() =>
              onSave({
                minValueUsd: Number(minValueUsd),
                maxValueUsd: maxValueUsd.trim() ? Number(maxValueUsd) : null,
                spxAuthority,
                silvaAuthority,
                effectiveYear: Number(effectiveYear),
              })
            }
          >
            {isPending ? "Saving…" : "Save band"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
