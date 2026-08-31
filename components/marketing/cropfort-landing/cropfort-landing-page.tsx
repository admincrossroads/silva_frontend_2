"use client";

import {
  ArrowRight,
  BarChart3,
  Boxes,
  Camera,
  ClipboardList,
  Map,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactForm } from "@/components/marketing/contact-form";
import { CropfortNav } from "@/components/marketing/cropfort-landing/cropfort-nav";
import { MobileFieldMock } from "@/components/marketing/cropfort-landing/mobile-field-mock";
import { CropfortFooter } from "@/components/marketing/cropfort-landing/cropfort-footer";
import { CropfortHeroCarousel } from "@/components/marketing/cropfort-landing/cropfort-hero-carousel";
import { MetricsCounterSection } from "@/components/marketing/cropfort-landing/metrics-counter-section";
import { PlatformSection } from "@/components/marketing/cropfort-landing/platform-section";
import { WorkflowSection } from "@/components/marketing/cropfort-landing/workflow-section";
import { cf, CTA_IMAGE } from "@/lib/config/cropfort-brand";

const TIMELINE = [
  { time: "07:58", label: "Assignment created" },
  { time: "08:12", label: "Crew checked in ✓" },
  { time: "08:18", label: "GPS location verified ✓" },
  { time: "08:21", label: "Work started" },
  { time: "11:46", label: "8.4 hectares completed" },
  { time: "11:48", label: "Field evidence uploaded ✓" },
  { time: "12:03", label: "Supervisor verified ✓" },
  { time: "12:17", label: "Manager approved ✓" },
];

const CHART_PLANNED = [
  { w: "W1", planned: 72, actual: 68 },
  { w: "W2", planned: 80, actual: 78 },
  { w: "W3", planned: 85, actual: 82 },
  { w: "W4", planned: 90, actual: 88 },
];

const CHART_COST = [
  { farm: "North", cost: 3200 },
  { farm: "East", cost: 2800 },
  { farm: "South", cost: 4100 },
  { farm: "West", cost: 2600 },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: cf.green }}>
      {children}
    </p>
  );
}

type Props = { signedIn: boolean };

