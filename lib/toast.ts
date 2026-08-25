import { toast as sonnerToast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/errors";

/**
 * App toast helpers — use these instead of importing sonner directly.
 *
 * @example
 * toast.success("Work plan accepted");
 * toast.error(err, "Could not save");
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, description ? { description } : undefined),

  error: (error: unknown, fallback = "Something went wrong") =>
    sonnerToast.error(getApiErrorMessage(error, fallback)),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, description ? { description } : undefined),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, description ? { description } : undefined),

  message: (message: string, description?: string) =>
    sonnerToast.message(message, description ? { description } : undefined),

  promise: sonnerToast.promise,
};
