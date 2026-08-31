"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Coins,
  FileSignature,
  Grid3x3,
  ShieldCheck,
} from "lucide-react";
import { cf } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";

/** Steps mapped to modules that exist in the CropFort platform today */
const STEPS = [
  {
    id: "BLOCK AFP",
    label: "Block AFP",
    icon: Grid3x3,
    desc: "Plan block programs, elections & ETB budgets",
    route: "/planning/afp-blocks",
  },
  {
    id: "RATE CARD",
    label: "Rate Card",
    icon: Coins,
    desc: "Approved activity rates in ETB",
    route: "/planning/rate-card",
  },
  {
    id: "CORE OPS",
    label: "Core Operations",
    icon: ClipboardList,
    desc: "Interventions & projects intake",
    route: "/operations/interventions",
  },
  {
    id: "AFE",
    label: "Cropfort AFE",
    icon: FileSignature,
    desc: "ETB commitments by spend band",
    route: "/planning/cropfort-afe",
  },
  {
    id: "EXECUTE",
    label: "Field Tickets",
    icon: ClipboardList,
    desc: "Weekly capture, entry & validation queue",
    route: "/execution/field-tickets",
  },
  {
    id: "REPORT",
    label: "BvA & Audit",
    icon: BarChart3,
    desc: "Budget vs actual & compliance trail",
    route: "/reports/cropfort-audit",
  },
] as const;

const EXAMPLE_FLOW = [
  {
    step: "Block AFP",
    detail: "Block A-12 pruning line elected in the annual farm program",
  },
  {
    step: "Rate Card",
    detail: "Approved ETB rate applied from the active rate card",
  },
  {
    step: "Core Operations",
    detail: "Intervention logged and linked to blocks A-12",
  },
  {
    step: "Cropfort AFE",
    detail: "Commitment raised in ETB and routed for band approval",
  },
  {
    step: "Field Tickets",
    detail: "Weekly tickets submitted and queued for SPX validation",
  },
  {
    step: "BvA & Audit",
    detail: "Released actuals flow to budget vs actual and audit log",
  },
];

