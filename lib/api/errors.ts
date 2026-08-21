import type { AxiosError } from "axios";

type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown[] };
  requestId?: string;
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.error?.message ?? fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.error?.code;
}
