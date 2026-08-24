"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useVendorLocale } from "@/hooks/use-vendor-locale";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { isVendor, t, locale, setLocale } = useVendorLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar name={user?.name ?? "User"} src={user?.avatar} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">{isVendor ? t("menu.profile") : "Profile"}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">{isVendor ? t("menu.settings") : "Settings"}</Link>
        </DropdownMenuItem>
        {isVendor ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocale(locale === "am" ? "en" : "am")}>
              {locale === "am" ? t("lang.english") : t("lang.amharic")}
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          {isVendor ? t("menu.logout") : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
