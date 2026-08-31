import api from "./index";

export const inviteApi = {
  preview: (inviteId: string, token: string) =>
    api
      .get<{ data: { email: string; orgName: string; role: string; expiresAt: string } }>(
        `/invites/${inviteId}/preview`,
        { params: { token } },
      )
      .then((r) => r.data.data),

  accept: (inviteId: string, body: { token: string; name: string; password: string }) =>
    api
      .post<{ data: { accessToken: string; refreshToken: string; user: unknown } }>(
        `/invites/${inviteId}/accept`,
        body,
      )
      .then((r) => r.data.data),
};
