"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useRegistrationRequests,
  useApproveRegistration,
  useRejectRegistration,
  useMarkRegistrationReview,
} from "@/hooks/use-registration";
import type { RegistrationRequest } from "@/lib/api/registration";
import { ClipboardList, Copy } from "lucide-react";

function orgTypeLabel(orgType: string) {
  if (orgType === "silva") return "Asset owner";
  if (orgType === "vendor") return "Vendor";
  return orgType;
}

export default function RegistrationsPage() {
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<RegistrationRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useRegistrationRequests(status ? { status } : undefined);
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const markReview = useMarkRegistrationReview();

  const items = data?.items ?? [];

  const openDetail = (row: RegistrationRequest) => {
    setSelected(row);
    setNotes(row.reviewNotes || "");
    setActivationLink(null);
    setError(null);
  };

  const copyLink = (path: string) => {
    const url = `${window.location.origin}${path}`;
    void navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Registration review</h2>
        <p className="text-sm text-muted-foreground">
          Review asset owner and vendor applications. Approve to provision a workspace and generate an activation link.
        </p>
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      {activationLink ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div>
              <p className="text-sm font-medium text-emerald-900">Activation link ready</p>
              <p className="mt-1 font-mono text-xs text-emerald-800">{activationLink}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => copyLink(activationLink)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["", "submitted", "under_review", "approved", "rejected"].map((s) => (
          <Button key={s || "all"} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)}>
            {s ? s.replace(/_/g, " ") : "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No applications.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.orgName}</p>
                      <p className="text-xs text-muted-foreground">{row.orgSlug}</p>
                    </TableCell>
                    <TableCell>{orgTypeLabel(row.orgType)}</TableCell>
                    <TableCell>
                      <p>{row.contactName}</p>
                      <p className="text-xs text-muted-foreground">{row.contactEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{row.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetail(row)}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected ? (
        <Modal open onClose={() => setSelected(null)} title={selected.orgName} description={`${orgTypeLabel(selected.orgType)} application`}>
          <dl className="space-y-2 text-sm">
            <Row label="Legal name" value={selected.legalName} />
            <Row label="Country / region" value={[selected.country, selected.region].filter(Boolean).join(" · ")} />
            <Row label="Contact" value={`${selected.contactName} · ${selected.contactEmail}`} />
            <Row label="Phone" value={selected.contactPhone} />
            {selected.orgType === "silva" ? (
              <>
                <Row label="Asset interests" value={selected.assetInterests} />
                <Row label="Hectares" value={selected.estimatedHectares?.toString()} />
                <Row label="Governance notes" value={selected.governanceNotes} />
              </>
            ) : (
              <>
                <Row label="Category" value={selected.vendorCategory} />
                <Row label="Services" value={selected.servicesProvided} />
                <Row label="Field capacity" value={selected.fieldCapacity} />
                <Row label="Insurance on file" value={selected.insuranceOnFile ? "Yes" : "No"} />
              </>
            )}
          </dl>

          <Textarea label="Review notes" className="mt-4" value={notes} onChange={(e) => setNotes(e.target.value)} />

          {["submitted", "under_review"].includes(selected.status) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={markReview.isPending}
                onClick={() => {
                  setError(null);
                  markReview.mutate(
                    { id: selected.id, notes },
                    { onSuccess: (row) => setSelected(row), onError: (err) => setError(getApiErrorMessage(err)) },
                  );
                }}
              >
                Mark under review
              </Button>
              <Button
                disabled={approve.isPending}
                onClick={() => {
                  setError(null);
                  approve.mutate(
                    { id: selected.id, notes },
                    {
                      onSuccess: (result) => {
                        setSelected(result.request);
                        setActivationLink(result.activationPath);
                      },
                      onError: (err) => setError(getApiErrorMessage(err, "Approval failed.")),
                    },
                  );
                }}
              >
                {approve.isPending ? "Provisioning…" : "Approve & provision"}
              </Button>
              <Button
                variant="destructive"
                disabled={reject.isPending || !notes.trim()}
                onClick={() => {
                  setError(null);
                  reject.mutate(
                    { id: selected.id, notes },
                    {
                      onSuccess: () => setSelected(null),
                      onError: (err) => setError(getApiErrorMessage(err, "Rejection failed.")),
                    },
                  );
                }}
              >
                Reject
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground capitalize">Status: {selected.status.replace(/_/g, " ")}</p>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
