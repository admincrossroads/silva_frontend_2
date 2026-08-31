"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Map,
  Package,
  ShieldCheck,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";
import { cf } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Farms", icon: Sprout },
  { label: "Blocks", icon: Map },
  { label: "Operations", icon: ClipboardList },
  { label: "Work Orders", icon: ClipboardList },
  { label: "Workforce", icon: Users },
  { label: "Inventory", icon: Package },
  { label: "Approvals", icon: ShieldCheck },
  { label: "Financials", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];

const BLOCKS = [
  { id: "A-01", x: "8%", y: "18%", w: "14%", h: "22%", status: "done" },
  { id: "A-02", x: "24%", y: "20%", w: "12%", h: "18%", status: "progress" },
  { id: "A-12", x: "40%", y: "15%", w: "16%", h: "28%", status: "progress", featured: true },
  { id: "B-04", x: "58%", y: "22%", w: "14%", h: "20%", status: "planned" },
  { id: "C-02", x: "72%", y: "35%", w: "18%", h: "24%", status: "issue" },
  { id: "A-03", x: "12%", y: "48%", w: "20%", h: "26%", status: "done" },
  { id: "B-01", x: "38%", y: "52%", w: "22%", h: "30%", status: "planned" },
];

const ACTIVITY_FEED = [
  { time: "11:46", text: "Coffee pruning completed — Block A-12", status: "done" },
  { time: "10:22", text: "GPS verified — Crew checked in B-04", status: "progress" },
  { time: "09:05", text: "Issue flagged — C-02 input variance", status: "issue" },
];

const statusColor: Record<string, string> = {
  done: cf.sage,
  progress: "#D4A843",
  planned: "#A8B5A8",
  issue: "#C45C4A",
};

const KPI = [
  { label: "Blocks", value: "84", icon: Map, accent: cf.forest },
  { label: "Activities Today", value: "18", icon: ClipboardList, accent: cf.green },
  { label: "Workers Active", value: "126", icon: Users, accent: cf.sage },
  { label: "Awaiting Approval", value: "3", icon: ShieldCheck, accent: "#C45C4A" },
];

type Props = { active?: boolean };

