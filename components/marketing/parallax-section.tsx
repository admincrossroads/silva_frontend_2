"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ParallaxSectionProps = {
  imageUrl: string;
  gradient: string;
  backgroundPosition?: string;
  className?: string;
  children: ReactNode;
};

export function ParallaxSection({
  imageUrl,
  gradient,
  backgroundPosition = "center",
  className = "",
  children,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      setOffsetY((scrollProgress - 0.5) * 120);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute -inset-y-16 inset-x-0 scale-110 will-change-transform"
        style={{
          backgroundImage: `${gradient}, url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition,
          transform: `translate3d(0, ${offsetY}px, 0)`,
          transition: "transform 0.1s linear",
        }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
