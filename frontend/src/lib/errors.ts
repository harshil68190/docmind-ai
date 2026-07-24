import { isAxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(error)) {
    // Backend unavailable
    if (!error.response) {
      return "Unable to connect to the AI backend.";
    }

    if ([502, 503, 504].includes(error.response.status)) {
      return "The AI backend is currently unavailable.";
    }

    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (typeof first.msg === "string") return first.msg;
    }
  }

  return fallback;
}