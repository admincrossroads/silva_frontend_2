import api from "../index";

export interface ActivityTemplate {
  id: string;
  code: string;
  name: string;
  category: string;
  tier: string;
  unitOfMeasure: string;
}

export interface ActivityMaster {
  id: string;
  programId: string;
  templateId?: string | null;
  code: string;
  name: string;
  laborNorm?: number | null;
  materialNorm?: number | null;
  serviceNorm?: number | null;
  version: number;
  template?: {
    id: string;
    code: string;
    name: string;
    category: string;
    unitOfMeasure: string;
  } | null;
}

export interface CreateActivityMasterDto {
  templateId?: string;
  code?: string;
  name?: string;
  laborNorm?: number | null;
  materialNorm?: number | null;
  serviceNorm?: number | null;
}

export const activityMasterApi = {
  listTemplates: () =>
    api.get<{ data: ActivityTemplate[] }>("/cropfort/activity-master/templates").then((r) => r.data.data),

  list: () => api.get<{ data: ActivityMaster[] }>("/cropfort/activity-master").then((r) => r.data.data),

  create: (dto: CreateActivityMasterDto) =>
    api.post<{ data: ActivityMaster }>("/cropfort/activity-master", dto).then((r) => r.data.data),

  update: (activityId: string, dto: Partial<CreateActivityMasterDto>) =>
    api.patch<{ data: ActivityMaster }>(`/cropfort/activity-master/${activityId}`, dto).then((r) => r.data.data),
};
