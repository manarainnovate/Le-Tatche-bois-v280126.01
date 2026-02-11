"use client";

import { useEffect } from "react";
import { useCurrencyStore, type CurrencyCode } from "@/stores/currency";
import { COOKIES, isValidCurrency } from "@/lib/geo-detection";

// ═══════════════════════════════════════════════════════════
// Currency Initializer - Auto-set currency on first visit
// ═══════════════════════════════════════════════════════════

/**
 * Component that initializes currency based on auto-detection or manual choice
 * Should be rendered once in the root layout
 */
export function CurrencyInitializer() {
  const { setCurrency, currency } = useCurrencyStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Check if user has a MANUAL currency choice in localStorage
    const manualCurrency = localStorage.getItem("manual-currency-choice");
    if (manualCurrency && isValidCurrency(manualCurrency)) {
      // User manually chose a currency — highest priority, don't override
      if (currency !== manualCurrency) {
        setCurrency(manualCurrency as CurrencyCode);
      }
      return;
    }

    // Check for auto-detected currency from middleware cookie
    const cookies = document.cookie.split("; ");
    const autoDetectedCookie = cookies.find((c) =>
      c.startsWith(`${COOKIES.AUTO_DETECTED_CURRENCY}=`)
    );

    if (autoDetectedCookie) {
      const autoDetectedCurrency = autoDetectedCookie.split("=")[1];
      if (autoDetectedCurrency && isValidCurrency(autoDetectedCurrency)) {
        // Auto-detected currency exists and is valid
        if (currency !== autoDetectedCurrency) {
          setCurrency(autoDetectedCurrency as CurrencyCode);
        }
      }
    }
    // If no auto-detected currency, keep the default MAD from the store
  }, [currency, setCurrency]);

  // This component doesn't render anything
  return null;
}
