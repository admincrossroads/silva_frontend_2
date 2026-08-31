"use client";

import { useEffect, useState } from "react";
import { HERO_IMAGES } from "@/lib/config/cropfort-brand";
import { cn } from "@/lib/utils";

const ROTATE_MS = 14000;
const FADE_MS = 2000;

export function CropfortHeroCarousel() {
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
    <div className="absolute inset-0 overflow-hidden bg-[#12372A]" aria-hidden>
      {HERO_IMAGES.map((image, index) => {
        const isActive = index === activeIndex;
        return (
          <img
            key={image.src}
            src={image.src}
            alt=""
            className={cn(
              "hero-ken-burns absolute inset-0 h-full w-full scale-105 object-cover transition-[opacity,transform,filter] ease-in-out",
              isActive
                ? "opacity-100 animate-[landing-drift_42s_ease-in-out_infinite_alternate]"
                : "opacity-0 scale-110 blur-sm",
            )}
            style={{
              objectPosition: image.position,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        );
      })}

    </div>
  );
}
