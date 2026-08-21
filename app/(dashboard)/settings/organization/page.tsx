"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Users, Building2, Plus } from "lucide-react";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import type { User } from "@/types";

export default function OrganizationPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("spx_account_handler");
  const [inviteError, setInviteError] = useState("");
  const role = user?.role as RoleKey | undefined;
  const isVendorAdmin = role === "vendor_admin";
  const isSystemAdmin = role === "system_admin";
  const isSpxPrincipal = role === "spx_principal";
  const canInvite = isVendorAdmin || isSpxPrincipal;

  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => platformApi.listUsers(),
  });

  const invite = useMutation({
    mutationFn: () => {
      if (!user?.organizationId) throw new Error("Missing organization");
      return platformApi.createOrganizationInvite(user.organizationId, {
        email,
        role: inviteRole,
      });
    },
    onSuccess: () => {
      setInviteOpen(false);
      setEmail("");
      setInviteError("");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => setInviteError(getApiErrorMessage(err, "Invite failed")),
  });

  const team = (usersQuery.data ?? []).filter((member) =>
    isVendorAdmin ? member.organizationId === user?.organizationId : true,
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <section className="space-y-1">
        <h2 className="font-display text-2xl text-foreground">
          {isVendorAdmin ? "Vendor team" : isSystemAdmin ? "Organization directory" : "Organization"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isVendorAdmin && "Invite and manage users in your vendor organization."}
          {isSystemAdmin && "All Silva, SPX, and vendor organizations in the platform."}
          {isSpxPrincipal && "SPX and partner organization administration."}
          {role === "silva_owner" && "Silva organization profile and membership."}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Organization Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Organization ID</span>
            <span className="font-mono text-xs">{user?.organizationId ?? "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <Badge>{user?.organizationType ?? "—"}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your role</span>
            <Badge>{role ? (ROLES[role] ?? role) : "—"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> {isVendorAdmin ? "Team members" : "Members"}
            </CardTitle>
            {canInvite ? (
              <Button
                size="sm"
                onClick={() => {
                  setInviteRole(isVendorAdmin ? "vendor_field_lead" : "spx_account_handler");
                  setInviteOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Invite
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading members...</p>
          ) : team.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members in scope.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="capitalize">{member.role.replaceAll("_", " ")}</TableCell>
                    <TableCell>{member.active ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
        >
          <Input
            id="inviteEmail"
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            id="inviteRole"
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            {isVendorAdmin ? (
              <>
                <option value="vendor_field_lead">Field Lead</option>
                <option value="vendor_supervisor">Supervisor</option>
                <option value="vendor_worker">Worker</option>
              </>
            ) : (
              <>
                <option value="spx_account_handler">SPX Account Handler</option>
                <option value="spx_field_supervisor">SPX Field Supervisor</option>
                <option value="vendor_admin">Vendor Admin</option>
              </>
            )}
          </Select>
          {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={invite.isPending || !email}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
