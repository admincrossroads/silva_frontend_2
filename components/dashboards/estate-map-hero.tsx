"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type EstateBlock = {
  id: string;
  code: string;
  label: string;
  areaHa: number | null;
  workOrderId: string | null;
  workOrderStatus: string | null;
  activity: string | null;
  health: string;
};

export type EstateMapData = {
  estateId: string;
  name: string;
  location: string | null;
  totalAreaHa: number | null;
  climate: { tempC: number; humidityPct: number; rainfallMm: number };
  blocks: EstateBlock[];
};

type Pt = { x: number; y: number };

const OUTER_PATH =
  "M38 78 L72 34 L140 20 L205 18 L265 38 L315 72 L338 120 L330 168 L285 198 L210 212 L135 208 L70 185 L32 148 L20 108 L26 88 Z";

const ESTATE_RING: Pt[] = [
  { x: 38, y: 78 },
  { x: 72, y: 34 },
  { x: 140, y: 20 },
  { x: 205, y: 18 },
  { x: 265, y: 38 },
  { x: 315, y: 72 },
  { x: 338, y: 120 },
  { x: 330, y: 168 },
  { x: 285, y: 198 },
  { x: 210, y: 212 },
  { x: 135, y: 208 },
  { x: 70, y: 185 },
  { x: 32, y: 148 },
  { x: 20, y: 108 },
  { x: 26, y: 88 },
];

const CLASSIC_SEEDS: Pt[] = [
  { x: 92, y: 70 },
  { x: 198, y: 54 },
  { x: 292, y: 88 },
  { x: 62, y: 138 },
  { x: 178, y: 128 },
  { x: 278, y: 162 },
];

function shortName(block: EstateBlock) {
  const raw = (block.label || "").trim();
  if (!raw) return "";
  const withoutCode = raw
    .replace(new RegExp(`^block\\s*${block.code}\\s*[-–:]?\\s*`, "i"), "")
    .trim();
  if (!withoutCode || withoutCode.toLowerCase() === block.code.toLowerCase()) return "";
  return withoutCode.length > 16 ? `${withoutCode.slice(0, 14)}…` : withoutCode;
}

function centroid(poly: Pt[]): Pt {
  if (!poly.length) return { x: 180, y: 115 };
  let x = 0;
  let y = 0;
  for (const p of poly) {
    x += p.x;
    y += p.y;
  }
  return { x: x / poly.length, y: y / poly.length };
}

function pathFrom(poly: Pt[]) {
  if (poly.length < 3) return "";
  return `M${poly.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z`;
}

function insideHalfPlane(p: Pt, siteA: Pt, siteB: Pt) {
  const dx = siteB.x - siteA.x;
  const dy = siteB.y - siteA.y;
  return (
    2 * (dx * p.x + dy * p.y) <=
    siteB.x * siteB.x - siteA.x * siteA.x + siteB.y * siteB.y - siteA.y * siteA.y
  );
}

function intersect(p: Pt, q: Pt, siteA: Pt, siteB: Pt): Pt {
  const dx = siteB.x - siteA.x;
  const dy = siteB.y - siteA.y;
  const a = 2 * dx;
  const b = 2 * dy;
  const c = siteB.x * siteB.x - siteA.x * siteA.x + siteB.y * siteB.y - siteA.y * siteA.y;
  const denom = a * (q.x - p.x) + b * (q.y - p.y);
  if (Math.abs(denom) < 1e-9) return q;
  const t = (c - a * p.x - b * p.y) / denom;
  return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) };
}

function clipByHalfPlane(poly: Pt[], siteA: Pt, siteB: Pt): Pt[] {
  if (poly.length < 3) return [];
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = insideHalfPlane(cur, siteA, siteB);
    const prevIn = insideHalfPlane(prev, siteA, siteB);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur, siteA, siteB));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur, siteA, siteB));
    }
  }
  return out;
}

function voronoiCell(site: Pt, sites: Pt[], ring: Pt[]): Pt[] {
  let cell = ring.map((p) => ({ ...p }));
  for (const other of sites) {
    if (other === site) continue;
    if (Math.hypot(other.x - site.x, other.y - site.y) < 0.5) continue;
    cell = clipByHalfPlane(cell, site, other);
    if (cell.length < 3) return [];
  }
  return cell;
}

