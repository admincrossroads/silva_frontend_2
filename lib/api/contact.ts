import api from "./index";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  message: string;
  status: "new" | "read";
  createdAt: string;
  updatedAt: string;
};

export type ContactSubmitDto = {
  name: string;
  email: string;
  organization?: string;
  subject: string;
  message: string;
};

export const contactApi = {
  submit: (dto: ContactSubmitDto) =>
    api.post<{ data: { id: string; message: string } }>("/contact", dto).then((r) => r.data.data),

  list: (params?: { status?: string; q?: string; page?: number; pageSize?: number }) =>
    api.get<{ data: ContactSubmission[]; meta?: unknown }>("/contact", { params }).then((r) => ({
      items: r.data.data,
      meta: r.data.meta,
    })),

  markRead: (id: string) =>
    api.post<{ data: ContactSubmission }>(`/contact/${id}/read`, {}).then((r) => r.data.data),
};
