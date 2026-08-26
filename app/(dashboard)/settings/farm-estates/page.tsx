"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { vendorApi } from "@/lib/api/vendors";
import { programApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import {
  useFarmEstates,
  useCreateFarmEstate,
  useUpdateFarmEstate,
  useSetFarmEstateVendors,
  useAddFarmEstateBlock,
  useRemoveFarmEstateBlock,
} from "@/hooks/use-farm-estates";
import type { FarmEstate } from "@/lib/api/farm-estates";
import { MapPin, Plus, Trash2 } from "lucide-react";

type VendorRow = { id: string; name: string; status: string };
type AssetOwnerRow = { organizationId: string; organizationName: string };

export default function FarmEstatesPage() {
  const { activeProgram } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editEstate, setEditEstate] = useState<FarmEstate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: estates = [], isLoading } = useFarmEstates();
  const vendorsQuery = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorApi.findAll() as Promise<VendorRow[]>,
  });
  const assetOwnersQuery = useQuery({
    queryKey: ["program-asset-owners", activeProgram?.id],
    queryFn: async () => {
      const members = (await programApi.listMembers(activeProgram!.id)) as Array<{
        organizationId: string;
        organizationName: string;
        organizationType: string;
      }>;
      return members
        .filter((m) => m.organizationType === "silva")
        .map((m) => ({ organizationId: m.organizationId, organizationName: m.organizationName }));
    },
    enabled: Boolean(activeProgram?.id),
  });
  const vendors = vendorsQuery.data ?? [];
  const assetOwners = assetOwnersQuery.data ?? [];

  const createEstate = useCreateFarmEstate();
  const updateEstate = useUpdateFarmEstate();
  const setVendors = useSetFarmEstateVendors();
  const addBlock = useAddFarmEstateBlock();
  const removeBlock = useRemoveFarmEstateBlock();

  return (
    <div className="space-y-6 max-w-5xl">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Farm estates</h2>
          <p className="text-sm text-muted-foreground">
            Create farm areas, assign an asset owner and execution vendors. Asset owners and vendors only see
            estates mapped to them.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New estate
        </Button>
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Program estates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estate</TableHead>
                <TableHead>Asset owner</TableHead>
                <TableHead>Area (ha)</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading estates…
                  </TableCell>
                </TableRow>
              ) : estates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No farm estates yet. Create one and assign an asset owner and vendors.
                  </TableCell>
                </TableRow>
              ) : (
                estates.map((estate) => (
                  <TableRow key={estate.id}>
                    <TableCell>
                      <p className="font-medium">{estate.name}</p>
                      {estate.location ? (
                        <p className="text-xs text-muted-foreground">{estate.location}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm">
                      {estate.ownerOrganization?.name || "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {estate.totalAreaHa != null ? estate.totalAreaHa.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{estate.blocks.length}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm">
                      {estate.vendors.length
                        ? estate.vendors.map((v) => v.name).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={estate.status === "active" ? "default" : "outline"}>
                        {estate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditEstate(estate)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateEstateModal
        open={createOpen}
        vendors={vendors}
        assetOwners={assetOwners}
        isPending={createEstate.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={(dto) => {
          setError(null);
          createEstate.mutate(dto, {
            onSuccess: () => setCreateOpen(false),
            onError: (err) => setError(getApiErrorMessage(err, "Could not create estate.")),
          });
        }}
      />

      {editEstate ? (
        <EditEstateModal
          estate={editEstate}
          vendors={vendors}
          assetOwners={assetOwners}
          isPending={updateEstate.isPending || setVendors.isPending || addBlock.isPending || removeBlock.isPending}
          onClose={() => setEditEstate(null)}
          onUpdate={(dto) => {
            setError(null);
            updateEstate.mutate(
              { id: editEstate.id, ...dto },
              {
                onSuccess: (row) => setEditEstate(row),
                onError: (err) => setError(getApiErrorMessage(err, "Could not update estate.")),
              },
            );
          }}
          onSetVendors={(vendorIds) => {
            setError(null);
            setVendors.mutate(
              { id: editEstate.id, vendorIds },
              {
                onSuccess: (row) => setEditEstate(row),
                onError: (err) => setError(getApiErrorMessage(err, "Could not update vendor mapping.")),
              },
            );
          }}
          onAddBlock={(dto) => {
            setError(null);
            addBlock.mutate(
              { estateId: editEstate.id, ...dto },
              {
                onSuccess: (block) => {
                  setEditEstate((prev) =>
                    prev
                      ? {
                          ...prev,
                          blocks: [...prev.blocks, block].sort((a, b) => a.code.localeCompare(b.code)),
                        }
                      : prev,
                  );
                },
                onError: (err) => setError(getApiErrorMessage(err, "Could not add block.")),
              },
            );
          }}
          onRemoveBlock={(blockId) => {
            setError(null);
            removeBlock.mutate(
              { estateId: editEstate.id, blockId },
              {
                onSuccess: () => {
                  setEditEstate((prev) =>
                    prev
                      ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) }
                      : prev,
                  );
                },
                onError: (err) => setError(getApiErrorMessage(err, "Could not remove block.")),
              },
            );
          }}
        />
      ) : null}
    </div>
  );
}

function CreateEstateModal({
  open,
  vendors,
  assetOwners,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  vendors: VendorRow[];
  assetOwners: AssetOwnerRow[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (dto: {
    name: string;
    ownerOrganizationId?: string;
    totalAreaHa?: number;
    location?: string;
    notes?: string;
    vendorIds?: string[];
    blocks?: Array<{ code: string; label?: string }>;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [ownerOrganizationId, setOwnerOrganizationId] = useState("");
  const [location, setLocation] = useState("");
  const [totalAreaHa, setTotalAreaHa] = useState("");
  const [notes, setNotes] = useState("");
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [blockInput, setBlockInput] = useState("");

  const blocks = useMemo(
    () =>
      blockInput
        .split(/[,\s]+/)
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
        .map((code) => ({ code, label: `Block ${code}` })),
    [blockInput],
  );

  const reset = () => {
    setName("");
    setOwnerOrganizationId("");
    setLocation("");
    setTotalAreaHa("");
    setNotes("");
    setVendorIds([]);
    setBlockInput("");
  };

  const toggleVendor = (id: string) => {
    setVendorIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New farm estate"
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !ownerOrganizationId) return;
          onSubmit({
            name: name.trim(),
            ownerOrganizationId,
            location: location.trim() || undefined,
            notes: notes.trim() || undefined,
            totalAreaHa: totalAreaHa ? Number(totalAreaHa) : undefined,
            vendorIds,
            blocks: blocks.length ? blocks : undefined,
          });
          reset();
        }}
      >
        <Input id="estateName" label="Estate name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select
          id="estateOwner"
          label="Asset owner"
          value={ownerOrganizationId}
          onChange={(e) => setOwnerOrganizationId(e.target.value)}
          required
        >
          <option value="">Select asset owner…</option>
          {assetOwners.map((owner) => (
            <option key={owner.organizationId} value={owner.organizationId}>
              {owner.organizationName}
            </option>
          ))}
        </Select>
        {assetOwners.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No asset-owner org is in this program yet. Approve an asset owner registration and add them to the
            program first.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="estateLocation"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kaffa Zone"
          />
          <Input
            id="estateArea"
            label="Total area (ha)"
            type="number"
            step="0.01"
            min="0"
            value={totalAreaHa}
            onChange={(e) => setTotalAreaHa(e.target.value)}
          />
        </div>
        <Input
          id="estateBlocks"
          label="Block codes (comma-separated)"
          value={blockInput}
          onChange={(e) => setBlockInput(e.target.value)}
          placeholder="A, B, C, D, E"
        />
        <div>
          <p className="mb-2 text-sm font-medium">Execution vendors</p>
          <div className="flex flex-wrap gap-2">
            {vendors.map((v) => (
              <label key={v.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={vendorIds.includes(v.id)}
                  onChange={() => toggleVendor(v.id)}
                />
                {v.name}
              </label>
            ))}
          </div>
          {vendors.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              No vendors in the register yet. Add one under Directory → Vendors, or approve a vendor registration
              first.
            </p>
          ) : null}
        </div>
        <Input id="estateNotes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !name.trim() || !ownerOrganizationId}>
            {isPending ? "Creating…" : "Create estate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditEstateModal({
  estate,
  vendors,
  assetOwners,
  isPending,
  onClose,
  onUpdate,
  onSetVendors,
  onAddBlock,
  onRemoveBlock,
}: {
  estate: FarmEstate;
  vendors: VendorRow[];
  assetOwners: AssetOwnerRow[];
  isPending: boolean;
  onClose: () => void;
  onUpdate: (dto: {
    name?: string;
    ownerOrganizationId?: string | null;
    totalAreaHa?: number | null;
    location?: string | null;
    notes?: string | null;
    status?: "active" | "inactive";
  }) => void;
  onSetVendors: (vendorIds: string[]) => void;
  onAddBlock: (dto: { code: string; label?: string }) => void;
  onRemoveBlock: (blockId: string) => void;
}) {
  const [name, setName] = useState(estate.name);
  const [ownerOrganizationId, setOwnerOrganizationId] = useState(estate.ownerOrganizationId || "");
  const [location, setLocation] = useState(estate.location || "");
  const [totalAreaHa, setTotalAreaHa] = useState(
    estate.totalAreaHa != null ? String(estate.totalAreaHa) : "",
  );
  const [notes, setNotes] = useState(estate.notes || "");
  const [status, setStatus] = useState(estate.status);
  const [vendorIds, setVendorIds] = useState(estate.vendors.map((v) => v.id));
  const [newBlockCode, setNewBlockCode] = useState("");

  const toggleVendor = (id: string) => {
    setVendorIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={estate.name}
      description="Update asset owner, vendor mapping, and blocks."
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate({
            name: name.trim(),
            ownerOrganizationId: ownerOrganizationId || null,
            location: location.trim() || null,
            notes: notes.trim() || null,
            status,
            totalAreaHa: totalAreaHa ? Number(totalAreaHa) : null,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="editName" label="Estate name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            id="editOwner"
            label="Asset owner"
            value={ownerOrganizationId}
            onChange={(e) => setOwnerOrganizationId(e.target.value)}
            required
          >
            <option value="">Select asset owner…</option>
            {assetOwners.map((owner) => (
              <option key={owner.organizationId} value={owner.organizationId}>
                {owner.organizationName}
              </option>
            ))}
          </Select>
          <Select id="editStatus" label="Status" value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Input id="editLocation" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input
            id="editArea"
            label="Total area (ha)"
            type="number"
            step="0.01"
            min="0"
            value={totalAreaHa}
            onChange={(e) => setTotalAreaHa(e.target.value)}
          />
        </div>
        <Input id="editNotes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save details"}
        </Button>
      </form>

      <section className="mt-6 space-y-3 border-t pt-6">
        <h3 className="text-sm font-semibold">Execution vendors</h3>
        <div className="flex flex-wrap gap-2">
          {vendors.map((v) => (
            <label key={v.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={vendorIds.includes(v.id)}
                onChange={() => toggleVendor(v.id)}
              />
              {v.name}
            </label>
          ))}
        </div>
        {vendors.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No vendors in the register yet. Add one under Directory → Vendors first.
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onSetVendors(vendorIds)}
        >
          Save vendor mapping
        </Button>
      </section>

      <section className="mt-6 space-y-3 border-t pt-6">
        <h3 className="text-sm font-semibold">Blocks</h3>
        <ul className="space-y-2 text-sm">
          {estate.blocks.length === 0 ? (
            <li className="text-muted-foreground">No blocks defined.</li>
          ) : (
            estate.blocks.map((block) => (
              <li key={block.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span>
                  <span className="font-medium">{block.code}</span>
                  {block.label !== `Block ${block.code}` ? ` · ${block.label}` : null}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => onRemoveBlock(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
        <div className="flex gap-2">
          <Input
            id="newBlock"
            label="Add block code"
            value={newBlockCode}
            onChange={(e) => setNewBlockCode(e.target.value.toUpperCase())}
            placeholder="K"
            className="flex-1"
          />
          <Button
            type="button"
            className="mt-6"
            variant="outline"
            disabled={isPending || !newBlockCode.trim()}
            onClick={() => {
              onAddBlock({ code: newBlockCode.trim() });
              setNewBlockCode("");
            }}
          >
            Add
          </Button>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
