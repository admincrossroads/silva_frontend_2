"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/spx-farm-logo";
import { cf } from "@/lib/config/cropfort-brand";
import { siteConfig } from "@/lib/config/site";

type Props = {
  signedIn?: boolean;
};

export function CropfortFooter({ signedIn = false }: Props) {
  return (
    <footer className="border-t" style={{ borderColor: cf.border, backgroundColor: cf.forest }}>
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <BrandLogo size="sm" withWordmark showTagline={false} tone="inverse" />
            <p className="mt-4 text-sm leading-relaxed text-white/65">{siteConfig.description}</p>
            <p className="mt-3 text-xs font-medium text-white/45">A product of {siteConfig.company}</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a href="#contact" className="text-sm text-white/75 transition hover:text-white">
              Contact
            </a>
            {signedIn ? (
              <Link href="/dashboard" className="text-sm text-white/75 transition hover:text-white">
                Open workspace
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-white/75 transition hover:text-white">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <p
          className="mt-10 border-t pt-6 text-center text-xs text-white/45 sm:text-left"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
