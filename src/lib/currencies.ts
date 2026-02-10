import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// CURRENCY CONFIGURATION
// ═══════════════════════════════════════════════════════════

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: Record<string, string>;
  rate: number;
  position: "before" | "after";
  decimals: number;
  active: boolean;
}

export const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  {
    code: "MAD",
    symbol: "DH",
    name: {
      fr: "Dirham Marocain",
      en: "Moroccan Dirham",
      es: "Dirham Marroquí",
      ar: "الدرهم المغربي",
    },
    rate: 1,
    position: "after",
    decimals: 2,
    active: true,
  },
  {
    code: "EUR",
    symbol: "€",
    name: {
      fr: "Euro",
      en: "Euro",
      es: "Euro",
      ar: "يورو",
    },
    rate: 0.091,
    position: "after",
    decimals: 2,
    active: true,
  },
  {
    code: "USD",
    symbol: "$",
    name: {
      fr: "Dollar Américain",
      en: "US Dollar",
      es: "Dólar Estadounidense",
      ar: "الدولار الأمريكي",
    },
    rate: 0.099,
    position: "before",
    decimals: 2,
    active: true,
  },
  {
    code: "GBP",
    symbol: "£",
    name: {
      fr: "Livre Sterling",
      en: "British Pound",
      es: "Libra Esterlina",
      ar: "الجنيه الإسترليني",
    },
    rate: 0.078,
    position: "before",
    decimals: 2,
    active: true,
  },
];

export const BASE_CURRENCY = "MAD";

// ═══════════════════════════════════════════════════════════
// HELPER: Get currencies with database overrides
// ═══════════════════════════════════════════════════════════

export async function getCurrencies(): Promise<{
  currencies: CurrencyConfig[];
  lastUpdated: Date | null;
}> {
  // Get currency rates from database
  const dbCurrencies = await prisma.currency.findMany();

  // Create a map for quick lookup
  const dbCurrencyMap = new Map(dbCurrencies.map((c) => [c.code, c]));

  // Merge defaults with database values
  const currencies = DEFAULT_CURRENCIES.map((currency) => {
    const dbCurrency = dbCurrencyMap.get(currency.code);
    if (dbCurrency) {
      return {
        ...currency,
        rate: Number(dbCurrency.rate),
        active: dbCurrency.isActive,
      };
    }
    return currency;
  });

  // Get last updated time
  let lastUpdated: Date | null = null;
  if (dbCurrencies.length > 0) {
    const firstCurrency = dbCurrencies[0];
    if (firstCurrency) {
      lastUpdated = dbCurrencies.reduce((latest, c) =>
        c.updatedAt > latest ? c.updatedAt : latest,
        firstCurrency.updatedAt
      );
    }
  }

  return { currencies, lastUpdated };
}

// ═══════════════════════════════════════════════════════════
// HELPER: Convert price between currencies
// ═══════════════════════════════════════════════════════════

export function convertPrice(
  priceMAD: number,
  targetCurrency: string,
  currencies: CurrencyConfig[]
): number {
  const currency = currencies.find((c) => c.code === targetCurrency);
  if (!currency) {
    return priceMAD; // Fallback to MAD if currency not found
  }
  return Number((priceMAD * currency.rate).toFixed(currency.decimals));
}

// ═══════════════════════════════════════════════════════════
// HELPER: Format price with currency symbol
// ═══════════════════════════════════════════════════════════

export function formatPrice(
  price: number,
  currencyCode: string,
  currencies: CurrencyConfig[]
): string {
  const currency = currencies.find((c) => c.code === currencyCode);
  if (!currency) {
    return `${price.toFixed(2)} DH`; // Fallback to MAD
  }

  const formattedPrice = price.toFixed(currency.decimals);

  if (currency.position === "before") {
    return `${currency.symbol}${formattedPrice}`;
  }
  return `${formattedPrice} ${currency.symbol}`;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get default config for a currency code
// ═══════════════════════════════════════════════════════════

export function getDefaultCurrencyConfig(code: string): CurrencyConfig | undefined {
  return DEFAULT_CURRENCIES.find((c) => c.code === code);
}