export function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveStep((n) => (n + 1) % STEPS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [visible]);

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
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: cf.border, backgroundColor: cf.bg, color: cf.green }}
          >
            Built on CropFort today
          </span>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: cf.green }}>
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl lg:text-[2.75rem]">
            From planning to proof.
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: cf.muted }}>
            The same modules you see in the platform — block planning, rate cards, core operations, AFE
            commitments, field tickets, and reporting — connected in one ETB workflow.
          </p>
        </div>

        <div
          className={cn(
            "mt-14 transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
          )}
          style={{ transitionDelay: "0.15s" }}
        >
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-10 h-0.5" style={{ backgroundColor: cf.border }} />
              <div
                className={cn("workflow-line-grow absolute left-0 top-10 h-0.5", visible && "opacity-100")}
                style={{
                  width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                  backgroundColor: cf.green,
                  transition: "width 0.6s ease",
                }}
              />
              <div className="relative grid grid-cols-6 gap-2">
                {STEPS.map((step, i) => {
                  const isActive = i === activeStep;
                  const isPast = i < activeStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(i)}
                      className="group flex flex-col items-center text-center"
                    >
                      <div
                        className={cn(
                          "relative z-10 flex h-20 w-full max-w-[7.5rem] flex-col items-center justify-center rounded-2xl border-2 px-1 transition-all duration-500",
                          isActive && "scale-105 shadow-lg",
                          isPast && !isActive && "opacity-80",
                        )}
                        style={{
                          borderColor: isActive || isPast ? cf.green : cf.border,
                          backgroundColor: isActive ? cf.forest : isPast ? `${cf.sage}18` : cf.bg,
                          color: isActive ? cf.white : isPast ? cf.forest : cf.muted,
                          boxShadow: isActive ? `0 8px 24px ${cf.forest}33` : undefined,
                        }}
                      >
                        <span className="font-mono text-[9px] opacity-70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <step.icon className="mt-0.5 h-5 w-5" />
                        <span className="mt-1 text-[9px] font-bold leading-tight tracking-wide">{step.id}</span>
                      </div>
                      <p
                        className="mt-3 max-w-[9rem] text-xs font-medium leading-snug transition-colors"
                        style={{ color: isActive ? cf.text : cf.muted }}
                      >
                        {step.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 lg:hidden">
            {STEPS.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "flex min-w-[130px] shrink-0 flex-col items-center rounded-xl border-2 p-4 text-center transition-all",
                    isActive && "shadow-md",
                  )}
                  style={{
                    borderColor: isActive ? cf.green : cf.border,
                    backgroundColor: isActive ? `${cf.forest}08` : cf.bg,
                  }}
                >
                  <span className="font-mono text-[10px]" style={{ color: cf.muted }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="mt-2 h-5 w-5" style={{ color: isActive ? cf.forest : cf.muted }} />
                  <span className="mt-2 text-xs font-bold" style={{ color: cf.text }}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "mt-14 overflow-hidden rounded-2xl border shadow-xl transition-all duration-700",
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
          )}
          style={{ borderColor: cf.border, transitionDelay: "0.3s" }}
        >
          <div className="grid lg:grid-cols-2">
            <div className="p-6 md:p-8" style={{ backgroundColor: cf.bg }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cf.muted }}>
                    Platform module
                  </p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl">{STEPS[activeStep].label}</h3>
                  <p className="mt-1 font-mono text-xs" style={{ color: cf.green }}>
                    {STEPS[activeStep].route}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${cf.sage}22`, color: cf.forest }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  In product
                </span>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Block", value: "A-12" },
                  { label: "Currency", value: "ETB" },
                  { label: "Program", value: "Block AFP" },
                  { label: "Status", value: activeStep < 4 ? "In workflow" : "Reporting" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border bg-white p-3"
                    style={{ borderColor: cf.border }}
                  >
                    <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: cf.muted }}>
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-semibold" style={{ color: cf.text }}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div
                className="mt-6 flex items-center gap-3 rounded-xl border p-4"
                style={{ borderColor: cf.border, backgroundColor: cf.white }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${cf.sage}22`, color: cf.green }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: cf.muted }}>
                  <strong style={{ color: cf.text }}>{STEPS[activeStep].label}</strong> — {EXAMPLE_FLOW[activeStep].detail}
                </p>
              </div>
            </div>

            <div
              className="border-t p-6 md:p-8 lg:border-l lg:border-t-0"
              style={{ borderColor: cf.border, backgroundColor: cf.white }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cf.muted }}>
                ETB workflow
              </p>
              <ul className="mt-5 space-y-0">
                {EXAMPLE_FLOW.map((item, i) => {
                  const isActive = i === activeStep;
                  const isPast = i < activeStep;
                  return (
                    <li key={item.step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500",
                            isActive && "scale-110 shadow-md",
                          )}
                          style={{
                            borderColor: isActive || isPast ? cf.green : cf.border,
                            backgroundColor: isActive ? cf.forest : isPast ? `${cf.sage}22` : cf.bg,
                            color: isActive ? cf.white : isPast ? cf.forest : cf.muted,
                          }}
                        >
                          {isPast && !isActive ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        {i < EXAMPLE_FLOW.length - 1 ? (
                          <div
                            className="my-1 min-h-[1.5rem] w-0.5 flex-1 transition-colors duration-500"
                            style={{ backgroundColor: isPast ? cf.sage : cf.border }}
                          />
                        ) : null}
                      </div>
                      <div className={cn("pb-6 transition-opacity duration-500", !isActive && !isPast && "opacity-50")}>
                        <p
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: isActive ? cf.green : cf.muted }}
                        >
                          {item.step}
                        </p>
                        <p className="mt-0.5 text-sm leading-snug" style={{ color: cf.text }}>
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
