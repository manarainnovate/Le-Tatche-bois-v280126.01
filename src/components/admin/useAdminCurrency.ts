"use client";

import { useCurrency } from "@/stores/currency";

/**
 * Hook for formatting currency in admin pages
 * Uses the global currency store to format amounts
 *
 * @example
 * const { formatCurrency, currency, symbol } = useAdminCurrency();
 * <span>{formatCurrency(1000)}</span> // "1,000 DH" or "$99.00" etc.
 */
export function useAdminCurrency() {
  const { format, currency, currencyInfo, setCurrency, isHydrated } = useCurrency();

  return {
    // Format an amount (in MAD) to the selected currency
    formatCurrency: format,
    // Current currency code
    currency,
    // Currency symbol
    symbol: currencyInfo.symbol,
    // Set currency
    setCurrency,
    // Whether the store has hydrated (for SSR)
    isHydrated,
    // Currency info object
    currencyInfo,
  };
}

export default useAdminCurrency;
