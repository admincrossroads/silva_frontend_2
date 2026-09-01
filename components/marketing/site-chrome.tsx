"use client";

import { usePathname } from "next/navigation";
import { SiteChatbot } from "@/components/marketing/site-chatbot";

const PUBLIC_PREFIXES = ["/", "/login", "/register", "/activate", "/forgot-password", "/reset-password"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)));
}

/** Site-wide marketing chrome: assistant on public pages. */
export function SiteChrome() {
  const pathname = usePathname() || "/";
  const showChat = isPublicPath(pathname);

  return <>{showChat ? <SiteChatbot /> : null}</>;
}
