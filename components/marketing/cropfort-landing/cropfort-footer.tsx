"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/spx-farm-logo";
import { cf } from "@/lib/config/cropfort-brand";
import { siteConfig } from "@/lib/config/site";

const EXPLORE_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Contact", href: "#contact" },
] as const;

const WORKFLOW_LINKS = [
  { label: "Budget (AFP)", href: "#workflow" },
  { label: "Commitments (AFE)", href: "#workflow" },
  { label: "Core operations", href: "#workflow" },
  { label: "Field execution", href: "#workflow" },
  { label: "Reporting", href: "#workflow" },
] as const;

type Props = {
  signedIn?: boolean;
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  const className = "text-sm text-white/70 transition hover:text-white";

  if (isExternal || href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

export function CropfortFooter({ signedIn = false }: Props) {
  return (
    <footer style={{ backgroundColor: cf.forest }}>
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo size="sm" withWordmark showTagline={false} tone="inverse" />
            <p className="mt-4 text-xs font-medium text-white/40">
              {siteConfig.company} · {siteConfig.tagline}
            </p>
          </div>

          <FooterColumn title="Explore">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Workflow">
            {WORKFLOW_LINKS.map((link) => (
              <li key={link.label}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Account">
            <li>
              {signedIn ? (
                <FooterLink href="/dashboard">Open workspace</FooterLink>
              ) : (
                <FooterLink href="/login">Sign in</FooterLink>
              )}
            </li>
            {!signedIn ? (
              <li>
                <FooterLink href="#contact">Request access</FooterLink>
              </li>
            ) : null}
            <li>
              <FooterLink href="#contact">Talk to our team</FooterLink>
            </li>
          </FooterColumn>
        </div>

        <div
          className="mt-12 border-t pt-8 text-xs text-white/40"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
