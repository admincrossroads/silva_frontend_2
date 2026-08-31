import type { Afe, Afp, BudgetVsActualRow, FieldTicket, PaymentRequest, Settlement, Vendor, WorkOrder } from "@/types";
import type { BoardItem } from "@/components/items/types";
import { formatEtb, formatOptionalNumber } from "@/lib/utils/format";

function formatEtbAmount(amount: number | null | undefined) {
  const formatted = formatOptionalNumber(amount);
  return formatted === "—" ? formatted : formatEtb(amount);
}

export const VENDOR_COLUMNS = ["active", "pending", "expired", "terminated"] as const;
export const SETTLEMENT_COLUMNS = ["draft", "authorized", "settled"] as const;
export const BVA_HEALTH_COLUMNS = ["on_track", "watch", "over_budget"] as const;

export function afpToBoardItem(row: Afp): BoardItem {
  return {
    id: row.id,
    type: "afp",
    status: row.status,
    title: row.activity,
    subtitle: row.operatingDiscipline,
    href: `/planning/afp/${row.id}`,
    meta: [
      { label: "Year", value: String(row.year) },
      { label: "Budget", value: formatEtbAmount(row.budgetAllocatedEtb) },
    ],
    updatedAt: row.updatedAt,
  };
}

export function afeToBoardItem(row: Afe): BoardItem {
  return {
    id: row.id,
    type: "afe",
    status: row.status,
    title: row.description,
    subtitle: row.operatingDiscipline,
    href: `/planning/afe/${row.id}`,
    badge: row.band,
    meta: [{ label: "Est.", value: formatEtbAmount(row.estimatedCostEtb) }],
    updatedAt: row.updatedAt,
  };
}

export function workOrderToBoardItem(row: WorkOrder): BoardItem {
  return {
    id: row.id,
    type: "work_order",
    status: row.status,
    title: row.activity,
    subtitle: row.category,
    href: `/execution/work-orders/${row.id}`,
    meta: [
      { label: "Tier", value: row.tier },
      { label: "Weeks", value: `${row.weekStart}–${row.weekEnd}` },
    ],
    updatedAt: row.updatedAt,
  };
}

export function fieldTicketToBoardItem(row: FieldTicket): BoardItem {
  return {
    id: row.id,
    type: "field_ticket",
    status: row.status,
    title: row.activityRecorded,
    subtitle: row.ticketDate,
    href: `/execution/field-tickets/${row.id}`,
    meta: [
      { label: "Area", value: `${row.areaHa} ha` },
      { label: "Labor", value: String(row.laborCount) },
    ],
    updatedAt: row.updatedAt,
  };
}

export function paymentRequestToBoardItem(row: PaymentRequest): BoardItem {
  return {
    id: row.id,
    type: "payment_request",
    status: row.status,
    title: `${row.type} · ${row.id.slice(0, 8)}`,
    subtitle: row.workOrderId,
    href: `/payments/payment-requests/${row.id}`,
    meta: [{ label: "Amount", value: formatEtbAmount(row.amountRequestedEtb) }],
    updatedAt: row.updatedAt,
  };
}

export function vendorToBoardItem(row: Vendor): BoardItem {
  return {
    id: row.id,
    type: "vendor",
    status: row.status,
    title: row.name,
    subtitle: row.category.replace(/_/g, " "),
    href: `/vendors/${row.id}`,
    meta: [
      { label: "Prequalified", value: row.prequalified ? "Yes" : "No" },
      { label: "Insurance", value: row.insuranceOnFile ? "On file" : "None" },
    ],
    updatedAt: row.createdAt,
  };
}

export function settlementToBoardItem(row: Settlement): BoardItem {
  return {
    id: row.id,
    type: "settlement",
    status: row.status,
    title: row.payee,
    subtitle: row.type.replace(/_/g, " "),
    href: `/payments/settlements/${row.id}`,
    meta: [{ label: "Amount", value: formatEtbAmount(row.amountEtb) }],
    updatedAt: row.updatedAt,
  };
}

export function bvaToBoardItem(row: BudgetVsActualRow): BoardItem {
  return {
    id: row.afpLineId,
    type: "bva",
    status: row.health,
    title: row.activity,
    subtitle: `${row.utilizationPercent}% utilized`,
    href: `/planning/afp/${row.afpLineId}`,
    meta: [
      { label: "Budget", value: formatEtbAmount(row.budgetAllocatedEtb) },
      { label: "Planned", value: formatEtbAmount(row.plannedEtb ?? row.budgetAllocatedEtb) },
      { label: "Actual", value: formatEtbAmount(row.actualEtb) },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/** Valid single-step workflow transitions for drag-and-drop */
export const BOARD_TRANSITIONS: Record<string, Record<string, string>> = {
  work_order: {
    "draft:issued": "issue",
    "issued:in_progress": "start",
    "in_progress:complete": "complete",
    "complete:closed": "close",
  },
  afp: {
    "draft:submitted": "submit",
    "draft:approved": "approve",
    "submitted:approved": "approve",
    "approved:closed": "close",
  },
  afe: {
    "draft:submitted": "submit",
    "submitted:validated": "validate",
    "validated:approved": "approve",
  },
  field_ticket: {
    "draft:submitted": "submit",
    "submitted:vendor_reviewed": "review",
    "vendor_reviewed:validated": "validate",
  },
  settlement: {
    "draft:authorized": "authorize",
    "authorized:settled": "markSettled",
  },
};

export function boardTransitionKey(from: string, to: string) {
  return `${from}:${to}`;
}
