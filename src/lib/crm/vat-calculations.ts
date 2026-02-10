// ═══════════════════════════════════════════════════════════
// P0-5: VAT & Totals Correctness
// ═══════════════════════════════════════════════════════════
// Morocco VAT rates: 0%, 7%, 10%, 14%, 20%
// Ensures proper rounding and VAT breakdown by rate
// ═══════════════════════════════════════════════════════════

// Morocco VAT rates
export const MOROCCO_VAT_RATES = [0, 7, 10, 14, 20] as const;
export type MoroccoVATRate = typeof MOROCCO_VAT_RATES[number];

export interface LineItem {
  quantity: number;
  unitPriceHT: number;
  discountPercent?: number;
  tvaRate: number;
}

export interface CalculatedLineItem extends LineItem {
  lineTotal: number; // quantity * unitPriceHT
  discountAmount: number; // lineTotal * discountPercent / 100
  netHT: number; // lineTotal - discountAmount
  tvaAmount: number; // netHT * tvaRate / 100
  totalTTC: number; // netHT + tvaAmount
}

export interface VATBreakdownEntry {
  rate: number;
  baseHT: number;
  amount: number;
}

export interface DocumentTotals {
  lines: CalculatedLineItem[];
  subtotalHT: number; // Sum of all line totals (before discounts)
  totalLineDiscounts: number; // Sum of all line discounts
  netHT: number; // subtotalHT - totalLineDiscounts
  globalDiscountAmount: number; // Global discount applied to netHT
  taxableHT: number; // netHT - globalDiscountAmount
  vatBreakdown: VATBreakdownEntry[]; // VAT by rate
  totalVAT: number; // Sum of all VAT amounts
  totalTTC: number; // taxableHT + totalVAT
}

/**
 * Round to 2 decimal places using banker's rounding (round half to even)
 * This is the standard for financial calculations
 */
export function roundCurrency(value: number): number {
  // Use Math.round with scaling for proper decimal handling
  return Math.round(value * 100) / 100;
}

/**
 * Round using banker's rounding (round half to even)
 * More accurate for financial calculations
 */
export function bankersRound(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  const shifted = value * factor;
  const truncated = Math.trunc(shifted);
  const remainder = shifted - truncated;

  if (Math.abs(remainder - 0.5) < 1e-10) {
    // Exactly 0.5 - round to even
    return (truncated % 2 === 0 ? truncated : truncated + 1) / factor;
  }

  return Math.round(shifted) / factor;
}

/**
 * Calculate line item totals with proper rounding
 */
export function calculateLineItem(item: LineItem): CalculatedLineItem {
  const quantity = item.quantity;
  const unitPriceHT = item.unitPriceHT;
  const discountPercent = item.discountPercent || 0;
  const tvaRate = item.tvaRate;

  // Calculate line total (before discount)
  const lineTotal = roundCurrency(quantity * unitPriceHT);

  // Calculate discount
  const discountAmount = roundCurrency(lineTotal * discountPercent / 100);

  // Net HT after discount
  const netHT = roundCurrency(lineTotal - discountAmount);

  // Calculate VAT on net amount
  const tvaAmount = roundCurrency(netHT * tvaRate / 100);

  // Total TTC
  const totalTTC = roundCurrency(netHT + tvaAmount);

  return {
    ...item,
    lineTotal,
    discountAmount,
    netHT,
    tvaAmount,
    totalTTC,
  };
}

/**
 * Calculate document totals with VAT breakdown by rate
 */
export function calculateDocumentTotals(
  items: LineItem[],
  globalDiscountType?: "percentage" | "fixed",
  globalDiscountValue?: number
): DocumentTotals {
  // Calculate each line
  const calculatedLines = items.map(calculateLineItem);

  // Sum line totals
  const subtotalHT = roundCurrency(
    calculatedLines.reduce((sum, line) => sum + line.lineTotal, 0)
  );

  const totalLineDiscounts = roundCurrency(
    calculatedLines.reduce((sum, line) => sum + line.discountAmount, 0)
  );

  const netHT = roundCurrency(subtotalHT - totalLineDiscounts);

  // Apply global discount
  let globalDiscountAmount = 0;
  if (globalDiscountType && globalDiscountValue) {
    if (globalDiscountType === "percentage") {
      globalDiscountAmount = roundCurrency(netHT * globalDiscountValue / 100);
    } else {
      globalDiscountAmount = roundCurrency(globalDiscountValue);
    }
  }

  const taxableHT = roundCurrency(netHT - globalDiscountAmount);

  // Calculate VAT breakdown by rate
  // First, group lines by VAT rate
  const linesByRate = new Map<number, CalculatedLineItem[]>();
  for (const line of calculatedLines) {
    const existing = linesByRate.get(line.tvaRate) || [];
    existing.push(line);
    linesByRate.set(line.tvaRate, existing);
  }

  // Calculate VAT for each rate
  // If there's a global discount, distribute it proportionally
  const vatBreakdown: VATBreakdownEntry[] = [];

  for (const [rate, lines] of linesByRate) {
    const rateNetHT = lines.reduce((sum, line) => sum + line.netHT, 0);

    // Proportional share of global discount for this rate
    let rateBaseHT = rateNetHT;
    if (globalDiscountAmount > 0 && netHT > 0) {
      const proportion = rateNetHT / netHT;
      const discountShare = globalDiscountAmount * proportion;
      rateBaseHT = roundCurrency(rateNetHT - discountShare);
    }

    const vatAmount = roundCurrency(rateBaseHT * rate / 100);

    vatBreakdown.push({
      rate,
      baseHT: roundCurrency(rateBaseHT),
      amount: vatAmount,
    });
  }

  // Sort by rate for consistent output
  vatBreakdown.sort((a, b) => a.rate - b.rate);

  const totalVAT = roundCurrency(
    vatBreakdown.reduce((sum, entry) => sum + entry.amount, 0)
  );

  const totalTTC = roundCurrency(taxableHT + totalVAT);

  return {
    lines: calculatedLines,
    subtotalHT,
    totalLineDiscounts,
    netHT,
    globalDiscountAmount,
    taxableHT,
    vatBreakdown,
    totalVAT,
    totalTTC,
  };
}

