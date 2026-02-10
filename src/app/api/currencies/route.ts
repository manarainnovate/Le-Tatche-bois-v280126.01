import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  withAuth,
  handleApiError,
  getLocaleFromHeaders,
} from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CURRENCY CONFIGURATION
// ═══════════════════════════════════════════════════════════

interface CurrencyConfig {
  code: string;
  symbol: string;
  name: Record<string, string>;
  rate: number;
  position: "before" | "after";
  decimals: number;
  active: boolean;
}

const DEFAULT_CURRENCIES: CurrencyConfig[] = [
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

const BASE_CURRENCY = "MAD";

// ═══════════════════════════════════════════════════════════
// Validation schema for batch update
// ═══════════════════════════════════════════════════════════

const updateCurrenciesSchema = z.object({
  currencies: z.array(
    z.object({
      code: z.string().length(3, "Currency code must be 3 characters"),
      rate: z.number().positive("Rate must be positive"),
      active: z.boolean().optional(),
    })
  ),
});

// ═══════════════════════════════════════════════════════════
// HELPER: Get currencies with database overrides
// ═══════════════════════════════════════════════════════════

async function getCurrencies(): Promise<{
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
// GET /api/currencies - Public list of currencies
// ═══════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);
    const { currencies, lastUpdated } = await getCurrencies();

    // Format response with localized names
    const formattedCurrencies = currencies
      .filter((c) => c.active)
      .map((currency) => ({
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name[locale] ?? currency.name.fr,
        rate: currency.rate,
        position: currency.position,
        decimals: currency.decimals,
        active: currency.active,
        isBase: currency.code === BASE_CURRENCY,
      }));

    return apiSuccess({
      currencies: formattedCurrencies,
      baseCurrency: BASE_CURRENCY,
      lastUpdated: lastUpdated?.toISOString() ?? new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "Currencies GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/currencies - Admin update rates
// ═══════════════════════════════════════════════════════════

export const PUT = withAuth(
  async (req) => {
    try {
      const body: unknown = await req.json();
      const result = updateCurrenciesSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const { currencies } = result.data;

      // Validate currency codes
      const validCodes = DEFAULT_CURRENCIES.map((c) => c.code);
      const invalidCodes = currencies
        .map((c) => c.code)
        .filter((code) => !validCodes.includes(code));

      if (invalidCodes.length > 0) {
        return apiError(`Invalid currency codes: ${invalidCodes.join(", ")}`, 400);
      }

      // Don't allow changing base currency rate
      const baseUpdate = currencies.find((c) => c.code === BASE_CURRENCY);
      if (baseUpdate && baseUpdate.rate !== 1) {
        return apiError(`Cannot change ${BASE_CURRENCY} rate. It must remain 1.`, 400);
      }

      // Update currencies in database
      // Get default currency config for additional fields
      const getDefaultConfig = (code: string) =>
        DEFAULT_CURRENCIES.find((c) => c.code === code);

      const operations = currencies.map((currency) => {
        const defaultConfig = getDefaultConfig(currency.code);
        return prisma.currency.upsert({
          where: { code: currency.code },
          update: {
            rate: currency.rate,
            isActive: currency.active ?? true,
            updatedAt: new Date(),
          },
          create: {
            code: currency.code,
            symbol: defaultConfig?.symbol ?? currency.code,
            name: defaultConfig?.name.en ?? currency.code,
            rate: currency.rate,
            locale: "fr-MA",
            position: defaultConfig?.position ?? "after",
            isDefault: currency.code === BASE_CURRENCY,
            isActive: currency.active ?? true,
          },
        });
      });

      await prisma.$transaction(operations);

      // Return updated currencies
      const locale = getLocaleFromHeaders(req.headers);
      const { currencies: updatedCurrencies, lastUpdated } = await getCurrencies();

      const formattedCurrencies = updatedCurrencies.map((currency) => ({
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name[locale] ?? currency.name.fr,
        rate: currency.rate,
        position: currency.position,
        decimals: currency.decimals,
        active: currency.active,
        isBase: currency.code === BASE_CURRENCY,
      }));

      return apiSuccess({
        message: "Currency rates updated successfully",
        currencies: formattedCurrencies,
        baseCurrency: BASE_CURRENCY,
        lastUpdated: lastUpdated?.toISOString() ?? new Date().toISOString(),
      });
    } catch (error) {
      return handleApiError(error, "Currencies PUT");
    }
  },
  ["ADMIN"]
);

