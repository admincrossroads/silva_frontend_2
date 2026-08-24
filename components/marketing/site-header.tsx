"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  signedIn: boolean;
  scrolled?: boolean;
};

export function SiteHeader({ signedIn, scrolled = false }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[hsl(165_30%_8%/0.92)] py-3 shadow-lg backdrop-blur-xl"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(152_50%_32%/0.55)] ring-1 ring-[hsl(152_55%_55%/0.4)]">
            <Coffee className="h-4 w-4 text-[hsl(152_70%_78%)]" />
          </span>
          <span className="font-display text-lg tracking-tight text-white sm:text-xl">Coffee Field OS</span>
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
              <Button asChild size="sm" className="rounded-xl bg-white px-4 text-[hsl(165_32%_12%)] hover:bg-white/90">
                <Link href="/register">Apply for access</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function useLandingScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}
