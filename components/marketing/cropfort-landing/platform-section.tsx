"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";
import { cf } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";
import { DashboardMock } from "./dashboard-mock";

const HIGHLIGHTS = [
  { icon: MapPin, label: "GIS block map", desc: "Live status per hectare" },
  { icon: Users, label: "Workforce pulse", desc: "126 crews in the field" },
  { icon: ClipboardList, label: "Work orders", desc: "18 activities today" },
  { icon: BarChart3, label: "Executive KPIs", desc: "Portfolio-wide view" },
];

export function PlatformSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="platform"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: cf.bg }}
    >
      {/* Background accents */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, ${cf.sage}33 0%, transparent 45%), radial-gradient(circle at 80% 60%, ${cf.earth}22 0%, transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `linear-gradient(${cf.border} 1px, transparent 1px), linear-gradient(90deg, ${cf.border} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-16">
          {/* Copy column */}
          <div
            className={cn(
              "transition-all duration-700",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: cf.border, backgroundColor: cf.white, color: cf.green }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: cf.sage }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: cf.sage }} />
              </span>
              Live operations view
            </span>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: cf.green }}>
              Platform
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              See your entire operation in one place.
            </h2>
            <p className="mt-5 text-base leading-relaxed md:text-lg" style={{ color: cf.muted }}>
              From individual blocks to portfolio-wide performance, CropFort gives your team a live operational
              view of what&apos;s happening across the farm.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {HIGHLIGHTS.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-500",
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  )}
                  style={{
                    borderColor: cf.border,
                    transitionDelay: `${200 + i * 80}ms`,
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cf.forest}10`, color: cf.forest }}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: cf.text }}>
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: cf.muted }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats — desktop only beside header */}
          <div
            className={cn(
              "hidden gap-3 lg:grid lg:grid-cols-2",
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}
            style={{ transition: "all 0.7s ease 0.15s" }}
          >
            {[
              { icon: CheckCircle2, value: "92%", label: "Verified execution", accent: cf.sage },
              { icon: Activity, value: "18", label: "Activities today", accent: cf.green },
              { icon: Users, value: "126", label: "Workers active", accent: cf.forest },
              { icon: AlertTriangle, value: "3", label: "Awaiting approval", accent: "#C45C4A" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border bg-white p-4 shadow-sm"
                style={{ borderColor: cf.border }}
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-4 w-4" style={{ color: stat.accent }} />
                  <span className="font-mono text-2xl font-semibold" style={{ color: cf.text }}>
                    {stat.value}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium" style={{ color: cf.muted }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard showcase */}
        <div
          className={cn(
            "relative mt-14 transition-all duration-1000 lg:mt-16",
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
          )}
          style={{ transitionDelay: "0.25s" }}
        >
          {/* Glow behind dashboard */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-3xl opacity-60 blur-3xl md:-inset-8"
            style={{
              background: `linear-gradient(135deg, ${cf.sage}40 0%, ${cf.forest}25 50%, ${cf.earth}20 100%)`,
            }}
          />

          {/* Floating callouts */}
          <div
            className="absolute -left-2 top-[18%] z-20 hidden rounded-lg border bg-white px-3 py-2 shadow-lg md:block lg:-left-6"
            style={{ borderColor: cf.border, animation: visible ? "landing-rise 0.8s ease-out 0.6s both" : undefined }}
          >
            <div className="flex items-center gap-2">
              <Boxes className="h-3.5 w-3.5" style={{ color: cf.green }} />
              <span className="text-xs font-semibold" style={{ color: cf.text }}>
                84 blocks mapped
              </span>
            </div>
          </div>
          <div
            className="absolute -right-2 top-[32%] z-20 hidden rounded-lg border bg-white px-3 py-2 shadow-lg md:block lg:-right-4"
            style={{ borderColor: cf.border, animation: visible ? "landing-rise 0.8s ease-out 0.75s both" : undefined }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#D4A843" }} />
              <span className="text-xs font-semibold" style={{ color: cf.text }}>
                Block A-12 in progress
              </span>
            </div>
          </div>

          <div className="relative [perspective:2000px]">
            <div className="transition-transform duration-700 lg:[transform:rotateX(2deg)]">
              <DashboardMock active={visible} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
