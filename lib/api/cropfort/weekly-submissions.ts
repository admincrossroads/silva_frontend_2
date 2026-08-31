import api from "../index";

export type WeeklySubmissionStatus = "pending" | "submitted" | "validated" | "released";

export interface ValidationCheck {
  id: string;
  checkType: string;
  result: "pass" | "fail" | "flag" | "resolved";
  isHardBlock: boolean;
  note?: string | null;
  resolvedAt?: string | null;
}

export interface WeeklySubmission {
  id: string;
  programId: string;
  weekEnding: string;
  status: WeeklySubmissionStatus;
  submittedAt?: string | null;
  releasedAt?: string | null;
  ticketCount: number;
  tickets?: Array<{
    id: string;
    blockCode?: string;
    activityCode?: string;
    activityName?: string;
    status: string;
    actualQty: number;
  }>;
  checks?: ValidationCheck[];
}

export const weeklySubmissionsApi = {
  list: (params?: { status?: string; weekEnding?: string }) =>
    api.get<{ data: WeeklySubmission[] }>("/cropfort/weekly-submissions", { params }).then((r) => r.data.data),

  getQueue: () =>
    api.get<{ data: WeeklySubmission[] }>("/cropfort/weekly-submissions/queue").then((r) => r.data.data),

  getByWeek: (weekEnding: string) =>
    api.get<{ data: WeeklySubmission }>(`/cropfort/weekly-submissions/${weekEnding}`).then((r) => r.data.data),

  submitWeek: (weekEnding: string, ticketIds: string[]) =>
    api
      .post<{ data: WeeklySubmission }>(`/cropfort/weekly-submissions/${weekEnding}/submit`, { ticketIds })
      .then((r) => r.data.data),

  validateWeek: (weekEnding: string) =>
    api
      .post<{ data: WeeklySubmission }>(`/cropfort/weekly-submissions/${weekEnding}/validate`)
      .then((r) => r.data.data),

  releaseWeek: (weekEnding: string) =>
    api
      .post<{ data: WeeklySubmission }>(`/cropfort/weekly-submissions/${weekEnding}/release`)
      .then((r) => r.data.data),
};
