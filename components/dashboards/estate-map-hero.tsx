"use client";

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

/** Irregular Chetu-style estate outline — not an oval. */
const OUTER_PATH =
  "M38 78 L72 34 L140 20 L205 18 L265 38 L315 72 L338 120 L330 168 L285 198 L210 212 L135 208 L70 185 L32 148 L20 108 L26 88 Z";

/**
 * Six parcels that tessellate the outer profile (shared edges + boundary).
 * Layout roughly: A B C / D E F with organic cuts like a coffee estate.
 */
const BLOCK_PATHS: Record<string, string> = {
  A: "M38 78 L72 34 L140 20 L148 78 L100 108 L55 112 Z",
  B: "M140 20 L205 18 L265 38 L248 88 L190 82 L148 78 Z",
  C: "M265 38 L315 72 L338 120 L305 128 L260 108 L248 88 Z",
  D: "M26 88 L38 78 L55 112 L100 108 L108 155 L70 185 L32 148 L20 108 Z",
  E: "M100 108 L148 78 L190 82 L248 88 L260 108 L245 155 L185 175 L125 168 L108 155 Z",
  F: "M260 108 L305 128 L338 120 L330 168 L285 198 L210 212 L185 175 L245 155 Z",
};

const LABEL_AT: Record<string, { x: number; y: number }> = {
  A: { x: 92, y: 70 },
  B: { x: 198, y: 54 },
  C: { x: 292, y: 88 },
  D: { x: 62, y: 138 },
  E: { x: 178, y: 128 },
  F: { x: 278, y: 162 },
};

function fillFor(health: string) {
  if (health === "watch") return "url(#fillWatch)";
  if (health === "overdue" || health === "over_budget") return "url(#fillHot)";
  return "url(#fillOk)";
}

export function EstateMapHero({ map }: { map: EstateMapData | null | undefined }) {
  if (!map) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-8 text-sm text-muted-foreground">
        No farm estate map available for this program yet.
      </div>
    );
  }

  const blocks = map.blocks.length
    ? map.blocks
    : ["A", "B", "C", "D", "E", "F"].map((code) => ({
        id: code,
        code,
        label: `Block ${code}`,
        areaHa: null,
        workOrderId: null,
        workOrderStatus: null,
        activity: null,
        health: "on_track",
      }));

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 text-emerald-50 shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="relative grid gap-4 p-5 lg:grid-cols-[1fr_220px] lg:p-6">
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200/70">
                Estate overview
              </p>
              <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                {map.name}
              </h2>
              <p className="text-xs text-emerald-100/60">
                {map.location || "Program estate"}
                {map.totalAreaHa != null ? ` · ${map.totalAreaHa} ha` : ""}
              </p>
            </div>
          </div>

          <svg viewBox="0 0 360 230" className="w-full max-h-[300px]" role="img" aria-label={`${map.name} blocks`}>
            <defs>
              <linearGradient id="fillOk" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.88" />
              </linearGradient>
              <linearGradient id="fillWatch" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="fillHot" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0.85" />
              </linearGradient>
              <pattern id="rowHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(236,253,245,0.12)" strokeWidth="1.2" />
              </pattern>
              <clipPath id="estateClip">
                <path d={OUTER_PATH} />
              </clipPath>
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <ellipse cx="180" cy="120" rx="168" ry="102" fill="rgba(6,78,59,0.18)" />
            <path d={OUTER_PATH} fill="rgba(6,95,70,0.35)" stroke="none" />

            <g clipPath="url(#estateClip)">
              {blocks.map((b) => {
                const pathKey = String(b.code || "A").charAt(0).toUpperCase();
                const path = BLOCK_PATHS[pathKey] || BLOCK_PATHS.A;
                const label = LABEL_AT[pathKey] || LABEL_AT.A;
                return (
                  <g key={b.id} className="opacity-95 transition-opacity hover:opacity-100">
                    <path
                      d={path}
                      fill={fillFor(b.health)}
                      stroke="rgba(236,253,245,0.5)"
                      strokeWidth="1.35"
                      strokeLinejoin="round"
                      filter="url(#softGlow)"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.9;1;0.9"
                        dur="5s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <path d={path} fill="url(#rowHatch)" stroke="none" />
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      className="fill-white"
                      fontSize="15"
                      fontWeight="700"
                    >
                      {b.code}
                    </text>
                    <text
                      x={label.x}
                      y={label.y + 14}
                      textAnchor="middle"
                      fill="rgba(236,253,245,0.82)"
                      fontSize="9"
                    >
                      {b.workOrderStatus || "idle"}
                    </text>
                  </g>
                );
              })}
            </g>

            <path
              d={OUTER_PATH}
              fill="none"
              stroke="rgba(167,243,208,0.7)"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M22 115 C70 108, 120 122, 175 138 C230 154, 280 168, 332 160"
              fill="none"
              stroke="rgba(15,23,42,0.35)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M22 115 C70 108, 120 122, 175 138 C230 154, 280 168, 332 160"
              fill="none"
              stroke="rgba(226,232,240,0.28)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray="3 5"
            />
          </svg>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200/70">
              Field climate
            </p>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold tabular-nums text-white">
                {map.climate.tempC.toFixed(1)}
              </span>
              <span className="text-sm text-emerald-100/70">°C</span>
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-100/60">Humidity</span>
                <span className="tabular-nums font-medium">{map.climate.humidityPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100/60">Rainfall</span>
                <span className="tabular-nums font-medium">{map.climate.rainfallMm} mm</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-100/50">
            Block tint reflects SPX-issued work only — not raw vendor tickets.
          </p>
        </div>
      </div>
    </div>
  );
}
