import api from "../index";

export type FieldWorkIntensity = "peak" | "active" | "light";
export type FieldWorkCommercialStatus = "confirmed" | "elective" | "quoted";
export type CropfortLineStatus = "draft" | "submitted" | "approved" | "returned";

export type FieldWorkMonthLabel = {
  monthIndex: number;
  monthLabel: string;
  yearSlice: number;
};

export type FieldWorkCalendarCell = {
  id?: string;
  monthIndex: number;
  intensity: FieldWorkIntensity;
};

export type FieldWorkCalendarRow = {
  id?: string;
  activityId?: string | null;
  activityCode: string;
  activityName: string;
  tier: string;
  category: string;
  commercialStatus: FieldWorkCommercialStatus;
  annualFeeEtb?: number | null;
  sortOrder?: number;
  notes?: string | null;
  cells: FieldWorkCalendarCell[];
};

export type FieldWorkCalendar = {
  id: string;
  farmEstateId: string;
  termStartDate: string | null;
  status: CropfortLineStatus;
  version: number;
  returnedComment?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  monthLabels: FieldWorkMonthLabel[];
  rows: FieldWorkCalendarRow[];
};

export type FeeScheduleLine = {
  id?: string;
  label: string;
  annualFee?: number | null;
  activationMonth?: number | null;
  deferred?: boolean;
};

export type FeeScheduleRollupMonth = {
  monthIndex: number;
  monthLabel: string;
  confirmedFeeEtb: number;
  electiveFeeEtb: number;
  feeEtb: number;
  cumulativeFeeEtb: number;
};

export type FeeSchedule = {
  id: string;
  farmEstateId: string;
  confirmedAnnualFee: number;
  status: CropfortLineStatus;
  version: number;
  lines: FeeScheduleLine[];
  monthlyRollup: FeeScheduleRollupMonth[];
};

export type FeeScheduleUpsert = {
  confirmedAnnualFee: number;
  lines?: FeeScheduleLine[];
};

export type FieldWorkCalendarUpsert = {
  rows?: FieldWorkCalendarRow[];
};

export const fieldWorkCalendarApi = {
  get: (farmId: string) =>
    api
      .get<{ data: FieldWorkCalendar | null }>(`/cropfort/farms/${farmId}/field-work-calendar`)
      .then((r) => r.data.data),

  upsert: (farmId: string, body: FieldWorkCalendarUpsert) =>
    api
      .put<{ data: FieldWorkCalendar }>(`/cropfort/farms/${farmId}/field-work-calendar`, body)
      .then((r) => r.data.data),

  seed: (farmId: string) =>
    api
      .post<{ data: FieldWorkCalendar }>(`/cropfort/farms/${farmId}/field-work-calendar/seed`, {})
      .then((r) => r.data.data),

  submit: (farmId: string) =>
    api
      .post<{ data: FieldWorkCalendar }>(`/cropfort/farms/${farmId}/field-work-calendar/submit`, {})
      .then((r) => r.data.data),

  approve: (farmId: string) =>
    api
      .post<{ data: FieldWorkCalendar }>(`/cropfort/farms/${farmId}/field-work-calendar/approve`, {})
      .then((r) => r.data.data),

  returnCalendar: (farmId: string, comment?: string) =>
    api
      .post<{ data: FieldWorkCalendar }>(`/cropfort/farms/${farmId}/field-work-calendar/return`, {
        comment,
      })
      .then((r) => r.data.data),
};

export const feeScheduleApi = {
  get: (farmId: string) =>
    api
      .get<{ data: FeeSchedule | null }>(`/cropfort/farms/${farmId}/fee-schedule`)
      .then((r) => r.data.data),

  upsert: (farmId: string, body: FeeScheduleUpsert) =>
    api
      .put<{ data: FeeSchedule }>(`/cropfort/farms/${farmId}/fee-schedule`, body)
      .then((r) => r.data.data),

  submit: (farmId: string) =>
    api
      .post<{ data: FeeSchedule }>(`/cropfort/farms/${farmId}/fee-schedule/submit`, {})
      .then((r) => r.data.data),

  approve: (farmId: string) =>
    api
      .post<{ data: FeeSchedule }>(`/cropfort/farms/${farmId}/fee-schedule/approve`, {})
      .then((r) => r.data.data),
};
