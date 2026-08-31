"use client";

import { useEffect, useState } from "react";
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
  REGISTRATION_LIFECYCLE_LABELS,
  REGISTRATION_ACTIVATION_STORAGE_KEY,
  activationNote,
  fullActivationUrl,
  registrationStatusLabel,
  type RegistrationActivationStatus,
  type RegistrationRequest,
} from "@/lib/api/registration";
import {
  useRegistrationRequests,
  useApproveRegistration,
  useCancelRegistration,
  useResendRegistrationActivation,
} from "@/hooks/use-registration";
import { ClipboardList, Copy, Mail, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

const ACTIVATION_STORAGE_KEY = REGISTRATION_ACTIVATION_STORAGE_KEY;

const LIFECYCLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: REGISTRATION_LIFECYCLE_LABELS.all },
  { value: "pending_activation", label: REGISTRATION_LIFECYCLE_LABELS.pending_activation },
  { value: "active", label: REGISTRATION_LIFECYCLE_LABELS.active },
  { value: "cancelled", label: REGISTRATION_LIFECYCLE_LABELS.cancelled },
  { value: "draft", label: REGISTRATION_LIFECYCLE_LABELS.draft },
];

function orgTypeLabel(orgType: string) {
  if (orgType === "silva") return "Asset owner";
  if (orgType === "vendor") return "Vendor";
  return orgType;
}

type ActivationState = {
  url: string;
  emailNote: string;
};

function statusBadgeVariant(status: RegistrationActivationStatus) {
  switch (status) {
    case "active":
      return "default" as const;
    case "pending_activation":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default function RegistrationsPage() {
  const [lifecycle, setLifecycle] = useState("");
  const [selected, setSelected] = useState<RegistrationRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [activation, setActivation] = useState<ActivationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useRegistrationRequests(lifecycle ? { lifecycle } : undefined);
  const approve = useApproveRegistration();
  const cancel = useCancelRegistration();
  const resendActivation = useResendRegistrationActivation();

  const items = data?.items ?? [];

  useEffect(() => {
    const raw = sessionStorage.getItem(ACTIVATION_STORAGE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(ACTIVATION_STORAGE_KEY);
    try {
      const parsed = JSON.parse(raw) as ActivationState;
      if (parsed.url) setActivation(parsed);
    } catch {
      // ignore invalid storage
    }
  }, []);

  const openDetail = (row: RegistrationRequest) => {
    setSelected(row);
    setNotes(row.reviewNotes || "");
    setError(null);
    setCopied(false);
  };

  const applyActivationResult = (result: {
    activationUrl?: string;
    activationPath: string;
    emailDelivery?: { sent: boolean; provider: string; error?: string };
  }) => {
    setActivation({
      url: result.activationUrl || fullActivationUrl(result.activationPath),
      emailNote: activationNote(result.emailDelivery),
    });
  };

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Registrations</h2>
        <Button asChild>
          <Link href="/settings/registrations/new">
            <Plus className="mr-2 h-4 w-4" />
            New registration
          </Link>
        </Button>
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {activation ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-900">Activation invitation</p>
                <p className="mt-1 text-xs text-emerald-800">{activation.emailNote}</p>
                <p className="mt-2 break-all font-mono text-xs text-emerald-900">{activation.url}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => copyLink(activation.url)}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={activation.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {LIFECYCLE_FILTERS.map((filter) => (
          <Button
            key={filter.value || "all"}
            variant={lifecycle === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setLifecycle(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Organizations
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
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No registrations.
                  </TableCell>
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
                      <Badge variant={statusBadgeVariant(row.activationStatus)}>
                        {registrationStatusLabel(row)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetail(row)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected ? (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.orgName}
          description={orgTypeLabel(selected.orgType)}
        >
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

          {selected.activationStatus === "draft" ? (
            <>
              <Textarea label="Notes" className="mt-4" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  disabled={approve.isPending}
                  onClick={() => {
                    setError(null);
                    approve.mutate(
                      { id: selected.id, notes },
                      {
                        onSuccess: (result) => {
                          setSelected(result.request);
                          applyActivationResult(result);
                        },
                        onError: (err) => setError(getApiErrorMessage(err, "Could not send invitation.")),
                      },
                    );
                  }}
                >
                  {approve.isPending ? "Provisioning…" : "Send invitation"}
                </Button>
                <Button
                  variant="destructive"
                  disabled={cancel.isPending || !notes.trim()}
                  onClick={() => {
                    setError(null);
                    cancel.mutate(
                      { id: selected.id, notes },
                      {
                        onSuccess: () => setSelected(null),
                        onError: (err) => setError(getApiErrorMessage(err, "Could not cancel registration.")),
                      },
                    );
                  }}
                >
                  Cancel registration
                </Button>
              </div>
            </>
          ) : null}

          {selected.activationStatus === "pending_activation" ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Workspace provisioned
                {selected.provisionedOrg ? ` for ${selected.provisionedOrg.name}` : ""}. Waiting for the contact to
                activate their account.
              </p>
              <Button
                variant="outline"
                disabled={resendActivation.isPending}
                onClick={() => {
                  setError(null);
                  resendActivation.mutate(selected.id, {
                    onSuccess: (result) => {
                      setSelected(result.request);
                      applyActivationResult(result);
                    },
                    onError: (err) => setError(getApiErrorMessage(err, "Could not send invitation.")),
                  });
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                {resendActivation.isPending ? "Sending…" : "Resend invitation"}
              </Button>
            </div>
          ) : null}

          {selected.activationStatus === "active" ? (
            <p className="mt-4 text-sm text-muted-foreground">This contact has activated their account.</p>
          ) : null}

          {selected.activationStatus === "cancelled" ? (
            <p className="mt-4 text-sm text-muted-foreground">This registration was cancelled.</p>
          ) : null}
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
