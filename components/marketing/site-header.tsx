"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/spx-farm-logo";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  signedIn: boolean;
  /** True once the user has scrolled past the hero */
  scrolled?: boolean;
  /**
   * When false, hide the Cropfort mark/wordmark (hero already shows the brand).
   * Defaults to true so non-landing uses always show the logo.
   */
  showLogo?: boolean;
};

export function SiteHeader({ signedIn, scrolled = false, showLogo = true }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[hsl(165_30%_8%/0.92)] py-3 shadow-lg backdrop-blur-xl"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8 xl:max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-content-xl">
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          aria-hidden={!showLogo}
          tabIndex={showLogo ? undefined : -1}
          className={cn(
            "transition-all duration-300",
            showLogo
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          )}
        >
          <BrandLogo size="md" withWordmark showTagline={false} tone="inverse" />
        </Link>
        <nav className="flex items-center gap-1">
          <a
            href="#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white md:inline-block"
          >
            How it works
          </a>
          <a
            href="#contact"
            className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white md:inline-block"
          >
            Contact
          </a>
          <a
            href="#flow"
            className="hidden rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white lg:inline-block"
          >
            The flow
          </a>
          {signedIn ? (
            <Button asChild size="sm" className="ml-1 rounded-xl bg-white px-4 text-[hsl(165_32%_12%)] hover:bg-white/90">
              <Link href="/dashboard">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/** True after the user scrolls past most of the landing hero */
export function useLandingScroll() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const threshold = Math.max(120, window.innerHeight * 0.65);
      setScrolled(window.scrollY > threshold);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scrolled;
}
