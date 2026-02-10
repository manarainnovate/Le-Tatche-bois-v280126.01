"use client";

import { useLocale } from "next-intl";

export type Direction = "ltr" | "rtl";

const RTL_LOCALES = ["ar", "he", "fa", "ur"];

/**
 * Hook to get the current text direction based on locale
 */
export function useDirection(): Direction {
  const locale = useLocale();
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/**
 * Hook to check if current locale is RTL
 */
export function useIsRTL(): boolean {
  const direction = useDirection();
  return direction === "rtl";
}

/**
 * Utility function to get direction from locale string
 * Can be used in server components
 */
export function getDirection(locale: string): Direction {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}
