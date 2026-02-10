import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type CurrencyCode = "MAD" | "EUR" | "USD" | "GBP";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from MAD (1 MAD = X currency)
  locale: string; // For Intl.NumberFormat
  position: "before" | "after"; // Symbol position
  decimals: number; // Decimal places to show
}

export interface FormatOptions {
  showSymbol?: boolean;
  decimals?: number;
  compact?: boolean;
}

interface CurrencyState {
  currency: CurrencyCode;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCurrency: (code: CurrencyCode) => void;

  // Convert amount from MAD to selected currency
  convert: (amountInMAD: number) => number;

  // Format amount with currency symbol
  format: (amountInMAD: number, options?: FormatOptions) => string;

  // Get current currency details
  getCurrency: () => Currency;

  // Legacy aliases for backward compatibility
  currentCurrency: CurrencyCode;
  convertPrice: (priceMAD: number) => number;
  formatPrice: (priceMAD: number, showSymbol?: boolean) => string;
}

// ═══════════════════════════════════════════════════════════
// CURRENCIES DATA
// ═══════════════════════════════════════════════════════════

export const currencies: Record<CurrencyCode, Currency> = {
  MAD: {
    code: "MAD",
    symbol: "DH",
    name: "Moroccan Dirham",
    rate: 1,
    locale: "fr-MA",
    position: "after",
    decimals: 0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.092, // 1 MAD ≈ 0.092 EUR
    locale: "fr-FR",
    position: "after",
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 0.099, // 1 MAD ≈ 0.099 USD
    locale: "en-US",
    position: "before",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rate: 0.079, // 1 MAD ≈ 0.079 GBP
    locale: "en-GB",
    position: "before",
    decimals: 2,
  },
};

// Array of currencies for iteration
export const currencyList = Object.values(currencies);

// ═══════════════════════════════════════════════════════════
// CURRENCY STORE
// ═══════════════════════════════════════════════════════════

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "MAD",
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Legacy alias
      get currentCurrency() {
        return get().currency;
      },

      setCurrency: (code) => set({ currency: code }),

      getCurrency: () => {
        const { currency } = get();
        return currencies[currency];
      },

      convert: (amountInMAD) => {
        const { currency } = get();
        const rate = currencies[currency].rate;
        return amountInMAD * rate;
      },

      // Legacy alias
      convertPrice: (priceMAD) => {
        return get().convert(priceMAD);
      },

      format: (amountInMAD, options = {}) => {
        const { currency } = get();
        const { showSymbol = true, decimals, compact = false } = options;

        const converted = get().convert(amountInMAD);
        const currencyInfo = currencies[currency];
        const decimalPlaces = decimals ?? currencyInfo.decimals;

        if (compact) {
          const formatter = new Intl.NumberFormat(currencyInfo.locale, {
            style: showSymbol ? "currency" : "decimal",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
            notation: "compact",
          });
          return formatter.format(converted);
        }

        const formatted = new Intl.NumberFormat(currencyInfo.locale, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(converted);

        if (!showSymbol) return formatted;

        return currencyInfo.position === "before"
          ? `${currencyInfo.symbol}${formatted}`
          : `${formatted} ${currencyInfo.symbol}`;
      },

      // Legacy alias
      formatPrice: (priceMAD, showSymbol = true) => {
        return get().format(priceMAD, { showSymbol });
      },
    }),
    {
      name: "le-tatche-bois-currency",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currency: state.currency }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ═══════════════════════════════════════════════════════════
// SSR-SAFE HOOKS
// ═══════════════════════════════════════════════════════════

/**
 * SSR-safe hook for currency store with additional utilities
 * Returns default MAD currency until client-side hydration is complete
 */
export function useCurrency() {
  const [isClient, setIsClient] = useState(false);
  const store = useCurrencyStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return default MAD during SSR to prevent hydration mismatch
  const effectiveCurrency = isClient ? store.currency : "MAD";

  return {
    ...store,
    currency: effectiveCurrency,
    currencyInfo: currencies[effectiveCurrency],
    allCurrencies: currencyList,
    isHydrated: isClient,
  };
}