function placeSeeds(count: number): Pt[] {
  if (count <= 0) return [];
  if (count <= CLASSIC_SEEDS.length) {
    return CLASSIC_SEEDS.slice(0, count).map((p) => ({ ...p }));
  }
  const cols = Math.ceil(Math.sqrt(count * 1.15));
  const seeds: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const u = (col + 0.5) / cols;
    const v = (row + 0.5) / Math.ceil(count / cols);
    seeds.push({
      x: 40 + u * 280 + (((i * 37) % 11) - 5),
      y: 36 + v * 160 + (((i * 53) % 9) - 4),
    });
  }
  return seeds;
}

function parcelsFor(blocks: EstateBlock[]) {
  const seeds = placeSeeds(blocks.length);
  return blocks
    .map((block, i) => {
      const site = seeds[i];
      const poly = voronoiCell(site, seeds, ESTATE_RING);
      if (poly.length < 3) return null;
      return {
        block,
        index: i,
        path: pathFrom(poly),
        label: centroid(poly),
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p?.path));
}

function fillFor(health: string) {
  if (health === "watch") return "url(#fillWatch)";
  if (health === "overdue" || health === "over_budget") return "url(#fillHot)";
  return "url(#fillOk)";
}

function sideFillFor(health: string) {
  if (health === "watch") return "#6e5412";
  if (health === "overdue" || health === "over_budget") return "#6e2420";
  return "#164a2e";
}

/** Shade trees along the estate edge (coffee under canopy). */
const EDGE_SHADE: Pt[] = [
  { x: 52, y: 58 },
  { x: 98, y: 30 },
  { x: 158, y: 20 },
  { x: 218, y: 22 },
  { x: 278, y: 44 },
  { x: 322, y: 88 },
  { x: 332, y: 142 },
  { x: 298, y: 192 },
  { x: 238, y: 210 },
  { x: 168, y: 212 },
  { x: 98, y: 196 },
  { x: 46, y: 162 },
  { x: 26, y: 118 },
];

/** Interior shade trees scattered through the plantation. */
const FIELD_SHADE: Pt[] = [
  { x: 110, y: 78 },
  { x: 168, y: 62 },
  { x: 248, y: 76 },
  { x: 88, y: 128 },
  { x: 156, y: 118 },
  { x: 220, y: 138 },
  { x: 286, y: 128 },
  { x: 128, y: 168 },
  { x: 198, y: 178 },
  { x: 262, y: 172 },
];

function ShadeTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const r = 5.2 * scale;
  return (
    <g opacity="0.9">
      <ellipse cx={x + 0.6} cy={y + r * 0.55} rx={r * 0.75} ry={r * 0.28} fill="rgba(10,20,12,0.28)" />
      <circle cx={x} cy={y} r={r} fill="#1a4028" />
      <circle cx={x - r * 0.28} cy={y - r * 0.22} r={r * 0.55} fill="#2d6b45" />
      <circle cx={x + r * 0.22} cy={y - r * 0.1} r={r * 0.4} fill="#3d8658" />
    </g>
  );
}

