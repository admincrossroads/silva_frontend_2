"use client";

import Link from "next/link";
import { ArrowRight, Building2, Layers, Shield, User, Users, MapPin, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLES, type RoleKey } from "@/lib/utils/constants";

function QuickLink({
  title,
  href,
  icon: Icon,
}: {
  title: string;
  href: string;
  icon: typeof User;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-colors hover:border-primary/30 hover:bg-primary/5">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SettingsOverviewPage() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role as RoleKey;

  if (role === "system_admin") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Scope</p><p className="text-2xl font-bold">Platform</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Organizations</p><p className="text-2xl font-bold">All</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Users</p><p className="text-2xl font-bold">All orgs</p></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink title="Organization directory" href="/settings/organization" icon={Building2} />
          <QuickLink title="Programs" href="/settings/programs" icon={Layers} />
          <QuickLink title="Registrations" href="/settings/registrations" icon={ClipboardCheck} />
          <QuickLink title="Farm estates" href="/settings/farm-estates" icon={MapPin} />
          <QuickLink title="Profile" href="/settings/profile" icon={User} />
        </div>
      </div>
    );
  }

  if (role === "spx_principal") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Governance</p><p className="text-2xl font-bold">Schedule 3</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Partners</p><p className="text-2xl font-bold">Vendors</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Users</p><p className="text-2xl font-bold">SPX scope</p></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink title="Organization" href="/settings/organization" icon={Building2} />
          <QuickLink title="Programs" href="/settings/programs" icon={Layers} />
          <QuickLink title="Registrations" href="/settings/registrations" icon={ClipboardCheck} />
          <QuickLink title="Contact inbox" href="/settings/contact" icon={ClipboardCheck} />
          <QuickLink title="Configuration" href="/settings/config" icon={Shield} />
          <QuickLink title="Farm estates" href="/settings/farm-estates" icon={MapPin} />
          <QuickLink title="Spend bands" href="/settings/governance/bands" icon={Shield} />
          <QuickLink title="Schedule 3 RACI" href="/settings/governance/raci" icon={Shield} />
          <QuickLink title="Profile" href="/settings/profile" icon={User} />
        </div>
      </div>
    );
  }

  if (role === "vendor_admin") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-muted-foreground">Vendor organization</p>
              <p className="font-mono text-xs">{user.organizationId}</p>
              <Badge>{ROLES[role]}</Badge>
            </CardContent>
          </Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Team admin</p><p className="text-2xl font-bold">Invite & manage</p></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <QuickLink title="Team directory" href="/settings/organization" icon={Users} />
          <QuickLink title="Profile" href="/settings/profile" icon={User} />
        </div>
      </div>
    );
  }

  if (role.startsWith("silva_")) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Silva organization</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge>{ROLES[role]}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Organization</span><span className="font-mono text-xs">{user.organizationId}</span></div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {role === "silva_owner" ? (
            <>
              <QuickLink title="Organization" href="/settings/organization" icon={Building2} />
              <QuickLink title="Programs" href="/settings/programs" icon={Layers} />
            </>
          ) : null}
          <QuickLink title="Spend bands" href="/settings/governance/bands" icon={Shield} />
          <QuickLink title="Profile" href="/settings/profile" icon={User} />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Account settings</CardTitle></CardHeader>
      <CardContent>
        <QuickLink title="Profile" href="/settings/profile" icon={User} />
      </CardContent>
    </Card>
  );
}
