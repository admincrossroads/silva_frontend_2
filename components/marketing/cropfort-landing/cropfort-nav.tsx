"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/spx-farm-logo";
import { cf } from "@/lib/config/cropfort-brand";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Contact", href: "#contact" },
];

type Props = {
  signedIn: boolean;
  heroMode?: boolean;
};

export function CropfortNav({ signedIn, heroMode = true }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !heroMode;
  const lightOnHero = heroMode && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b bg-white/95 py-3 shadow-sm backdrop-blur-xl"
          : "bg-gradient-to-b from-black/50 to-transparent py-5",
      )}
      style={solid ? { borderColor: cf.border } : undefined}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <BrandLogo
            size="md"
            withWordmark
            showTagline={false}
            tone={lightOnHero ? "inverse" : "default"}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                lightOnHero
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-[#66736B] hover:text-[#17201B]",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {signedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: cf.forest }}
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition",
                  lightOnHero ? "text-white/90 hover:text-white" : "text-[#17201B]",
                )}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn("rounded-lg p-2 lg:hidden", lightOnHero ? "text-white" : "text-[#17201B]")}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t bg-white px-5 py-4 lg:hidden" style={{ borderColor: cf.border }}>
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-[#17201B]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <hr className="my-2" style={{ borderColor: cf.border }} />
            {signedIn ? (
              <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: cf.forest }}>
                Open workspace
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-3 py-2.5 text-sm font-medium">
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
