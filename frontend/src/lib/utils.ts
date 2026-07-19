import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently, resolving conflicts (e.g.
 * `cn("p-2", condition && "p-4")` correctly keeps only "p-4" when true,
 * rather than emitting both and leaving the cascade to decide).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
