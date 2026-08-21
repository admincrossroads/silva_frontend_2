"use client";

import Link from "next/link";
import { Coffee, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "./breadcrumb";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { ProgramSwitcher } from "./program-switcher";
import { useAuth } from "@/hooks/use-auth";

export function TopNav() {
  const { tenant, activeProgram } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center border-b bg-background/95 backdrop-blur-sm px-4 gap-4">
      <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
          <Coffee className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="hidden lg:block text-xs font-medium text-foreground truncate max-w-[120px]">
          {tenant?.displayName || "Coffee Field OS"}
        </span>
      </Link>

      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2">
        <ProgramSwitcher />
        {activeProgram && (
          <span className="hidden xl:inline text-2xs text-muted-foreground truncate max-w-[100px]">
            {activeProgram.name}
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-muted-foreground gap-1.5 hidden sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-1 flex items-center gap-0.5 rounded border bg-muted px-1 py-0.5 text-2xs text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </Button>
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