export function DashboardMock({ active = true }: Props) {
  const [pulseBlock, setPulseBlock] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setPulseBlock((n) => (n + 1) % 2), 2400);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-2xl shadow-black/15 ring-1 ring-black/5"
      style={{ borderColor: cf.border, backgroundColor: cf.white }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: cf.border, backgroundColor: cf.forest }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C45C4A]/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D4A843]/90" />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cf.sage }} />
        </div>
        <div className="hidden flex-1 justify-center sm:flex">
          <div
            className="w-full max-w-xs rounded-md border px-3 py-1 text-center text-[10px] font-medium text-white/50"
            style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            app.cropfort.io / operations
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
          Operations Overview
        </span>
      </div>

      <div className="flex min-h-[440px] flex-col lg:min-h-[520px] lg:flex-row">
        {/* Sidebar */}
        <aside
          className="hidden w-48 shrink-0 border-r p-3 lg:block"
          style={{ borderColor: cf.border, backgroundColor: "#FAFBF8" }}
        >
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ backgroundColor: cf.forest }}>
              <Boxes className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight" style={{ color: cf.forest }}>
              CropFort
            </span>
          </div>
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  item.active && "shadow-sm",
                )}
                style={{
                  backgroundColor: item.active ? cf.white : "transparent",
                  color: item.active ? cf.forest : cf.muted,
                  border: item.active ? `1px solid ${cf.border}` : "1px solid transparent",
                }}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cf.muted }}>
                North Estate · Live
              </p>
              <h3 className="font-display text-lg font-semibold" style={{ color: cf.text }}>
                Portfolio operations
              </h3>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ backgroundColor: `${cf.sage}22`, color: cf.green }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: cf.sage }} />
              Synced
            </span>
          </div>

          {/* KPI row */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {KPI.map((k, i) => (
              <div
                key={k.label}
                className={cn(
                  "relative overflow-hidden rounded-xl border px-3 py-2.5 transition-all duration-500",
                  active && "animate-[landing-rise_0.6s_ease-out_both]",
                )}
                style={{
                  borderColor: cf.border,
                  backgroundColor: cf.white,
                  animationDelay: `${i * 80}ms`,
                  boxShadow: `inset 3px 0 0 ${k.accent}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <k.icon className="h-3.5 w-3.5" style={{ color: k.accent }} />
                  <p className="font-mono text-xl font-semibold leading-none" style={{ color: cf.text }}>
                    {k.value}
                  </p>
                </div>
                <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide" style={{ color: cf.muted }}>
                  {k.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
            {/* GIS map */}
            <div
              className="relative min-h-[200px] flex-1 overflow-hidden rounded-xl border lg:min-h-[280px]"
              style={{ borderColor: cf.border, backgroundColor: "#E4EBE0" }}
            >
              {/* Satellite texture hint */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(ellipse at 30% 40%, ${cf.sage}55 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, ${cf.green}33 0%, transparent 45%)`,
                }}
              />
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `linear-gradient(${cf.border} 1px, transparent 1px), linear-gradient(90deg, ${cf.border} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />

              {BLOCKS.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    "absolute rounded-md border-2 transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-md",
                    b.featured && pulseBlock === 0 && "ring-2 ring-[#D4A843]/60 ring-offset-1",
                  )}
                  style={{
                    left: b.x,
                    top: b.y,
                    width: b.w,
                    height: b.h,
                    borderColor: statusColor[b.status],
                    backgroundColor: `${statusColor[b.status]}33`,
                  }}
                >
                  <span
                    className="absolute left-1 top-1 rounded px-1 py-0.5 font-mono text-[9px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: statusColor[b.status] }}
                  >
                    {b.id}
                  </span>
                  {b.featured ? (
                    <span className="absolute bottom-1 right-1 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ backgroundColor: "#D4A843" }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#D4A843" }} />
                    </span>
                  ) : null}
                </div>
              ))}

              {/* GPS marker */}
              <div className="absolute left-[52%] top-[38%] flex flex-col items-center">
                <div className="rounded-full border-2 border-white p-1 shadow-md" style={{ backgroundColor: cf.forest }}>
                  <Map className="h-3 w-3 text-white" />
                </div>
                <span className="mt-0.5 rounded bg-white/90 px-1 font-mono text-[8px] font-semibold shadow" style={{ color: cf.forest }}>
                  GPS ✓
                </span>
              </div>

              <div
                className="absolute bottom-2 right-2 flex flex-wrap gap-2 rounded-lg border bg-white/95 px-2.5 py-1.5 text-[9px] shadow-sm backdrop-blur-sm"
                style={{ borderColor: cf.border }}
              >
                {[
                  { c: cf.sage, l: "Done" },
                  { c: "#D4A843", l: "Active" },
                  { c: "#A8B5A8", l: "Planned" },
                  { c: "#C45C4A", l: "Issue" },
                ].map((x) => (
                  <span key={x.l} className="flex items-center gap-1 font-medium" style={{ color: cf.muted }}>
                    <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: x.c }} />
                    {x.l}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity feed — desktop */}
            <div
              className="hidden w-44 shrink-0 flex-col rounded-xl border p-3 lg:flex"
              style={{ borderColor: cf.border, backgroundColor: "#FAFBF8" }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: cf.muted }}>
                Live feed
              </p>
              <ul className="space-y-2">
                {ACTIVITY_FEED.map((item) => (
                  <li
                    key={item.text}
                    className="rounded-lg border bg-white p-2"
                    style={{ borderColor: cf.border }}
                  >
                    <p className="font-mono text-[9px] font-semibold" style={{ color: cf.earth }}>
                      {item.time}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug font-medium" style={{ color: cf.text }}>
                      {item.text}
                    </p>
                    <span
                      className="mt-1 inline-block h-1 w-6 rounded-full"
                      style={{ backgroundColor: statusColor[item.status] }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
