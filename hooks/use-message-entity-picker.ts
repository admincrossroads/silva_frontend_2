import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { afpApi } from "@/lib/api/afp";
import { afeApi } from "@/lib/api/afe";
import { workOrderApi } from "@/lib/api/work-orders";
import { fieldTicketApi } from "@/lib/api/field-tickets";
import { paymentRequestApi } from "@/lib/api/payment-requests";
import { settlementApi } from "@/lib/api/settlements";
import { adHocRequestsApi, type AdHocRequest } from "@/lib/api/ad-hoc-requests";
import { workPlansApi, type WorkPlanSubmission } from "@/lib/api/work-plans";
import { farmEstatesApi, type FarmEstate } from "@/lib/api/farm-estates";
import type { MessageEntityType } from "@/components/messages/start-message-button";
import type { Afp, Afe, WorkOrder, FieldTicket, PaymentRequest, Settlement } from "@/types";

export type MessageEntityPickerOption = {
  id: string;
  label: string;
  subjectHint: string;
};

const PICKER_PAGE_SIZE = 200;

function statusSuffix(status: string) {
  return status.replace(/_/g, " ");
}

export function useMessageEntityPickerOptions(entityType: string, enabled: boolean) {
  const listEnabled = enabled && Boolean(entityType);

  const afps = useQuery({
    queryKey: ["afps", "message-picker"],
    queryFn: () => afpApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "afp_line",
  });
  const afes = useQuery({
    queryKey: ["afes", "message-picker"],
    queryFn: () => afeApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "afe",
  });
  const workOrders = useQuery({
    queryKey: ["work-orders", "message-picker"],
    queryFn: () => workOrderApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "work_order",
  });
  const fieldTickets = useQuery({
    queryKey: ["field-tickets", "message-picker"],
    queryFn: () => fieldTicketApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "field_ticket",
  });
  const workPlans = useQuery({
    queryKey: ["work-plans", "message-picker"],
    queryFn: () => workPlansApi.list(),
    enabled: listEnabled && entityType === "work_plan_submission",
  });
  const adHoc = useQuery({
    queryKey: ["ad-hoc-requests", "message-picker"],
    queryFn: () => adHocRequestsApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "ad_hoc_request",
  });
  const paymentRequests = useQuery({
    queryKey: ["payment-requests", "message-picker"],
    queryFn: () => paymentRequestApi.findAll({ pageSize: PICKER_PAGE_SIZE }),
    enabled: listEnabled && entityType === "payment_request",
  });
  const settlements = useQuery({
    queryKey: ["settlements", "message-picker"],
    queryFn: () => settlementApi.findAll({ pageSize: PICKER_PAGE_SIZE }) as Promise<Settlement[]>,
    enabled: listEnabled && entityType === "owner_settlement",
  });
  const farmEstates = useQuery({
    queryKey: ["farm-estates", "message-picker"],
    queryFn: () => farmEstatesApi.list({}) as Promise<FarmEstate[]>,
    enabled: listEnabled && entityType === "farm_estate",
  });

  const activeQuery = useMemo(() => {
    switch (entityType as MessageEntityType) {
      case "afp_line":
        return afps;
      case "afe":
        return afes;
      case "work_order":
        return workOrders;
      case "field_ticket":
        return fieldTickets;
      case "work_plan_submission":
        return workPlans;
      case "ad_hoc_request":
        return adHoc;
      case "payment_request":
        return paymentRequests;
      case "owner_settlement":
        return settlements;
      case "farm_estate":
        return farmEstates;
      default:
        return null;
    }
  }, [
    entityType,
    afps,
    afes,
    workOrders,
    fieldTickets,
    workPlans,
    adHoc,
    paymentRequests,
    settlements,
    farmEstates,
  ]);

  const options = useMemo((): MessageEntityPickerOption[] => {
    switch (entityType as MessageEntityType) {
      case "afp_line":
        return (afps.data ?? []).map((row: Afp) => ({
          id: row.id,
          label: `${row.year} · ${row.activity} · ${row.operatingDiscipline}`,
          subjectHint: `${row.activity} (${row.year})`,
        }));
      case "afe":
        return (afes.data ?? []).map((row: Afe) => ({
          id: row.id,
          label: `${row.description.slice(0, 48)}${row.description.length > 48 ? "…" : ""} · Band ${row.band}`,
          subjectHint: row.description.slice(0, 120),
        }));
      case "work_order":
        return (workOrders.data ?? []).map((row: WorkOrder) => ({
          id: row.id,
          label: `${row.activity} · W${row.weekStart}–${row.weekEnd} · ${statusSuffix(row.status)}`,
          subjectHint: `${row.activity} (WO W${row.weekStart}–${row.weekEnd})`,
        }));
      case "field_ticket":
        return (fieldTickets.data ?? []).map((row: FieldTicket) => ({
          id: row.id,
          label: `${row.activityRecorded} · ${row.ticketDate} · ${statusSuffix(row.status)}`,
          subjectHint: row.activityRecorded,
        }));
      case "work_plan_submission":
        return (workPlans.data ?? []).map((row: WorkPlanSubmission) => ({
          id: row.id,
          label: `${row.farmName || "Work plan"} · ${row.budgetYearLabel} · ${statusSuffix(row.status)}`,
          subjectHint: row.farmName ? `Work plan — ${row.farmName}` : "Work plan",
        }));
      case "ad_hoc_request":
        return (adHoc.data ?? []).map((row: AdHocRequest) => ({
          id: row.id,
          label: `${row.title} · ${statusSuffix(row.status)}`,
          subjectHint: row.title,
        }));
      case "payment_request":
        return (paymentRequests.data ?? []).map((row: PaymentRequest) => ({
          id: row.id,
          label: `${row.type} · ${row.amountRequestedEtb.toLocaleString()} ETB · ${statusSuffix(row.status)}`,
          subjectHint: `Payment request — ${row.amountRequestedEtb.toLocaleString()} ETB`,
        }));
      case "owner_settlement":
        return (settlements.data ?? []).map((row: Settlement) => ({
          id: row.id,
          label: `${row.payee} · ${row.amountEtb.toLocaleString()} ETB · ${statusSuffix(row.status)}`,
          subjectHint: `Settlement — ${row.payee}`,
        }));
      case "farm_estate":
        return (farmEstates.data ?? []).map((row: FarmEstate) => ({
          id: row.id,
          label: row.name,
          subjectHint: row.name,
        }));
      default:
        return [];
    }
  }, [
    entityType,
    afps.data,
    afes.data,
    workOrders.data,
    fieldTickets.data,
    workPlans.data,
    adHoc.data,
    paymentRequests.data,
    settlements.data,
    farmEstates.data,
  ]);

  return {
    options,
    isLoading: activeQuery?.isLoading ?? false,
    isError: activeQuery?.isError ?? false,
  };
}

