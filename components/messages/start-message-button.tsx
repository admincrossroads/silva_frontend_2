"use client";

import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

export type MessageEntityType =
  | "afp_line"
  | "afe"
  | "work_order"
  | "work_plan_submission"
  | "field_ticket"
  | "payment_request"
  | "owner_settlement"
  | "ad_hoc_request"
  | "farm_estate";

type Props = {
  entityType: MessageEntityType;
  entityId: string;
  /** Prefills subject, e.g. activity name */
  label?: string;
  className?: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "secondary" | "default";
};

function canUseMessages(role: string) {
  return (
    role.startsWith("spx_") ||
    role.startsWith("silva_") ||
    role === "vendor_admin" ||
    role === "vendor_manager" ||
    role === "vendor_supervisor" ||
    role === "vendor_field_lead" ||
    role === "system_admin"
  );
}

export function StartMessageButton({
  entityType,
  entityId,
  label,
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const { role } = useRole();
  if (!canUseMessages(role) || !entityId) return null;

  const params = new URLSearchParams({
    compose: "1",
    entityType,
    entityId,
  });
  if (label) params.set("subject", label.slice(0, 120));

  return (
    <Button variant={variant} size={size} className={cn(className)} asChild>
      <Link href={`/messages?${params.toString()}`}>
        <MessagesSquare className="mr-2 h-4 w-4" />
        Message
      </Link>
    </Button>
  );
}
