"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRole } from "@/hooks/use-role";
import { useAfps } from "@/hooks/use-afps";
import { useFarmEstates } from "@/hooks/use-farm-estates";
import {
  useAdHocRequests,
  useConvertAdHocRequest,
  useCreateAdHocRequest,
  useDismissAdHocRequest,
} from "@/hooks/use-ad-hoc-requests";
import type { AdHocRequest } from "@/lib/api/ad-hoc-requests";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { formatCurrency } from "@/lib/utils/format";
import { getApiErrorMessage } from "@/lib/api/errors";

const DISCIPLINES = [
  "Agronomy",
  "Processing",
  "Infrastructure",
  "Environment",
  "Social",
  "General Admin",
];

const URGENCIES = ["low", "normal", "high", "emergency"] as const;
const STATUSES = ["submitted", "converted", "dismissed"] as const;

const createSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  operatingDiscipline: z.string().min(1, "Required"),
  urgency: z.enum(URGENCIES),
  estimatedCostUsd: z.string().optional(),
  farmEstateId: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

const convertSchema = z.object({
  afpLineId: z.string().optional(),
  operatingDiscipline: z.string().min(1),
  description: z.string().min(1),
  estimatedCostUsd: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number({ required_error: "Enter a cost greater than 0" }).positive("Enter a cost greater than 0"),
  ),
  notes: z.string().optional(),
});

type ConvertValues = z.infer<typeof convertSchema>;