export function EstateMapHero({ map }: { map: EstateMapData | null | undefined }) {
  const [view3d, setView3d] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const parcels = useMemo(() => (map ? parcelsFor(map.blocks) : []), [map]);

  if (!map) {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No estate map
      </div>
    );
  }

  const blocks = map.blocks;
  const many = blocks.length > 6;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#1a2e22] text-emerald-50 shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(120,160,90,0.25), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(60,90,50,0.3), transparent 45%)",
        }}
      />

      <div className="relative grid gap-4 p-5 lg:grid-cols-[1fr_220px] lg:p-6">
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200/60">
                Coffee plantation
              </p>
              <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                {map.name}
              </h2>
              <p className="text-xs text-emerald-100/55">
                {map.location || "Shade-grown Arabica estate"}
                {map.totalAreaHa != null ? ` · ${map.totalAreaHa} ha` : ""}
                {blocks.length ? ` · ${blocks.length} blocks` : ""}
              </p>
            </div>
            {blocks.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setView3d((v) => !v);
                  if (view3d) setFocusId(null);
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition",
                  view3d
                    ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-50"
                    : "border-white/15 bg-black/20 text-emerald-100/70 hover:bg-black/30",
                )}
              >
                {view3d ? "Flat view" : "3D view"}
              </button>
            ) : null}
          </div>

          {blocks.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center rounded-xl border border-white/10 bg-black/20 text-sm text-emerald-100/70">
              No blocks on this estate
            </div>
          ) : (
            <div
              className={cn(
                "relative cursor-pointer select-none [perspective:1100px]",
                view3d ? "pb-8 pt-2" : "",
              )}
              onClick={() => {
                setView3d((v) => !v);
                if (view3d) setFocusId(null);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setView3d((v) => !v);
                  if (view3d) setFocusId(null);
                }
              }}
              aria-pressed={view3d}
              aria-label={view3d ? "Switch to flat map view" : "Switch to 3D map view"}
            >
              <div
                className="origin-center will-change-transform"
                style={{
                  transform: view3d
                    ? "rotateX(54deg) rotateZ(-14deg) scale(1.06) translateY(8px)"
                    : "rotateX(0deg) rotateZ(0deg) scale(1) translateY(0)",
                  transition:
                    "transform 780ms cubic-bezier(0.22, 1, 0.36, 1), filter 780ms ease",
                  filter: view3d
                    ? "drop-shadow(0 28px 24px rgba(0,0,0,0.45))"
                    : "drop-shadow(0 6px 10px rgba(0,0,0,0.25))",
                  transformStyle: "preserve-3d",
                }}
              >
                <svg
                  viewBox="0 0 360 230"
                  className="w-full max-h-[320px]"
                  role="img"
                  aria-label={`${map.name} coffee plantation blocks`}
                >
                  <defs>
                    <linearGradient id="fillOk" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3d8f5a" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#1f5c38" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="fillWatch" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c4a035" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#8a6a18" stopOpacity="0.98" />
                    </linearGradient>
                    <linearGradient id="fillHot" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#c45a4a" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#8a2e28" stopOpacity="0.98" />
                    </linearGradient>
                    <linearGradient id="soilBed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a4a32" />
                      <stop offset="100%" stopColor="#2a3526" />
                    </linearGradient>
                    {/* Coffee bush rows — dark soil alleys + bush dots */}
                    <pattern
                      id="coffeeRows"
                      width="14"
                      height="11"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(28)"
                    >
                      <rect width="14" height="11" fill="rgba(28,40,26,0.22)" />
                      <line
                        x1="0"
                        y1="5.5"
                        x2="14"
                        y2="5.5"
                        stroke="rgba(12,28,16,0.35)"
                        strokeWidth="3.2"
                      />
                      <circle cx="2.5" cy="5.5" r="1.55" fill="rgba(22,70,40,0.75)" />
                      <circle cx="7" cy="5.2" r="1.7" fill="rgba(45,110,65,0.7)" />
                      <circle cx="11.5" cy="5.6" r="1.45" fill="rgba(28,85,48,0.72)" />
                      <circle cx="2.2" cy="5.1" r="0.55" fill="rgba(180,70,50,0.35)" />
                      <circle cx="7.3" cy="4.8" r="0.5" fill="rgba(200,90,55,0.3)" />
                    </pattern>
                    <pattern
                      id="coffeeRowsAlt"
                      width="14"
                      height="11"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(-18)"
                    >
                      <rect width="14" height="11" fill="rgba(28,40,26,0.18)" />
                      <line
                        x1="0"
                        y1="5.5"
                        x2="14"
                        y2="5.5"
                        stroke="rgba(12,28,16,0.3)"
                        strokeWidth="3"
                      />
                      <circle cx="3" cy="5.4" r="1.5" fill="rgba(30,80,45,0.7)" />
                      <circle cx="8" cy="5.6" r="1.65" fill="rgba(50,115,70,0.65)" />
                      <circle cx="12.2" cy="5.3" r="1.4" fill="rgba(25,75,42,0.7)" />
                    </pattern>
                    <filter id="parcelShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0.6"
                        dy="1.2"
                        stdDeviation="1.1"
                        floodColor="#0a120c"
                        floodOpacity="0.4"
                      />
                    </filter>
                    <clipPath id="estateClip">
                      <path d={OUTER_PATH} />
                    </clipPath>
                  </defs>

                  {/* Surrounding hillside scrub */}
                  <rect width="360" height="230" fill="#243028" />
                  <ellipse cx="40" cy="40" rx="55" ry="35" fill="rgba(35,55,38,0.45)" />
                  <ellipse cx="320" cy="200" rx="60" ry="40" fill="rgba(30,48,34,0.5)" />

                  {/* Ground plate under estate (3D) */}
                  <path
                    d={OUTER_PATH}
                    fill="#2a3a2e"
                    stroke="none"
                    style={{
                      transform: view3d ? "translate(6px, 14px)" : "translate(0, 0)",
                      transition: "transform 780ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    opacity={view3d ? 0.85 : 0}
                  />

                  {/* Soil bed under plantation */}
                  <path d={OUTER_PATH} fill="url(#soilBed)" stroke="none" />

                  <g clipPath="url(#estateClip)">
                    {/* Contour terraces typical of highland coffee */}
                    <path
                      d="M48 100 C100 78, 160 68, 220 78 C270 88, 310 110, 318 145"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M55 140 C110 120, 175 115, 240 132 C285 145, 315 165, 305 185"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />

                    {parcels.map(({ block, index, path, label }) => {
                      const fill = fillFor(block.health);
                      const side = sideFillFor(block.health);
                      const focused = focusId === block.id;
                      const lift = view3d ? (focused ? 18 : 8 + (index % 4) * 2) : 0;
                      const delay = `${index * 45}ms`;
                      const rowPattern = index % 2 === 0 ? "url(#coffeeRows)" : "url(#coffeeRowsAlt)";

                      return (
                        <g
                          key={block.id}
                          filter="url(#parcelShadow)"
                          style={{
                            transform: `translate(0px, ${-lift}px)`,
                            transition: `transform 720ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!view3d) {
                              setView3d(true);
                              setFocusId(block.id);
                              return;
                            }
                            setFocusId((id) => (id === block.id ? null : block.id));
                          }}
                        >
                          <title>
                            {`${block.code}${block.label ? ` · ${block.label}` : ""}${
                              block.areaHa != null ? ` · ${block.areaHa} ha` : ""
                            }${block.workOrderStatus ? ` · ${block.workOrderStatus}` : ""}`}
                          </title>

                          {view3d
                            ? [10, 7, 4].map((dy) => (
                                <path
                                  key={dy}
                                  d={path}
                                  fill={side}
                                  stroke="none"
                                  transform={`translate(2 ${dy})`}
                                  opacity={0.92}
                                />
                              ))
                            : null}

                          <path
                            d={path}
                            fill={fill}
                            stroke={focused ? "rgba(255,255,255,0.55)" : "rgba(210,230,190,0.32)"}
                            strokeWidth={focused ? 1.8 : 1.15}
                            strokeLinejoin="round"
                          />
                          <path d={path} fill={rowPattern} stroke="none" opacity="0.95" />
                        </g>
                      );
                    })}

                    {/* Shade trees over coffee rows */}
                    {FIELD_SHADE.map((t, i) => (
                      <ShadeTree key={`f-${i}`} x={t.x} y={t.y} scale={0.85 + (i % 3) * 0.12} />
                    ))}

                    {/* Farm access roads */}
                    <path
                      d="M28 115 C90 105, 145 125, 195 148 C250 170, 300 178, 338 158"
                      fill="none"
                      stroke="rgba(92,68,42,0.55)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 115 C90 105, 145 125, 195 148 C250 170, 300 178, 338 158"
                      fill="none"
                      stroke="rgba(168,132,88,0.4)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray="6 5"
                    />
                    <path
                      d="M175 28 C185 70, 188 110, 170 165 C160 190, 155 200, 150 208"
                      fill="none"
                      stroke="rgba(92,68,42,0.35)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* Drying patio */}
                    <g transform="translate(300 48)">
                      <rect
                        x="-14"
                        y="-8"
                        width="28"
                        height="16"
                        rx="1.5"
                        fill="rgba(210,195,160,0.55)"
                        stroke="rgba(120,100,70,0.5)"
                        strokeWidth="0.8"
                      />
                      <rect x="-11" y="-5" width="8" height="4" fill="rgba(180,90,50,0.35)" />
                      <rect x="-1" y="-5" width="8" height="4" fill="rgba(180,90,50,0.28)" />
                      <rect x="9" y="-5" width="5" height="4" fill="rgba(180,90,50,0.22)" />
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fill="rgba(236,245,225,0.55)"
                        fontSize="5.5"
                        fontWeight="600"
                      >
                        Patio
                      </text>
                    </g>

                    {/* Labels above plantation detail */}
                    {parcels.map(({ block, index, label }) => {
                      const name = shortName(block);
                      const codeSize = many ? 9 : 12;
                      const nameSize = many ? 7 : 8.5;
                      const focused = focusId === block.id;
                      const lift = view3d ? (focused ? 18 : 8 + (index % 4) * 2) : 0;
                      const delay = `${index * 45}ms`;
                      return (
                        <g
                          key={`lbl-${block.id}`}
                          pointerEvents="none"
                          style={{
                            transform: `translate(0px, ${-lift}px)`,
                            transition: `transform 720ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
                          }}
                        >
                          <text
                            x={label.x}
                            y={name ? label.y - 2 : label.y + 3}
                            textAnchor="middle"
                            fill="#f4f7ef"
                            fontSize={codeSize}
                            fontWeight="700"
                            style={{
                              paintOrder: "stroke",
                              stroke: "rgba(20,40,24,0.55)",
                              strokeWidth: 2.5,
                            }}
                          >
                            {block.code}
                          </text>
                          {name ? (
                            <text
                              x={label.x}
                              y={label.y + nameSize + 3}
                              textAnchor="middle"
                              fill="rgba(236,245,225,0.9)"
                              fontSize={nameSize}
                              style={{
                                paintOrder: "stroke",
                                stroke: "rgba(20,40,24,0.4)",
                                strokeWidth: 2,
                              }}
                            >
                              {name}
                            </text>
                          ) : block.workOrderStatus ? (
                            <text
                              x={label.x}
                              y={label.y + 12}
                              textAnchor="middle"
                              fill="rgba(236,245,225,0.75)"
                              fontSize="8"
                            >
                              {block.workOrderStatus}
                            </text>
                          ) : null}
                        </g>
                      );
                    })}
                  </g>

                  {/* Boundary berm */}
                  <path
                    d={OUTER_PATH}
                    fill="none"
                    stroke="rgba(55,40,28,0.4)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d={OUTER_PATH}
                    fill="none"
                    stroke="rgba(190,210,160,0.45)"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />

                  {/* Edge shade canopy */}
                  {EDGE_SHADE.map((t, i) => (
                    <ShadeTree key={`e-${i}`} x={t.x} y={t.y} scale={1 + (i % 2) * 0.15} />
                  ))}

                  <g transform="translate(328 28)">
                    <line
                      x1="0"
                      y1="14"
                      x2="0"
                      y2="0"
                      stroke="rgba(236,245,225,0.55)"
                      strokeWidth="1.2"
                    />
                    <polygon points="0,-2 3.5,6 -3.5,6" fill="rgba(236,245,225,0.7)" />
                    <text
                      x="0"
                      y="22"
                      textAnchor="middle"
                      fill="rgba(236,245,225,0.55)"
                      fontSize="7"
                      fontWeight="600"
                    >
                      N
                    </text>
                  </g>
                </svg>
              </div>

              <p className="pointer-events-none mt-2 text-center text-[10px] text-emerald-100/45">
                {view3d ? "Click map to flatten · click a block to raise it" : "Click map for 3D view"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200/60">
              Field climate
            </p>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold tabular-nums text-white">
                {map.climate.tempC.toFixed(1)}
              </span>
              <span className="text-sm text-emerald-100/65">°C</span>
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-100/55">Humidity</span>
                <span className="tabular-nums font-medium">{map.climate.humidityPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100/55">Rainfall</span>
                <span className="tabular-nums font-medium">{map.climate.rainfallMm} mm</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-emerald-100/55">Blocks</span>
                <span className="tabular-nums font-medium">{blocks.length}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-emerald-100/50">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#3d8f5a]" /> On track
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#c4a035]" /> Watch
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#c45a4a]" /> Hot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
