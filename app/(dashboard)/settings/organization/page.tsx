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
import { OrganizationBrandingForm } from "@/components/settings/organization-branding-form";
import { useAuth } from "@/hooks/use-auth";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Users, Building2, Plus } from "lucide-react";
import { ROLES, type RoleKey } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/types";

type OrgInvite = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

function orgTypeLabel(type: string | undefined) {
  switch (type) {
    case "silva":
      return "Asset owner";
    case "spx":
      return "Program manager";
    case "vendor":
      return "Execution vendor";
    default:
      return type?.replace(/_/g, " ") ?? "—";
  }
}

export default function OrganizationPage() {
  const { user, tenant } = useAuth();
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("spx_account_handler");
  const [inviteError, setInviteError] = useState("");
  const [memberError, setMemberError] = useState("");
  const role = user?.role as RoleKey | undefined;
  const isVendorAdmin = role === "vendor_admin";
  const isSystemAdmin = role === "system_admin";
  const isSpxPrincipal = role === "spx_principal";
  const isSilvaOwner = role === "silva_owner";
  const canManageMembers = isVendorAdmin || isSpxPrincipal;
  const canManageBranding = isVendorAdmin || isSpxPrincipal || isSilvaOwner || isSystemAdmin;

  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => platformApi.listUsers(),
  });

  const organizationId = user?.organizationId || tenant?.id;

  const invitesQuery = useQuery<OrgInvite[]>({
    queryKey: ["org-invites", organizationId],
    queryFn: () => platformApi.listInvites(organizationId!),
    enabled: Boolean(canManageMembers && organizationId),
  });

  const invite = useMutation({
    mutationFn: () => {
      if (!organizationId) throw new Error("Missing organization");
      return platformApi.createOrganizationInvite(organizationId, {
        email,
        role: inviteRole,
      });
    },
    meta: { successMessage: "Invite sent", errorMessage: "Invite failed" },
    onSuccess: () => {
      setInviteOpen(false);
      setEmail("");
      setInviteError("");
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["org-invites", user?.organizationId] });
    },
    onError: (err) => setInviteError(getApiErrorMessage(err, "Invite failed")),
  });

  const deactivateMember = useMutation({
    mutationFn: (memberId: string) => platformApi.deactivateUser(memberId),
    meta: { successMessage: "Access revoked", errorMessage: "Could not revoke access" },
    onSuccess: () => {
      setMemberError("");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => setMemberError(getApiErrorMessage(err, "Could not revoke access")),
  });

  const activateMember = useMutation({
    mutationFn: (memberId: string) => platformApi.activateUser(memberId),
    meta: { successMessage: "Access restored", errorMessage: "Could not restore access" },
    onSuccess: () => {
      setMemberError("");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => setMemberError(getApiErrorMessage(err, "Could not restore access")),
  });

  const revokeInvite = useMutation({
    mutationFn: (inviteId: string) => platformApi.revokeInvite(inviteId),
    meta: { successMessage: "Invitation revoked", errorMessage: "Could not revoke invitation" },
    onSuccess: () => {
      setMemberError("");
      qc.invalidateQueries({ queryKey: ["org-invites", user?.organizationId] });
    },
    onError: (err) => setMemberError(getApiErrorMessage(err, "Could not revoke invitation")),
  });

  const team = (usersQuery.data ?? []).filter((member) =>
    isVendorAdmin ? member.organizationId === user?.organizationId : true,
  );

  const pendingInvites = (invitesQuery.data ?? []).filter((inv) => inv.status === "pending");

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="font-display text-2xl text-foreground">
        {isVendorAdmin ? "Vendor team" : isSystemAdmin ? "Organization directory" : "Organization"}
      </h2>

      {canManageBranding ? <OrganizationBrandingForm /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Organization details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Display name</span>
            <span className="font-medium text-right">{tenant?.displayName ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Organization ID</span>
            <span className="font-mono text-xs">{user?.organizationId ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono text-xs">{tenant?.slug ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline">{orgTypeLabel(user?.organizationType)}</Badge>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Your role</span>
            <Badge>{role ? (ROLES[role] ?? role) : "—"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" /> {isVendorAdmin ? "Team members" : "Members"}
            </CardTitle>
            {canManageMembers ? (
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
        <CardContent className="space-y-6">
          {memberError ? <p className="text-sm text-destructive">{memberError}</p> : null}

          {usersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading members…</p>
          ) : team.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members in scope.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {canManageMembers ? <TableHead className="text-right">Actions</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => {
                  const isSelf = member.id === user?.id;
                  return (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="capitalize">{member.role.replaceAll("_", " ")}</TableCell>
                      <TableCell>
                        <Badge variant={member.active ? "default" : "secondary"}>
                          {member.active ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      {canManageMembers ? (
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground">You</span>
                          ) : member.active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={deactivateMember.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Revoke access for ${member.name || member.email}? They will be signed out immediately.`,
                                  )
                                ) {
                                  deactivateMember.mutate(member.id);
                                }
                              }}
                            >
                              Revoke access
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={activateMember.isPending}
                              onClick={() => activateMember.mutate(member.id)}
                            >
                              Restore access
                            </Button>
                          )}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {canManageMembers ? (
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold">Pending invitations</h3>
              {invitesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading invitations…</p>
              ) : pendingInvites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending invitations.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.email}</TableCell>
                        <TableCell className="capitalize">{inv.role.replaceAll("_", " ")}</TableCell>
                        <TableCell>{formatDate(inv.expiresAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={revokeInvite.isPending}
                            onClick={() => {
                              if (window.confirm(`Revoke the invitation sent to ${inv.email}?`)) {
                                revokeInvite.mutate(inv.id);
                              }
                            }}
                          >
                            Revoke invite
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite member">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
        >
          <Input
            id="inviteEmail"
            label="Email address"
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
          {inviteError ? <p className="text-sm text-destructive">{inviteError}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={invite.isPending || !email}>
              Send invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
