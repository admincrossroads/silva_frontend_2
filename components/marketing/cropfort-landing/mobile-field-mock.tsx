"use client";

import { useState } from "react";
import { Camera, Check, MapPin, Play } from "lucide-react";
import { cf, FIELD_IMAGE } from "@/lib/config/cropfort-brand";

type Phase = "idle" | "active" | "complete";

export function MobileFieldMock() {
  const [phase, setPhase] = useState<Phase>("idle");

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="relative overflow-hidden rounded-2xl">
        <img src={FIELD_IMAGE} alt="Field supervisor" className="aspect-[4/5] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12372A]/80 via-transparent to-transparent" />
        <p className="absolute bottom-6 left-6 right-6 text-sm text-white/80">
          Supervisors and crews use CropFort in the field — large targets, minimal typing, GPS-aware.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xs">
        <div className="rounded-[2rem] border-8 border-[#17201B] bg-[#17201B] p-1 shadow-2xl">
          <div className="overflow-hidden rounded-[1.4rem] bg-white">
            <div className="px-4 py-3 text-center text-[10px] font-medium" style={{ color: cf.muted }}>
              CropFort Field
            </div>
            <div className="px-5 pb-6 pt-2">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: cf.muted }}>
                Today&apos;s Work
              </p>
              <h3 className="mt-1 text-xl font-semibold" style={{ color: cf.text }}>
                Coffee Pruning
              </h3>
              <p className="text-sm font-medium" style={{ color: cf.green }}>
                Block A-12
              </p>

              <div className="mt-5 space-y-3 rounded-xl p-4" style={{ backgroundColor: cf.bg }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: cf.muted }}>Target</span>
                  <span className="font-semibold" style={{ color: cf.text }}>
                    8.4 hectares
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: cf.muted }}>Crew</span>
                  <span className="font-semibold" style={{ color: cf.text }}>
                    24 workers
                  </span>
                </div>
              </div>

              {phase === "idle" ? (
                <button
                  type="button"
                  onClick={() => setPhase("active")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white"
                  style={{ backgroundColor: cf.forest }}
                >
                  <Play className="h-5 w-5" />
                  START WORK
                </button>
              ) : null}

              {phase === "active" || phase === "complete" ? (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: `${cf.sage}22`, color: cf.green }}>
                    <MapPin className="h-4 w-4" />
                    GPS Verified ✓
                  </div>
                  <p className="text-center text-sm font-medium" style={{ color: cf.earth }}>
                    Work In Progress
                  </p>
                  <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium" style={{ borderColor: cf.border }}>
                    <Camera className="h-4 w-4" />
                    Capture Photo
                  </button>
                  {phase === "active" ? (
                    <button
                      type="button"
                      onClick={() => setPhase("complete")}
                      className="w-full rounded-xl py-4 text-base font-semibold text-white"
                      style={{ backgroundColor: cf.green }}
                    >
                      COMPLETE WORK
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white" style={{ backgroundColor: cf.sage }}>
                      <Check className="h-5 w-5" />
                      Submitted for verification
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
