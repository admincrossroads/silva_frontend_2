"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarRange, Plus, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageShell, PageHeader, PageFilters, PageContent } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
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
import { useVendorFarmEstates } from "@/hooks/use-vendor-farm-estates";
import { useActivityMaster } from "@/hooks/use-activity-master";
import { useCropfortAfeBandPreview } from "@/hooks/use-cropfort-afes";
import {
  useAdHocRequests,
  useConvertCoreOperationToCropfort,
  useCreateAdHocRequest,
  useDismissAdHocRequest,
} from "@/hooks/use-ad-hoc-requests";
import type { AdHocRequest, CoreOperationKind } from "@/lib/api/ad-hoc-requests";
import { StartMessageButton } from "@/components/messages/start-message-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { BlockActivityEstimateSection } from "@/components/operations/block-activity-estimate-section";

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

function formatEtb(value: number) {
  return new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(
    value,
  );
}

const interventionSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  operatingDiscipline: z.string().min(1, "Required"),
  urgency: z.enum(URGENCIES),
  estimatedAmountEtb: z.string().optional(),
  farmEstateId: z.string().optional(),
  blockIds: z.array(z.string()).optional().default([]),
  activityIds: z.array(z.string()).optional().default([]),
});

const projectSchema = z
  .object({
    title: z.string().min(1, "Required"),
    description: z.string().optional(),
    operatingDiscipline: z.string().min(1, "Required"),
    plannedStartDate: z.string().min(1, "Required"),
    plannedEndDate: z.string().min(1, "Required"),
    estimatedAmountEtb: z.string().min(1, "Required"),
    farmEstateId: z.string().optional(),
    blockIds: z.array(z.string()),
    activityIds: z.array(z.string()),
  })
  .refine((data) => data.plannedEndDate >= data.plannedStartDate, {
    message: "End date must be on or after start date",
    path: ["plannedEndDate"],
  });

type InterventionValues = z.infer<typeof interventionSchema>;
type ProjectValues = z.infer<typeof projectSchema>;