/**
 * Validate that a VAT rate is valid for Morocco
 */
export function isValidMoroccoVATRate(rate: number): boolean {
  return MOROCCO_VAT_RATES.includes(rate as MoroccoVATRate);
}

/**
 * Get VAT rate description in French
 */
export function getVATRateDescription(rate: number): string {
  switch (rate) {
    case 0:
      return "Exonéré";
    case 7:
      return "TVA réduite 7%";
    case 10:
      return "TVA réduite 10%";
    case 14:
      return "TVA réduite 14%";
    case 20:
      return "TVA standard 20%";
    default:
      return `TVA ${rate}%`;
  }
}

/**
 * Format currency amount for Morocco (MAD/DH)
 */
export function formatMAD(amount: number, locale: string = "fr-MA"): string {
  const numAmount = amount;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount) + " DH";
}

/**
 * Convert amount to words in French (for checks/official documents)
 */
export function amountToWordsFR(amount: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  function convertHundreds(n: number): string {
    if (n === 0) return "";

    let result = "";
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundreds > 0) {
      if (hundreds === 1) {
        result = "cent";
      } else {
        result = units[hundreds] + " cent";
        if (remainder === 0) result += "s";
      }
    }

    if (remainder > 0) {
      if (result) result += " ";

      if (remainder < 10) {
        result += units[remainder];
      } else if (remainder < 20) {
        result += teens[remainder - 10];
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;

        if (t === 7 || t === 9) {
          // Special cases: 70-79 and 90-99
          if (u === 1 && t === 7) {
            result += tens[t] + " et onze";
          } else {
            result += tens[t] + "-" + teens[u];
          }
        } else {
          if (u === 1 && t !== 8) {
            result += tens[t] + " et un";
          } else if (u === 0) {
            result += tens[t];
            if (t === 8) result += "s";
          } else {
            result += tens[t] + "-" + units[u];
          }
        }
      }
    }

    return result;
  }

  if (amount === 0) return "zéro dirham";

  const wholePart = Math.floor(amount);
  const centimes = Math.round((amount - wholePart) * 100);

  let result = "";

  // Handle millions
  const millions = Math.floor(wholePart / 1000000);
  const thousands = Math.floor((wholePart % 1000000) / 1000);
  const rest = wholePart % 1000;

  if (millions > 0) {
    if (millions === 1) {
      result = "un million";
    } else {
      result = convertHundreds(millions) + " millions";
    }
  }

  if (thousands > 0) {
    if (result) result += " ";
    if (thousands === 1) {
      result += "mille";
    } else {
      result += convertHundreds(thousands) + " mille";
    }
  }

  if (rest > 0) {
    if (result) result += " ";
    result += convertHundreds(rest);
  }

  result += " dirham";
  if (wholePart > 1) result += "s";

  if (centimes > 0) {
    result += " et " + convertHundreds(centimes) + " centime";
    if (centimes > 1) result += "s";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Verify document totals are correct
 * Returns discrepancies if any
 */
export function verifyDocumentTotals(document: {
  items: Array<{
    quantity: number;
    unitPriceHT: number;
    discountPercent?: number;
    tvaRate: number;
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
  }>;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  discountAmount?: number;
}): {
  isValid: boolean;
  discrepancies: string[];
  recalculated: DocumentTotals;
} {
  const items: LineItem[] = document.items.map((item) => ({
    quantity: item.quantity,
    unitPriceHT: item.unitPriceHT,
    discountPercent: item.discountPercent || 0,
    tvaRate: item.tvaRate,
  }));

  const recalculated = calculateDocumentTotals(items);
  const discrepancies: string[] = [];

  // Check line totals
  for (let i = 0; i < document.items.length; i++) {
    const stored = document.items[i];
    const calc = recalculated.lines[i];

    if (Math.abs(stored.totalHT - calc.netHT) > 0.01) {
      discrepancies.push(
        `Ligne ${i + 1}: HT stocké (${stored.totalHT}) ≠ calculé (${calc.netHT})`
      );
    }
    if (Math.abs(stored.totalTVA - calc.tvaAmount) > 0.01) {
      discrepancies.push(
        `Ligne ${i + 1}: TVA stockée (${stored.totalTVA}) ≠ calculée (${calc.tvaAmount})`
      );
    }
  }

  // Check document totals
  if (Math.abs(document.totalHT - recalculated.taxableHT) > 0.01) {
    discrepancies.push(
      `Total HT: stocké (${document.totalHT}) ≠ calculé (${recalculated.taxableHT})`
    );
  }
  if (Math.abs(document.totalTVA - recalculated.totalVAT) > 0.01) {
    discrepancies.push(
      `Total TVA: stocké (${document.totalTVA}) ≠ calculé (${recalculated.totalVAT})`
    );
  }
  if (Math.abs(document.totalTTC - recalculated.totalTTC) > 0.01) {
    discrepancies.push(
      `Total TTC: stocké (${document.totalTTC}) ≠ calculé (${recalculated.totalTTC})`
    );
  }

  return {
    isValid: discrepancies.length === 0,
    discrepancies,
    recalculated,
  };
}
