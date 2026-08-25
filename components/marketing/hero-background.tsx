"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Soft wash — enough contrast for copy, photos stay visible */
const HERO_GRADIENT =
  "linear-gradient(105deg, hsl(165 34% 6% / 0.58) 0%, hsl(165 30% 8% / 0.32) 42%, hsl(165 28% 10% / 0.12) 72%, transparent 100%), linear-gradient(180deg, hsl(165 32% 6% / 0.28) 0%, transparent 40%, hsl(165 30% 5% / 0.48) 100%)";

/** Light vignette on the photo plane */
const HERO_SHADOW =
  "radial-gradient(ellipse 80% 65% at 20% 72%, hsl(165 40% 4% / 0.28) 0%, transparent 55%)";

/** Coffee farm / plantation / beans — not café lifestyle shots */
const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1597816792530-f6d57bd2bf9e?auto=format&fit=crop&w=2400&q=80",
    position: "center 40%",
    label: "Ripe coffee cherries",
  },
  {
    src: "https://images.unsplash.com/photo-1642613630414-1d9938f4fe02?auto=format&fit=crop&w=2400&q=80",
    position: "center 35%",
    label: "Harvest on the farm",
  },
  {
    src: "https://images.unsplash.com/photo-1653007574493-edad758220d8?auto=format&fit=crop&w=2400&q=80",
    position: "center 45%",
    label: "Estate hillside",
  },
  {
    src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=2400&q=80",
    position: "center 50%",
    label: "Coffee beans",
  },
  {
    src: "https://images.unsplash.com/photo-1649039999826-7e125f996907?auto=format&fit=crop&w=2400&q=80",
    position: "center 40%",
    label: "Farm landscape",
  },
] as const;

const ROTATE_MS = 16000;
const FADE_MS = 4000;

export function HeroBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[hsl(165_30%_8%)]" aria-hidden>
      {HERO_IMAGES.map((image, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={image.src}
            className={cn(
              "absolute inset-0 scale-105 bg-cover bg-no-repeat transition-[opacity,filter,transform] ease-in-out",
              isActive
                ? "opacity-100 blur-[1.5px] animate-[landing-drift_40s_ease-in-out_infinite_alternate]"
                : "opacity-0 blur-xl scale-110",
            )}
            style={{
              backgroundImage: `${HERO_GRADIENT}, ${HERO_SHADOW}, url(${image.src})`,
              backgroundPosition: image.position,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        );
      })}
      {/* Light left/bottom shadow for text contrast */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, hsl(165 35% 4% / 0.28) 0%, transparent 48%), linear-gradient(to top, hsl(165 32% 4% / 0.4) 0%, transparent 42%)",
          boxShadow: "inset 0 0 80px 16px hsl(165 40% 3% / 0.2)",
        }}
      />
    </div>
  );
}