export function CropfortLandingPage({ signedIn }: Props) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: cf.bg, color: cf.text }}>
      <CropfortNav signedIn={signedIn} />

      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#12372A]">
        <CropfortHeroCarousel />

        {/* Directional wash — photo stays visible on the right */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(18,55,42,0.82) 0%, rgba(18,55,42,0.58) 38%, rgba(18,55,42,0.22) 62%, rgba(18,55,42,0.06) 82%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(18,55,42,0.45) 0%, transparent 42%)",
          }}
        />
        {/* Localized scrim behind copy only */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-3xl bg-gradient-to-r from-[#12372A]/55 via-[#12372A]/20 to-transparent md:max-w-4xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: `linear-gradient(rgba(132,169,92,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(132,169,92,0.12) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* GIS overlay hints */}
        <div className="hero-marker pointer-events-none absolute right-[8%] top-[28%] hidden h-24 w-32 rounded border border-[#84A95C]/50 md:block animate-[hero-marker-in_1.2s_ease-out_1.1s_both]" />
        <div className="hero-marker pointer-events-none absolute right-[12%] top-[32%] hidden font-mono text-[10px] text-[#84A95C]/90 md:block animate-[hero-marker-in_1.2s_ease-out_1.35s_both]">
          A-12 · GPS ✓
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28 md:px-8">
          <p
            className="hero-stagger-item text-[11px] font-semibold uppercase tracking-[0.22em] text-[#84A95C]"
            style={{ animationDelay: "0.15s" }}
          >
            THE OPERATING SYSTEM FOR MODERN FARMS
          </p>
          <h1
            className="hero-stagger-item mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.28s" }}
          >
            Run every field operation with confidence.
          </h1>
          <p
            className="hero-stagger-item mt-6 max-w-xl text-base leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.3)] md:text-lg"
            style={{ animationDelay: "0.42s" }}
          >
            Plan activities, coordinate field teams, verify execution, manage inputs and understand farm
            performance from one connected platform.
          </p>
          <div
            className="hero-stagger-item mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.55s" }}
          >
            <a
              href="#workflow"
              className="inline-flex h-12 items-center justify-center gap-1 rounded-lg border border-white/25 px-6 text-sm font-medium text-white transition hover:bg-white/10"
            >
              See How It Works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <MetricsCounterSection />

      <PlatformSection />

      {/* Problem */}
      <section className="py-20 md:py-28" style={{ backgroundColor: cf.bg }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="max-w-2xl font-display text-3xl tracking-tight md:text-4xl">
            Managing a farm shouldn&apos;t mean managing disconnected information.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Limited Field Visibility",
                body: "Management often doesn't know exactly what is happening across every block until reports arrive.",
              },
              {
                title: "Disconnected Teams",
                body: "Managers, supervisors and field workers operate through separate channels and paperwork.",
              },
              {
                title: "Unverified Execution",
                body: "Completed work is difficult to verify without location, evidence and structured approvals.",
              },
            ].map((p) => (
              <div key={p.title} className="border-t-2 pt-6" style={{ borderColor: cf.earth }}>
                <h3 className="font-display text-xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: cf.muted }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-16 font-display text-2xl md:text-3xl" style={{ color: cf.forest }}>
            CropFort brings it all together.
          </p>
        </div>
      </section>

      <WorkflowSection />

      {/* Capabilities */}
      <section id="capabilities" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: cf.bg }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Everything you need to run field operations.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Map, title: "Farm & Block Management", body: "Digitally organize farms, estates, blocks, plots, boundaries and acreage.", preview: "84 blocks · 4 estates" },
              { icon: ClipboardList, title: "Field Operations", body: "Plan activities, issue work orders, schedule execution and monitor completion.", preview: "18 activities today" },
              { icon: Users, title: "Workforce Management", body: "Manage supervisors, crews, workers, attendance and productivity.", preview: "126 workers active" },
              { icon: Boxes, title: "Inputs & Inventory", body: "Track fertilizer, chemicals, seedlings, equipment and field consumption.", preview: "Input ledger synced" },
              { icon: Camera, title: "Evidence & Verification", body: "Capture GPS, photos, timestamps, quantities and supervisor verification.", preview: "GPS + photo trail" },
              { icon: BarChart3, title: "Costs & Performance", body: "Cost per hectare, labor costs, planned vs actual and operational KPIs.", preview: "ETB 3,420 / ha" },
            ].map((c) => (
              <div
                key={c.title}
                className="group flex flex-col rounded-xl border bg-white p-6 transition hover:shadow-lg"
                style={{ borderColor: cf.border }}
              >
                <c.icon className="h-5 w-5" style={{ color: cf.forest }} />
                <h3 className="mt-4 font-display text-xl">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: cf.muted }}>
                  {c.body}
                </p>
                <div
                  className="mt-5 rounded-lg border px-3 py-2 font-mono text-xs"
                  style={{ borderColor: cf.border, backgroundColor: cf.bg, color: cf.green }}
                >
                  {c.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field ops */}
      <section className="py-20 text-white md:py-28" style={{ backgroundColor: cf.forest }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Built for the office. Simple enough for the field.
          </h2>
          <div className="mt-14">
            <MobileFieldMock />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28" style={{ backgroundColor: cf.white }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionLabel>Proven execution</SectionLabel>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Every activity leaves a trail.</h2>
          <p className="mt-4 font-display text-xl md:text-2xl" style={{ color: cf.forest }}>
            Know what happened. Where. When. And by whom.
          </p>
          <div className="mt-14 space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.time} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-sm font-semibold" style={{ color: cf.earth }}>
                    {item.time}
                  </span>
                  {i < TIMELINE.length - 1 ? (
                    <div className="my-1 h-full min-h-[2rem] w-px" style={{ backgroundColor: cf.border }} />
                  ) : null}
                </div>
                <p className="pb-8 text-sm font-medium md:text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence */}
      <section id="intelligence" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: cf.bg }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionLabel>Management intelligence</SectionLabel>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
            Turn field execution into management intelligence.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { v: "4,820 ha", l: "Managed" },
              { v: "92%", l: "Verified Execution" },
              { v: "ETB 3,420", l: "Cost / Hectare" },
              { v: "126", l: "Workers Active" },
              { v: "84%", l: "Activities Completed" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl border bg-white p-4 md:p-5" style={{ borderColor: cf.border }}>
                <p className="font-mono text-xl font-semibold md:text-2xl" style={{ color: cf.forest }}>
                  {k.v}
                </p>
                <p className="mt-1 text-xs font-medium" style={{ color: cf.muted }}>
                  {k.l}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-5" style={{ borderColor: cf.border }}>
              <p className="text-sm font-semibold">Planned vs Actual</p>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CHART_PLANNED}>
                    <CartesianGrid stroke={cf.border} strokeDasharray="3 3" />
                    <XAxis dataKey="w" tick={{ fontSize: 11, fill: cf.muted }} />
                    <YAxis tick={{ fontSize: 11, fill: cf.muted }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="planned" stroke={cf.border} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="actual" stroke={cf.green} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-5" style={{ borderColor: cf.border }}>
              <p className="text-sm font-semibold">Cost by Farm</p>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_COST}>
                    <CartesianGrid stroke={cf.border} strokeDasharray="3 3" />
                    <XAxis dataKey="farm" tick={{ fontSize: 11, fill: cf.muted }} />
                    <YAxis tick={{ fontSize: 11, fill: cf.muted }} />
                    <Tooltip />
                    <Bar dataKey="cost" fill={cf.forest} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 md:py-28" style={{ backgroundColor: cf.white }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            The right information for every team.
          </h2>
          <Tabs defaultValue="management" className="mt-10">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {["management", "farm", "supervisor", "worker"].map((r) => (
                <TabsTrigger
                  key={r}
                  value={r}
                  className="rounded-lg border px-4 py-2 capitalize data-[state=active]:border-transparent data-[state=active]:bg-[#12372A] data-[state=active]:text-white data-[state=active]:shadow-none"
                  style={{ borderColor: cf.border }}
                >
                  {r === "farm" ? "Farm Manager" : r === "worker" ? "Field Worker" : r === "supervisor" ? "Field Supervisor" : "Management"}
                </TabsTrigger>
              ))}
            </TabsList>
            {[
              { id: "management", title: "Management", items: ["Portfolio performance & costs", "Approval queues & risk flags", "Operational KPIs & trends", "Executive reporting"] },
              { id: "farm", title: "Farm Manager", items: ["Farm & block plans", "Resource allocation", "Activity scheduling", "Progress monitoring"] },
              { id: "supervisor", title: "Field Supervisor", items: ["Assigned activities & crews", "Field progress tracking", "Evidence capture & verification", "Daily crew coordination"] },
              { id: "worker", title: "Field Worker", items: ["Today's assignments", "Large-action work screen", "GPS check-in", "Photo evidence upload"] },
            ].map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <div className="grid gap-8 rounded-xl border p-6 md:grid-cols-2 md:p-8" style={{ borderColor: cf.border, backgroundColor: cf.bg }}>
                  <div>
                    <h3 className="font-display text-2xl">{role.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {role.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm" style={{ color: cf.muted }}>
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: cf.sage }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border bg-white p-5 font-mono text-xs" style={{ borderColor: cf.border, color: cf.muted }}>
                    <p className="mb-3 font-sans text-sm font-semibold" style={{ color: cf.text }}>
                      {role.title} view
                    </p>
                    {role.items.map((item) => (
                      <div key={item} className="mb-2 rounded border px-3 py-2" style={{ borderColor: cf.border }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Traceability */}
      <section className="py-20 md:py-28" style={{ backgroundColor: cf.forest, color: cf.white }}>
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            One source of truth for every hectare.
          </h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Every management metric traces back to actual field execution.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-2 text-sm font-medium md:gap-3">
            {["Farm", "Block", "Activity", "Work Order", "Crew", "Evidence", "Verification", "Approval", "Cost", "Performance"].map(
              (node, i, arr) => (
                <span key={node} className="flex items-center gap-2">
                  <span className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5">{node}</span>
                  {i < arr.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-white/40" /> : null}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <img src={CTA_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12372A]/95 to-[#12372A]/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center md:px-8">
          <h2 className="font-display text-3xl tracking-tight text-white md:text-5xl">
            Take control of every hectare.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
            CropFort gives agricultural teams the visibility, accountability and operational control they need to
            plan better, execute confidently and understand what&apos;s happening across every farm.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#contact" className="inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white">
              Talk to Our Team
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact + Footer */}
      <section id="contact" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: cf.white }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 md:px-8">
          <div>
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mt-3 font-display text-3xl tracking-tight">Talk to our team</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: cf.muted }}>
              Request a demo or ask about deploying CropFort across your agricultural program.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <CropfortFooter signedIn={signedIn} />
    </div>
  );
}
