import { twMerge } from "tailwind-merge";

export type ClassValue = string | false | null | undefined;

/* tailwind-merge resolves conflicting utilities, so a caller's class wins over
 * a variant's. The site has no platform checks, so it skips clsx. */
export function cn(...values: ClassValue[]): string {
    return twMerge(values.filter(Boolean).join(" "));
}