export const MESSAGE_ENTITY_TYPE_OPTIONS: Array<{
  value: MessageEntityType;
  label: string;
  roles: "all" | "spx_silva" | "execution";
}> = [
  { value: "afp_line", label: "AFP line", roles: "spx_silva" },
  { value: "afe", label: "AFE", roles: "spx_silva" },
  { value: "work_order", label: "Work order", roles: "all" },
  { value: "field_ticket", label: "Field ticket", roles: "execution" },
  { value: "work_plan_submission", label: "Work plan", roles: "execution" },
  { value: "ad_hoc_request", label: "Core operation", roles: "all" },
  { value: "farm_estate", label: "Farm estate", roles: "spx_silva" },
  { value: "payment_request", label: "Payment request", roles: "execution" },
  { value: "owner_settlement", label: "Settlement", roles: "spx_silva" },
];

export function messageEntityTypesForRole(isSpx: boolean, isSilva: boolean, isVendor: boolean) {
  if (isSpx) return MESSAGE_ENTITY_TYPE_OPTIONS;
  return MESSAGE_ENTITY_TYPE_OPTIONS.filter((opt) => {
    if (opt.roles === "all") return true;
    if (opt.roles === "spx_silva") return isSilva;
    if (opt.roles === "execution") return isVendor;
    return true;
  });
}
