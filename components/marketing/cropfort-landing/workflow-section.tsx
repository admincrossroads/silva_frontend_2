"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  FileCheck,
  ScrollText,
  Wallet,
} from "lucide-react";
import { cf } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";

/** Matches live app modules (sidebar) — ETB throughout */
const STEPS = [
  {
    step: "01",
    label: "Rate card",
    icon: Wallet,
    desc: "Approve ETB unit rates before planning quantities",
    route: "/planning/rate-card",
  },
  {
    step: "02",
    label: "Annual plan",
    icon: ClipboardList,
    desc: "Block AFP — quantities by block and activity, cost from rates",
    route: "/planning/afp",
  },
  {
    step: "03",
    label: "Commitments",
    icon: FileCheck,
    desc: "AFE authorizations by Schedule 3 spend band",
    route: "/planning/afe",
  },
  {
    step: "04",
    label: "Execute",
    icon: ScrollText,
    desc: "Work orders, field tickets, and SPX validation",
    route: "/execution/field-tickets",
  },
  {
    step: "05",
    label: "Report",
    icon: BarChart3,
    desc: "Budget vs actual, period reports, and audit trail",
    route: "/reports/budget-vs-actual",
  },
] as const;

export function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="workflow"
      ref={ref}
      className="relative scroll-mt-24 overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: cf.white }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 90% 10%, ${cf.sage}28 0%, transparent 40%), radial-gradient(circle at 10% 90%, ${cf.earth}18 0%, transparent 35%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div
          className={cn(
            "mx-auto max-w-2xl text-center transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: cf.green }}>
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl lg:text-[2.75rem]">
            From planning to proof.
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: cf.muted }}>
            Budget, commitments, field execution, and reporting — one connected ETB workflow in the product
            today.
          </p>
        </div>

        <div
          className={cn(
            "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
          style={{ transitionDelay: "0.1s" }}
        >
          {STEPS.map((step) => (
            <div
              key={step.label}
              className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: cf.border }}
            >
              <span className="font-mono text-[10px] font-semibold tracking-wider" style={{ color: cf.green }}>
                {step.step}
              </span>
              <div
                className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${cf.sage}22`, color: cf.forest }}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg">{step.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: cf.muted }}>
                {step.desc}
              </p>
              <p className="mt-4 font-mono text-[10px]" style={{ color: cf.green }}>
                {step.route}
              </p>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "mt-10 rounded-2xl border p-6 md:p-8 transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
          style={{ borderColor: cf.border, backgroundColor: cf.bg, transitionDelay: "0.2s" }}
        >
          <p className="text-sm font-semibold" style={{ color: cf.text }}>
            Example path
          </p>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: cf.muted }}>
            <li>
              <strong style={{ color: cf.text }}>Budget</strong> — AFP line approved for agronomic operations in ETB
            </li>
            <li>
              <strong style={{ color: cf.text }}>Commitments</strong> — Band B AFE issued within that budget
            </li>
            <li>
              <strong style={{ color: cf.text }}>Core operations</strong> — Ad-hoc intervention logged and linked to blocks
            </li>
            <li>
              <strong style={{ color: cf.text }}>Execute</strong> — Work order issued; field ticket submitted and validated
            </li>
            <li>
              <strong style={{ color: cf.text }}>Report</strong> — Utilization and audit trail visible to Silva when released
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
