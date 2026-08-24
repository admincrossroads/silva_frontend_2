"use client";

import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "./breadcrumb";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { ProgramSwitcher } from "./program-switcher";
import { FarmEstateSwitcher } from "./farm-estate-switcher";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useAppShell } from "./app-shell-context";
import { useActiveFarmEstate } from "@/hooks/use-active-farm-estate";

export function TopNav() {
  const { setMobileNavOpen } = useAppShell();
  const { activeFarmEstate } = useActiveFarmEstate();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 shadow-sm backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden min-w-0 flex-1 md:block">
        <Breadcrumb />
      </div>

      <div className="flex min-w-0 flex-1 items-center md:hidden">
        <p className="truncate text-sm font-medium text-foreground">
          {activeFarmEstate?.name || "Coffee Field OS"}
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <FarmEstateSwitcher />
          <ProgramSwitcher />
        </div>
        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />
        <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden" asChild>
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
