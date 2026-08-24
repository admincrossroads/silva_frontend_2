"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Soft overlay — keep images visible (not a solid green wash). */
const HERO_GRADIENT =
  "linear-gradient(160deg, hsl(165 34% 7% / 0.55) 0%, hsl(165 28% 10% / 0.28) 42%, hsl(155 30% 8% / 0.62) 100%)";

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
                ? "opacity-100 blur-[2.5px] animate-[landing-drift_40s_ease-in-out_infinite_alternate]"
                : "opacity-0 blur-xl scale-110",
            )}
            style={{
              backgroundImage: `${HERO_GRADIENT}, url(${image.src})`,
              backgroundPosition: image.position,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
