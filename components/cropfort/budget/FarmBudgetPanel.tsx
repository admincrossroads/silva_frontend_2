"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  FileText,
  Hammer,
  Landmark,
  Loader2,
  MapPin,
  Package,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { BudgetRollupBlock } from "@/lib/api/cropfort/farm-budget";
import { Button } from "@/components/ui/button";
import { NativeSelect as Select } from "@/components/ui/select-native";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { DashboardPanel, DashboardPanelEmpty } from "@/components/dashboard/dashboard-panel";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";
import { useFarmBudgetRollupTyped, useFarmFeeSchedule } from "@/hooks/use-farm-budget";

function formatEtb(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const DEFAULT_YEAR = new Date().getUTCFullYear();

type Props = {
  farmId?: string;
  farmName?: string | null;
  embedded?: boolean;
  defaultPlanYear?: number;
};

export function FarmBudgetPanel({
  farmId: farmIdProp,
  farmName: farmNameProp,
  embedded = false,
  defaultPlanYear = DEFAULT_YEAR,
}: Props) {
  const {
    activeFarmEstateId,
    activeFarmEstate,
    isLoading: estateLoading,
    emptyMessage,
  } = useActiveFarmEstate();

  const farmId = farmIdProp ?? activeFarmEstateId ?? undefined;
  const farmName = farmNameProp ?? activeFarmEstate?.name ?? null;
  const [planYear, setPlanYear] = useState(defaultPlanYear);
  const [feeYear, setFeeYear] = useState<1 | 2 | 3 | "all">(1);

  const {
    data: rollup,
    isLoading: rollupLoading,
    isError: rollupError,
    error: rollupErr,
  } = useFarmBudgetRollupTyped(farmId, planYear);
  const {
    data: feeSchedule,
    isLoading: feeLoading,
    isError: feeError,
    error: feeErr,
  } = useFarmFeeSchedule(farmId);

  const yearOptions = useMemo(() => {
    const y = DEFAULT_YEAR;
    return [y - 1, y, y + 1];
  }, []);

  const labor = rollup?.totals?.labor ?? 0;
  const material = rollup?.totals?.material ?? 0;
  const service = rollup?.totals?.service ?? 0;
  const opexTotal = labor + material + service;

  const feeAnnual = feeSchedule
    ? Number(feeSchedule.confirmedAnnualFee || 0) +
      (feeSchedule.lines || [])
        .filter((l) => !l.deferred && l.annualFee != null)
        .reduce((s, l) => s + Number(l.annualFee), 0)
    : null;

  const feeYear1 =
    feeSchedule?.monthlyRollup
      ?.filter((m) => m.monthIndex <= 12)
      .reduce((s, m) => s + Number(m.feeEtb || 0), 0) ?? null;

  const feeMonths = useMemo(() => {
    const all = feeSchedule?.monthlyRollup ?? [];
    if (feeYear === "all") return all;
    const start = (feeYear - 1) * 12 + 1;
    const end = feeYear * 12;
    return all.filter((m) => m.monthIndex >= start && m.monthIndex <= end);
  }, [feeSchedule?.monthlyRollup, feeYear]);

  const opexShare = useMemo(() => {
    if (opexTotal <= 0) return { labor: 0, material: 0, service: 0 };
    return {
      labor: (labor / opexTotal) * 100,
      material: (material / opexTotal) * 100,
      service: (service / opexTotal) * 100,
    };
  }, [labor, material, service, opexTotal]);

  const hasOpexRows =
    (rollup?.tier1ByBlock?.length ?? 0) > 0 || Boolean(rollup?.tier23FarmWide);
  const hasOpexMoney = opexTotal > 0;
  const hasFees = Boolean(feeSchedule);
  const isEmpty = !hasOpexRows && !hasOpexMoney && !hasFees;

  const yearSelect = (
    <Select
      aria-label="Plan year"
      value={String(planYear)}
      onChange={(e) => setPlanYear(Number(e.target.value))}
      className="h-9 w-full min-w-[7.5rem] sm:w-[7.5rem]"
    >
      {yearOptions.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </Select>
  );

  if (!farmIdProp && estateLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading farm…
      </div>
    );
  }

  if (!farmId) {
    return <p className="text-sm text-muted-foreground">{emptyMessage || "Select a farm estate."}</p>;
  }

  const loading = rollupLoading || feeLoading;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Toolbar / farm strip */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80",
          "bg-gradient-to-br from-primary/[0.07] via-background to-emerald-500/[0.04]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, hsl(var(--primary) / 0.18), transparent 42%), radial-gradient(circle at 88% 10%, hsl(152 45% 40% / 0.12), transparent 36%)",
          }}
        />
        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Landmark className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Farm budget
              </span>
            </div>
            <p className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {farmName || "Farm"}
            </p>
            <p className="max-w-xl text-xs text-muted-foreground sm:text-sm">
              Live opex from rates × norms × planned qty, plus commercial fee cash timing.
            </p>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:items-end">
            <span className="text-xs text-muted-foreground">Plan year</span>
            {yearSelect}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading budget…
        </div>
      ) : null}

      {rollupError ? (
        <p className="text-sm text-destructive">{getApiErrorMessage(rollupErr)}</p>
      ) : null}
      {feeError ? (
        <p className="text-sm text-destructive">{getApiErrorMessage(feeErr)}</p>
      ) : null}

      {!loading && isEmpty ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/90 bg-muted/20 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-lg space-y-4 text-center sm:text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold">No budget yet for this farm</p>
              <p className="text-sm text-muted-foreground">
                Budget is derived — not a separate document. Build it from approved rates, elected
                plans with quantity, and the fee schedule.
              </p>
            </div>
            <ol className="space-y-2 text-left text-sm text-muted-foreground">
              <EmptyStep
                icon={FileText}
                href="/planning/rate-card"
                title="Approve Rate card"
                detail="Labor, material, and service unit prices"
              />
              <EmptyStep
                icon={Briefcase}
                href="/planning/afp"
                title="Set Annual plan qty"
                detail="Elect activities and enter planned quantities"
              />
              <EmptyStep
                icon={CalendarDays}
                href="/planning/field-calendar"
                title="Set fee schedule"
                detail="Confirmed retainer and elective activations"
              />
            </ol>
          </div>
        </div>
      ) : null}

      {!loading && !isEmpty ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <KpiStatCard
              label="Labor"
              value={formatEtb(labor)}
              icon={Users}
              tone="primary"
              sublabel={opexTotal > 0 ? `${opexShare.labor.toFixed(0)}% of opex` : undefined}
            />
            <KpiStatCard
              label="Material"
              value={formatEtb(material)}
              icon={Package}
              tone="amber"
              sublabel={opexTotal > 0 ? `${opexShare.material.toFixed(0)}% of opex` : undefined}
            />
            <KpiStatCard
              label="Service"
              value={formatEtb(service)}
              icon={Wrench}
              tone="blue"
              sublabel={opexTotal > 0 ? `${opexShare.service.toFixed(0)}% of opex` : undefined}
            />
            <KpiStatCard
              label="Opex total"
              value={formatEtb(opexTotal)}
              icon={Hammer}
              tone="slate"
              sublabel={`Plan year ${planYear}`}
            />
            <KpiStatCard
              label="Fees (annualized)"
              value={feeAnnual != null ? formatEtb(feeAnnual) : "—"}
              icon={Landmark}
              tone="primary"
              sublabel={feeYear1 != null ? `Y1 cash ${formatEtb(feeYear1)}` : "No fee schedule"}
              href="/planning/field-calendar"
            />
          </section>

          {opexTotal > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Opex mix
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">{formatEtb(opexTotal)} ETB</p>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary transition-[width] duration-500"
                  style={{ width: `${opexShare.labor}%` }}
                  title={`Labor ${opexShare.labor.toFixed(0)}%`}
                />
                <div
                  className="bg-amber-500/80 transition-[width] duration-500"
                  style={{ width: `${opexShare.material}%` }}
                  title={`Material ${opexShare.material.toFixed(0)}%`}
                />
                <div
                  className="bg-sky-500/80 transition-[width] duration-500"
                  style={{ width: `${opexShare.service}%` }}
                  title={`Service ${opexShare.service.toFixed(0)}%`}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Labor
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500/80" /> Material
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500/80" /> Service
                </span>
              </div>
            </div>
          ) : null}

          {!hasOpexMoney && !hasOpexRows ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              No elected activity-plan costs for {planYear}. Approve rates and set planned qty on{" "}
              <Link href="/planning/afp" className="font-medium text-foreground underline underline-offset-2">
                Annual plan
              </Link>
              .
            </p>
          ) : null}

          <div className="space-y-4">
            <DashboardPanel title="Tier 1 by block" className="min-w-0">
              {(rollup?.tier1ByBlock?.length ?? 0) === 0 ? (
                <DashboardPanelEmpty message="No Tier 1 block budgets for this year." />
              ) : (
                <div className="p-4 sm:p-5">
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rollup!.tier1ByBlock.map((b) => (
                      <BlockBudgetCard key={b.blockId || b.blockCode || "unknown"} block={b} />
                    ))}
                  </ul>
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel title="Tier 2 / 3 farm-wide" className="min-w-0">
              {rollup?.tier23FarmWide ? (
                <div className="space-y-5 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:py-5">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Farm scope total
                      </p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                        {formatEtb(rollup.tier23FarmWide.total)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground sm:text-right">
                      {rollup.tier23FarmWide.electedActivities} elected activit
                      {rollup.tier23FarmWide.electedActivities === 1 ? "y" : "ies"}
                      {(rollup.tier23FarmWide.tier2Activities ||
                        rollup.tier23FarmWide.tier3Activities) && (
                        <span className="mt-1 block text-xs">
                          {[
                            rollup.tier23FarmWide.tier2Activities
                              ? `T2 ${rollup.tier23FarmWide.tier2Activities}`
                              : null,
                            rollup.tier23FarmWide.tier3Activities
                              ? `T3 ${rollup.tier23FarmWide.tier3Activities}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <CostChip label="Labor" value={formatEtb(rollup.tier23FarmWide.labor)} />
                    <CostChip label="Material" value={formatEtb(rollup.tier23FarmWide.material)} />
                    <CostChip label="Service" value={formatEtb(rollup.tier23FarmWide.service)} />
                  </dl>
                </div>
              ) : (
                <DashboardPanelEmpty message="No elected Tier 2 / 3 plans for this year." />
              )}
            </DashboardPanel>
          </div>

          {feeSchedule?.monthlyRollup?.length ? (
            <DashboardPanel
              title="Commercial fee — cash timing"
              viewAllHref={embedded ? undefined : "/planning/field-calendar"}
              viewAllLabel="Edit fees"
              className="min-w-0"
            >
              <div className="p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {([1, 2, 3, "all"] as const).map((y) => (
                    <Button
                      key={String(y)}
                      size="sm"
                      variant={feeYear === y ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setFeeYear(y)}
                    >
                      {y === "all" ? "All 36" : `Year ${y}`}
                    </Button>
                  ))}
                </div>

                {/* Mobile fee cards */}
                <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-0.5 sm:hidden">
                  {feeMonths.map((m) => (
                    <li
                      key={m.monthIndex}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          M{m.monthIndex}
                          <span className="ml-1.5 font-normal text-muted-foreground">{m.monthLabel}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Conf {formatEtb(m.confirmedFeeEtb)} · El {formatEtb(m.electiveFeeEtb)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatEtb(m.feeEtb)}</p>
                        <p className="text-[11px] tabular-nums text-muted-foreground">
                          cum {formatEtb(m.cumulativeFeeEtb)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="hidden max-h-[320px] overflow-auto sm:block">
                  <table className="w-full min-w-[32rem] text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                      <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Month</th>
                        <th className="px-3 py-2 font-medium">Label</th>
                        <th className="px-3 py-2 text-right font-medium">Confirmed</th>
                        <th className="px-3 py-2 text-right font-medium">Elective</th>
                        <th className="px-3 py-2 text-right font-medium">Total</th>
                        <th className="px-3 py-2 text-right font-medium">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeMonths.map((m) => (
                        <tr
                          key={m.monthIndex}
                          className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-2 tabular-nums text-muted-foreground">{m.monthIndex}</td>
                          <td className="px-3 py-2">{m.monthLabel}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {formatEtb(m.confirmedFeeEtb)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {formatEtb(m.electiveFeeEtb)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums">
                            {formatEtb(m.feeEtb)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            {formatEtb(m.cumulativeFeeEtb)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DashboardPanel>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function BlockBudgetCard({ block }: { block: BudgetRollupBlock }) {
  const lines = [
    { label: "Labor", value: block.labor, bar: "bg-primary" },
    { label: "Material", value: block.material, bar: "bg-amber-500/80" },
    { label: "Service", value: block.service, bar: "bg-sky-500/80" },
  ] as const;
  const total = Number(block.total) || 0;

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3 border-b border-border/60 bg-gradient-to-r from-primary/[0.06] to-transparent px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight">{block.blockCode || "—"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {block.electedActivities} activit{block.electedActivities === 1 ? "y" : "ies"} elected
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Block total
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.65rem]">
            {formatEtb(block.total)}
          </p>
        </div>

        {total > 0 ? (
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
            {lines.map((line) => {
              const pct = total > 0 ? (Number(line.value) / total) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={line.label}
                  className={cn("h-full transition-[width] duration-500", line.bar)}
                  style={{ width: `${pct}%` }}
                  title={`${line.label} ${pct.toFixed(0)}%`}
                />
              );
            })}
          </div>
        ) : null}

        <ul className="space-y-0 divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden">
          {lines.map((line) => (
            <li
              key={line.label}
              className="flex items-center justify-between gap-3 bg-background/60 px-3.5 py-2.5 sm:px-4"
            >
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", line.bar)} />
                {line.label}
              </span>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatEtb(line.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function CostChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3.5 sm:px-5 sm:py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 break-all text-lg font-semibold tabular-nums tracking-tight sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function EmptyStep({
  icon: Icon,
  href,
  title,
  detail,
}: {
  icon: typeof FileText;
  href: string;
  title: string;
  detail: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 font-medium text-foreground">
            {title}
            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
        </span>
      </Link>
    </li>
  );
}
