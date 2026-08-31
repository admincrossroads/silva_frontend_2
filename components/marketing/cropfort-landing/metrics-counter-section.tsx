"use client";

import { useEffect, useRef, useState } from "react";
import { cf } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  "Farm Operations",
  "Workforce",
  "Evidence",
  "Inputs",
  "Costs",
  "Traceability",
];

const METRICS = [
  { target: 4820, suffix: " ha", label: "Managed", demo: true },
  { target: 126, suffix: "", label: "Workers Active", demo: true },
  { target: 92, suffix: "%", label: "Work Verified", demo: true },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active, duration]);
  return value;
}

export function MetricsCounterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ha = useCountUp(4820, visible);
  const workers = useCountUp(126, visible);
  const verified = useCountUp(92, visible);
  const values = [
    `${ha.toLocaleString()} ha`,
    String(workers),
    `${verified}%`,
  ];

  return (
    <section
      ref={ref}
      className="relative border-y py-14 md:py-16"
      style={{ borderColor: cf.border, backgroundColor: cf.forest }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(132,169,92,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(132,169,92,0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-2 transition-all duration-700 md:gap-3",
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          {CAPABILITIES.map((cap) => (
            <span
              key={cap}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80"
              style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {METRICS.map((metric, i) => (
            <div
              key={metric.label}
              className={cn(
                "text-center transition-all duration-700",
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <p className="font-mono text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
                {values[i]}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/90">{metric.label}</p>
              {metric.demo ? (
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/45">
                  Demo data
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
