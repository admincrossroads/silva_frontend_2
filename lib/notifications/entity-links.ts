const TRIGGER_LABELS: Record<string, string> = {
  wo_issued: "Work order issued",
  wo_started: "Work order started",
  wo_completed: "Work order completed",
  wo_closed: "Work order closed",
  ft_submitted: "Field ticket submitted",
  ft_vendor_reviewed: "Field ticket reviewed",
  ft_validated: "Field ticket validated",
  ft_rejected: "Field ticket rejected",
  pr_submitted: "Payment request submitted",
  pr_verified: "Payment request verified",
  pr_rejected: "Payment request rejected",
  pr_settled: "Payment settled",
  settlement_created: "Settlement created",
  settlement_authorized: "Settlement authorized",
  settlement_settled: "Settlement completed",
  afp_submitted: "AFP submitted",
  afp_approved: "AFP approved",
  afe_submitted: "AFE submitted",
  afe_pending: "AFE pending approval",
  afe_approved: "AFE approved",
  afe_rejected: "AFE rejected",
  report_generated: "Report draft generated",
  report_released: "Report released",
  workplan_submitted: "Work plan submitted",
  workplan_revision_requested: "Work plan revision requested",
  workplan_accepted: "Work plan accepted",
  workplan_rejected: "Work plan rejected",
  budget_watch: "Budget watch",
  budget_over: "Budget over",
  insurance_expiring: "Insurance expiring",
  registration_submitted: "Registration submitted",
  contact_received: "Contact message received",
};

export function notificationTriggerLabel(triggerType: string) {
  return TRIGGER_LABELS[triggerType] ?? triggerType.replace(/_/g, " ");
}

export function notificationEntityHref(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "afp_line":
      return `/planning/afp/${entityId}`;
    case "afe":
      return `/planning/afe/${entityId}`;
    case "work_order":
      return `/execution/work-orders/${entityId}`;
    case "field_ticket":
      return `/execution/field-tickets/${entityId}`;
    case "payment_request":
      return `/payments/payment-requests/${entityId}`;
    case "owner_settlement":
      return `/payments/settlements/${entityId}`;
    case "report":
      return `/reports/${entityId}`;
    case "work_plan_submission":
      return `/execution/work-plans/${entityId}`;
    case "registration_request":
      return "/settings/registrations";
    case "contact_submission":
      return "/settings/contact";
    default:
      return null;
  }
}

export function notificationEntityLabel(entityType: string) {
  switch (entityType) {
    case "afp_line":
      return "AFP";
    case "afe":
      return "AFE";
    case "work_order":
      return "Work order";
    case "field_ticket":
      return "Field ticket";
    case "payment_request":
      return "Payment request";
    case "owner_settlement":
      return "Settlement";
    case "report":
      return "Report";
    case "work_plan_submission":
      return "Work plan";
    case "registration_request":
      return "Registration";
    case "contact_submission":
      return "Contact message";
    default:
      return entityType.replace(/_/g, " ");
  }
}