function statusBadge(status: string) {
  if (status === "submitted") return <Badge>Submitted</Badge>;
  if (status === "converted") return <Badge variant="secondary">Converted</Badge>;
  if (status === "dismissed") return <Badge variant="destructive">Dismissed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function urgencyLabel(u: string) {
  return u.charAt(0).toUpperCase() + u.slice(1);
}

export default function AdHocIntakePage() {
  const router = useRouter();
  const { isSilva, isSpx, isVendor, role } = useRole();
  const canRequest =
    isSilva ||
    role === "vendor_admin" ||
    role === "vendor_manager" ||
    role === "vendor_supervisor" ||
    role === "vendor_field_lead";
  const [status, setStatus] = useState<string | undefined>(isSpx ? "submitted" : undefined);
  const [originFilter, setOriginFilter] = useState<string | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<AdHocRequest | null>(null);
  const [dismissTarget, setDismissTarget] = useState<AdHocRequest | null>(null);
  const [dismissNotes, setDismissNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useAdHocRequests({
    status,
    ...(isSpx && originFilter ? { origin: originFilter } : {}),
  });
  const { data: afps = [] } = useAfps();
  const { data: estates = [] } = useFarmEstates({ status: "active" });
  const createRequest = useCreateAdHocRequest();
  const dismissRequest = useDismissAdHocRequest();
  const convertRequest = useConvertAdHocRequest();

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      operatingDiscipline: "Agronomy",
      urgency: "normal",
      estimatedCostUsd: "",
      farmEstateId: "",
    },
  });

  const convertForm = useForm<ConvertValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      afpLineId: "",
      operatingDiscipline: "Agronomy",
      description: "",
      estimatedCostUsd: 0,
      notes: "",
    },
  });

  const openConvert = (row: AdHocRequest) => {
    setConvertTarget(row);
    convertForm.reset({
      afpLineId: "",
      operatingDiscipline: row.operatingDiscipline || "Agronomy",
      description: row.title,
      estimatedCostUsd: "" as unknown as number,
      notes: "",
    });
  };

  async function onCreate(values: CreateValues) {
    setFormError(null);
    try {
      await createRequest.mutateAsync({
        title: values.title,
        description: values.description || null,
        operatingDiscipline: values.operatingDiscipline,
        urgency: values.urgency,
        estimatedCostUsd:
          values.estimatedCostUsd && Number(values.estimatedCostUsd) > 0
            ? Number(values.estimatedCostUsd)
            : null,
        farmEstateId: values.farmEstateId || null,
        submit: true,
      });
      setCreateOpen(false);
      createForm.reset();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create request"));
    }
  }

  async function onConvert(values: ConvertValues) {
    if (!convertTarget) return;
    setFormError(null);
    try {
      const result = await convertRequest.mutateAsync({
        id: convertTarget.id,
        dto: {
          operatingDiscipline: values.operatingDiscipline,
          description: values.description,
          estimatedCostUsd: Number(values.estimatedCostUsd),
          notes: values.notes || undefined,
          afpLineId: values.afpLineId && values.afpLineId !== "none" ? values.afpLineId : null,
        },
      });
      setConvertTarget(null);
      router.push(`/planning/afe/${result.afe.id}`);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not convert request"));
    }
  }

  async function onDismiss() {
    if (!dismissTarget || !dismissNotes.trim()) return;
    setFormError(null);
    try {
      await dismissRequest.mutateAsync({ id: dismissTarget.id, notes: dismissNotes.trim() });
      setDismissTarget(null);
      setDismissNotes("");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not dismiss request"));
    }
  }

  const subtitle = useMemo(() => {
    if (isSilva) {
      return "Request work outside the annual plan. SPX will triage and convert to an AFE.";
    }
    if (isVendor) {
      return "Request unexpected field work for SPX to triage and convert to an AFE.";
    }
    return "Triage Silva and vendor requests that were not in the annual work plan / AFP.";
  }, [isSilva, isVendor]);

  return (
    <PageShell>
      <PageHeader
        title="Ad-hoc intake"
        description={subtitle}
        actions={
          canRequest ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Request ad-hoc work
            </Button>
          ) : null
        }
      />
      <PageFilters>
        <Select value={status ?? "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSpx ? (
          <Select
            value={originFilter ?? "all"}
            onValueChange={(v) => setOriginFilter(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="silva_request">Silva</SelectItem>
              <SelectItem value="vendor_request">Vendor</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </PageFilters>
      <PageContent>
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-8 text-sm text-muted-foreground">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-sm text-muted-foreground">
            {canRequest
              ? "No ad-hoc requests yet. Use “Request ad-hoc work” for unexpected needs."
              : "No ad-hoc requests in this filter."}
          </div>
        ) : (
          <ul className="divide-y">
            {requests.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{row.title}</p>
                    {statusBadge(row.status)}
                    <Badge variant="outline">{urgencyLabel(row.urgency)}</Badge>
                    {isSpx && row.origin === "vendor_request" ? (
                      <Badge variant="secondary">{row.vendor?.name || "Vendor"}</Badge>
                    ) : null}
                    {isSpx && row.origin === "silva_request" ? (
                      <Badge variant="outline">Silva</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {row.operatingDiscipline}
                    {row.farmEstate?.name ? ` · ${row.farmEstate.name}` : ""}
                    {row.estimatedCostUsd != null ? ` · ${formatCurrency(row.estimatedCostUsd)}` : ""}
                  </p>
                  {row.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">{row.description}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {row.requestedBy?.name || "Requester"}
                    {row.submittedAt ? ` · submitted ${new Date(row.submittedAt).toLocaleDateString()}` : ""}
                    {row.convertedAfeId ? (
                      <>
                        {" · "}
                        <Link className="underline" href={`/planning/afe/${row.convertedAfeId}`}>
                          {row.convertedAfeId}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  {row.reviewNotes && row.status === "dismissed" ? (
                    <p className="text-xs text-destructive">Dismissed: {row.reviewNotes}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <StartMessageButton entityType="ad_hoc_request" entityId={row.id} label={row.title} />
                  {isSpx && row.status === "submitted" ? (
                    <>
                      <Button size="sm" onClick={() => openConvert(row)}>
                        Convert to AFE
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDismissTarget(row)}>
                        Dismiss
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Request ad-hoc work">
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isVendor
                ? "For unexpected field work outside issued work orders. SPX will review and open an AFE."
                : "For work not in the annual plan. SPX will review and open an AFE through the normal path."}
            </p>
            <FormField
              control={createForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Emergency irrigation pump repair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Why this is needed and what outcome you expect" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={createForm.control}
                name="operatingDiscipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {URGENCIES.map((u) => (
                          <SelectItem key={u} value={u}>
                            {urgencyLabel(u)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={createForm.control}
              name="estimatedCostUsd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated cost (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="farmEstateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm estate</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {estates.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? "Submitting…" : "Submit to SPX"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      <Modal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        title="Convert to AFE"
      >
        <Form {...convertForm}>
          <form onSubmit={convertForm.handleSubmit(onConvert)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Creates an AFE marked ad-hoc. Optionally attach an AFP budget line; otherwise it stands alone outside the annual plan.
            </p>
            <FormField
              control={convertForm.control}
              name="afpLineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AFP line (optional)</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Standalone or select AFP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Standalone (no AFP)</SelectItem>
                      {afps.map((afp) => (
                        <SelectItem key={afp.id} value={afp.id}>
                          {afp.id} · {afp.activity} ({afp.operatingDiscipline})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={convertForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AFE description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={convertForm.control}
                name="operatingDiscipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={convertForm.control}
                name="estimatedCostUsd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConvertTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={convertRequest.isPending}>
                {convertRequest.isPending ? "Converting…" : "Create AFE"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      <Modal open={!!dismissTarget} onClose={() => setDismissTarget(null)} title="Dismiss request">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tell the asset owner why this will not proceed through SPX.
          </p>
          <Textarea
            rows={3}
            value={dismissNotes}
            onChange={(e) => setDismissNotes(e.target.value)}
            placeholder="Reason required"
          />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDismissTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!dismissNotes.trim() || dismissRequest.isPending}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
      </PageContent>
    </PageShell>
  );
}