const convertSchema = z.object({
  title: z.string().min(1),
  amountEtb: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number({ required_error: "Enter an amount greater than 0" }).positive("Enter an amount greater than 0"),
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

function kindBadge(kind: CoreOperationKind) {
  if (kind === "project") {
    return (
      <Badge variant="outline" className="gap-1">
        <CalendarRange className="h-3 w-3" /> Project
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Zap className="h-3 w-3" /> Intervention
    </Badge>
  );
}

function urgencyLabel(u: string) {
  return u.charAt(0).toUpperCase() + u.slice(1);
}

function ToggleChip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

export type CoreOperationsViewMode = "all" | CoreOperationKind;

type CoreOperationsViewProps = {
  view?: CoreOperationsViewMode;
  /** When true, omit outer PageShell (parent provides layout). */
  embedded?: boolean;
};

export function CoreOperationsView({ view = "all", embedded = false }: CoreOperationsViewProps) {
  const router = useRouter();
  const { isSilva, isSpx, role } = useRole();
  const canRequest =
    isSilva ||
    isSpx ||
    role === "vendor_admin" ||
    role === "vendor_manager" ||
    role === "vendor_supervisor" ||
    role === "vendor_field_lead";

  const [status, setStatus] = useState<string | undefined>(isSpx ? "submitted" : undefined);
  const [originFilter, setOriginFilter] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createKind, setCreateKind] = useState<CoreOperationKind | null>(null);
  const [convertTarget, setConvertTarget] = useState<AdHocRequest | null>(null);
  const [dismissTarget, setDismissTarget] = useState<AdHocRequest | null>(null);
  const [dismissNotes, setDismissNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const filters = {
    status,
    ...(isSpx && originFilter ? { origin: originFilter } : {}),
    ...(view !== "all" ? { operationKind: view } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };

  const { data: requests = [], isLoading } = useAdHocRequests(filters);
  const { estates } = useVendorFarmEstates({ status: "active" });
  const { data: activities = [] } = useActivityMaster();
  const createRequest = useCreateAdHocRequest();
  const dismissRequest = useDismissAdHocRequest();
  const convertRequest = useConvertCoreOperationToCropfort();

  const blocks = useMemo(
    () => estates.flatMap((e) => e.blocks.map((b) => ({ ...b, estateName: e.name, estateId: e.id }))),
    [estates],
  );

  const interventionForm = useForm<InterventionValues>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      title: "",
      description: "",
      operatingDiscipline: "Agronomy",
      urgency: "normal",
      estimatedAmountEtb: "",
      farmEstateId: "",
      blockIds: [],
      activityIds: [],
    },
  });

  const projectForm = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      operatingDiscipline: "Agronomy",
      plannedStartDate: "",
      plannedEndDate: "",
      estimatedAmountEtb: "",
      farmEstateId: "",
      blockIds: [],
      activityIds: [],
    },
  });

  const convertForm = useForm<ConvertValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: { title: "", amountEtb: 0, notes: "" },
  });

  const convertAmount = convertForm.watch("amountEtb");
  const { data: bandPreview } = useCropfortAfeBandPreview(
    convertAmount && Number(convertAmount) > 0 ? Number(convertAmount) : undefined,
  );

  const openCreate = () => {
    setFormError(null);
    interventionForm.reset();
    projectForm.reset();
    if (view === "intervention") {
      setCreateKind("intervention");
      setCreateStep(2);
    } else if (view === "project") {
      setCreateKind("project");
      setCreateStep(2);
    } else {
      setCreateStep(1);
      setCreateKind(null);
    }
    setCreateOpen(true);
  };

  const openConvert = (row: AdHocRequest) => {
    setConvertTarget(row);
    convertForm.reset({
      title: row.title,
      amountEtb: (row.estimatedAmountEtb ?? "") as unknown as number,
      notes: "",
    });
  };

  async function onCreateIntervention(values: InterventionValues) {
    setFormError(null);
    try {
      await createRequest.mutateAsync({
        operationKind: "intervention",
        title: values.title,
        description: values.description || null,
        operatingDiscipline: values.operatingDiscipline,
        urgency: values.urgency,
        estimatedAmountEtb:
          values.estimatedAmountEtb && Number(values.estimatedAmountEtb) > 0
            ? Number(values.estimatedAmountEtb)
            : null,
        farmEstateId: values.farmEstateId || null,
        blockIds: values.blockIds,
        activityIds: values.activityIds,
        submit: true,
      });
      setCreateOpen(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create request"));
    }
  }

  async function onCreateProject(values: ProjectValues) {
    setFormError(null);
    try {
      await createRequest.mutateAsync({
        operationKind: "project",
        title: values.title,
        description: values.description || null,
        operatingDiscipline: values.operatingDiscipline,
        plannedStartDate: values.plannedStartDate,
        plannedEndDate: values.plannedEndDate,
        estimatedAmountEtb: Number(values.estimatedAmountEtb),
        blockIds: values.blockIds,
        activityIds: values.activityIds,
        farmEstateId: values.farmEstateId || null,
        submit: true,
      });
      setCreateOpen(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not create request"));
    }
  }

  async function onConvert(values: ConvertValues) {
    if (!convertTarget) return;
    setFormError(null);
    try {
      await convertRequest.mutateAsync({
        id: convertTarget.id,
        dto: {
          title: values.title,
          amountEtb: Number(values.amountEtb),
          notes: values.notes || undefined,
        },
      });
      setConvertTarget(null);
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

  const pageTitle =
    view === "intervention" ? "Interventions" : view === "project" ? "Projects" : "Core Operations";

  const emptyMessage =
    view === "intervention"
      ? canRequest
        ? "No interventions yet. Submit reactive work that is outside the annual plan."
        : "No interventions match this filter."
      : view === "project"
        ? canRequest
          ? "No projects yet. Submit a bounded initiative with start and end dates."
          : "No projects match this filter."
        : canRequest
          ? "No core operations yet. Start with an intervention or project request."
          : "No requests match this filter.";

  const projectBlockIds = projectForm.watch("blockIds");
  const projectActivityIds = projectForm.watch("activityIds");
  const projectFarmEstateId = projectForm.watch("farmEstateId");
  const interventionBlockIds = interventionForm.watch("blockIds");
  const interventionActivityIds = interventionForm.watch("activityIds");
  const interventionFarmEstateId = interventionForm.watch("farmEstateId");

  const content = (
    <>
      <PageHeader
        title={pageTitle}
        actions={
          canRequest ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {view === "intervention"
                ? "New intervention"
                : view === "project"
                  ? "New project"
                  : "New request"}
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
        <Input
          type="date"
          className="w-40"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
        />
        <Input
          type="date"
          className="w-40"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
        />
      </PageFilters>

      <PageContent>
        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <ul className="divide-y">
              {requests.map((row) => (
                <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{row.title}</p>
                      {view === "all" ? kindBadge(row.operationKind) : null}
                      {statusBadge(row.status)}
                      {row.operationKind === "intervention" ? (
                        <Badge variant="outline">{urgencyLabel(row.urgency)}</Badge>
                      ) : null}
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
                      {row.estimatedAmountEtb != null ? ` · ${formatEtb(row.estimatedAmountEtb)}` : ""}
                      {row.operationKind === "project" && row.plannedStartDate && row.plannedEndDate
                        ? ` · ${row.plannedStartDate} → ${row.plannedEndDate}`
                        : ""}
                    </p>
                    {row.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{row.description}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {row.requestedBy?.name || "Requester"}
                      {row.submittedAt ? ` · submitted ${new Date(row.submittedAt).toLocaleDateString()}` : ""}
                      {row.convertedCropfortAfeId ? (
                        <span className="font-mono"> · {row.convertedCropfortAfeId}</span>
                      ) : null}
                      {row.coreOperationProject?.status === "active" ? (
                        <Badge variant="secondary" className="ml-2">
                          Active project
                        </Badge>
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
                          Convert to ETB AFE
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

        <Modal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title={createStep === 1 ? "New core operation" : createKind === "project" ? "New project" : "New intervention"}
        >
          {createStep === 1 && view === "all" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose the type of work outside the annual block plan.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateKind("intervention");
                    setCreateStep(2);
                  }}
                  className="rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Intervention
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reactive, short-cycle work — urgent field needs or out-of-plan tasks.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateKind("project");
                    setCreateStep(2);
                  }}
                  className="rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarRange className="h-4 w-4 text-primary" />
                    Project
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bounded initiative with start and end dates — can span multiple weeks.
                  </p>
                </button>
              </div>
            </div>
          ) : createKind === "intervention" || view === "intervention" ? (
            <Form {...interventionForm}>
              <form onSubmit={interventionForm.handleSubmit(onCreateIntervention)} className="space-y-4">
                <FormField
                  control={interventionForm.control}
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
                  control={interventionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Why this is needed and expected outcome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={interventionForm.control}
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
                    control={interventionForm.control}
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
                  control={interventionForm.control}
                  name="estimatedAmountEtb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated cost (ETB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="1" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={interventionForm.control}
                  name="farmEstateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm estate</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          const next = v === "_none" ? "" : v;
                          field.onChange(next);
                          interventionForm.setValue("blockIds", []);
                        }}
                        value={field.value || "_none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select farm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
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
                <BlockActivityEstimateSection
                  farmEstateId={interventionFarmEstateId || undefined}
                  blockIds={interventionBlockIds ?? []}
                  activityIds={interventionActivityIds ?? []}
                  blocks={blocks}
                  activities={activities}
                  onBlockIdsChange={(ids) =>
                    interventionForm.setValue("blockIds", ids, { shouldValidate: true })
                  }
                  onActivityIdsChange={(ids) =>
                    interventionForm.setValue("activityIds", ids, { shouldValidate: true })
                  }
                  onEstimatedTotal={(total) => {
                    if (total != null && total > 0) {
                      interventionForm.setValue("estimatedAmountEtb", String(Math.round(total)));
                    }
                  }}
                />
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                <div className="flex justify-between gap-2">
                  {view === "all" ? (
                    <Button type="button" variant="ghost" onClick={() => setCreateStep(1)}>
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createRequest.isPending}>
                      {createRequest.isPending ? "Submitting…" : "Submit to SPX"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onCreateProject)} className="space-y-4">
                <FormField
                  control={projectForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Block rehabilitation — Q3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Scope, deliverables, and constraints" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={projectForm.control}
                    name="plannedStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="plannedEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={projectForm.control}
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
                  control={projectForm.control}
                  name="estimatedAmountEtb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget envelope (ETB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="farmEstateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm estate</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          const next = v === "_none" ? "" : v;
                          field.onChange(next);
                          projectForm.setValue("blockIds", []);
                        }}
                        value={field.value || "_none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select farm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
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
                <BlockActivityEstimateSection
                  farmEstateId={projectFarmEstateId || undefined}
                  blockIds={projectBlockIds ?? []}
                  activityIds={projectActivityIds ?? []}
                  blocks={blocks}
                  activities={activities}
                  onBlockIdsChange={(ids) => projectForm.setValue("blockIds", ids, { shouldValidate: true })}
                  onActivityIdsChange={(ids) =>
                    projectForm.setValue("activityIds", ids, { shouldValidate: true })
                  }
                  onEstimatedTotal={(total) => {
                    if (total != null && total > 0) {
                      projectForm.setValue("estimatedAmountEtb", String(Math.round(total)));
                    }
                  }}
                />
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                <div className="flex justify-between gap-2">
                  {view === "all" ? (
                    <Button type="button" variant="ghost" onClick={() => setCreateStep(1)}>
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createRequest.isPending}>
                      {createRequest.isPending ? "Submitting…" : "Submit to SPX"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </Modal>

        <Modal
          open={!!convertTarget}
          onClose={() => setConvertTarget(null)}
          title="Convert to Cropfort AFE (ETB)"
        >
          <Form {...convertForm}>
            <form onSubmit={convertForm.handleSubmit(onConvert)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Creates a Cropfort commitment (
                {convertTarget?.operationKind === "project" ? "project" : "intervention"} source).
                {convertTarget?.operationKind === "project"
                  ? " An active project record will be opened for multi-week execution."
                  : null}
              </p>
              <FormField
                control={convertForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AFE title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={convertForm.control}
                  name="amountEtb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (ETB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Computed band</FormLabel>
                  <div className="flex h-10 items-center">
                    {bandPreview ? (
                      <Badge>Band {bandPreview.band}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Enter amount</span>
                    )}
                  </div>
                </FormItem>
              </div>
              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setConvertTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={convertRequest.isPending}>
                  {convertRequest.isPending ? "Converting…" : "Create ETB AFE"}
                </Button>
              </div>
            </form>
          </Form>
        </Modal>

        <Modal open={!!dismissTarget} onClose={() => setDismissTarget(null)} title="Dismiss request">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tell the requester why this will not proceed through SPX.
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
    </>
  );

  if (embedded) return content;
  return <PageShell>{content}</PageShell>;
}
