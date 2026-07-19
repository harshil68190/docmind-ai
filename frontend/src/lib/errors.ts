import { isAxiosError } from "axios";

/**
 * The backend returns errors in two different shapes depending on where
 * they came from:
 *  - Domain exceptions (`core/exceptions.py`):        { detail: string }
 *  - Pydantic validation errors (422):                { detail: [{ msg, loc, ... }] }
 * This normalizes both into a single string so every form in the app can
 * display errors the same way without knowing which shape it got.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (typeof first.msg === "string") return first.msg;
    }
  }
  return fallback;
}
