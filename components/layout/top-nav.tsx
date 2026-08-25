"use client";

import { Menu } from "lucide-react";
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
import { siteConfig } from "@/lib/config/site";

export function TopNav() {
  const { setMobileNavOpen } = useAppShell();
  const { activeFarmEstate } = useActiveFarmEstate();

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b bg-background/95 shadow-sm backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 xl:h-16 xl:px-6 2xl:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 md:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-0 flex-1 md:block">
          <Breadcrumb />
        </div>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-medium text-foreground">
            {activeFarmEstate?.name || siteConfig.name}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <div className="hidden items-center gap-2 lg:flex">
            <FarmEstateSwitcher />
            <ProgramSwitcher />
          </div>
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      {/* Mobile / tablet scope controls — farm + program stay reachable below md/lg */}
      <div className="flex items-center gap-2 overflow-x-auto border-t px-3 py-2 lg:hidden">
        <FarmEstateSwitcher compact />
        <ProgramSwitcher compact />
      </div>
    </header>
  );
}
