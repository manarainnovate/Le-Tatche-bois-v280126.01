import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency, CurrencyRate } from "@/types";

interface CurrencyStore {
  currentCurrency: Currency;
  currencies: CurrencyRate[];
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceMAD: number) => number;
  formatPrice: (priceMAD: number) => string;
}

const defaultCurrencies: CurrencyRate[] = [
  { code: "MAD", symbol: "DH", name: "Dirham Marocain", rate: 1, position: "after" },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.091, position: "after" },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.099, position: "before" },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.078, position: "before" },
];

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currentCurrency: "MAD",
      currencies: defaultCurrencies,
      setCurrency: (currency) => set({ currentCurrency: currency }),
      convertPrice: (priceMAD) => {
        const { currentCurrency, currencies } = get();
        const currency = currencies.find((c) => c.code === currentCurrency);
        return priceMAD * (currency?.rate ?? 1);
      },
      formatPrice: (priceMAD) => {
        const { currentCurrency, currencies } = get();
        const currency = currencies.find((c) => c.code === currentCurrency);
        if (!currency) return `${priceMAD} DH`;
        const converted = priceMAD * currency.rate;
        const formatted = converted.toFixed(2);
        return currency.position === "before"
          ? `${currency.symbol}${formatted}`
          : `${formatted} ${currency.symbol}`;
      },
    }),
    { name: "letatche-currency" }
  )
);
