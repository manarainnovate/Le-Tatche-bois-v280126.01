"use client";

import * as React from "react";
import { useCurrency } from "@/stores/currency";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface PriceProps {
  /** Amount in MAD (base currency) */
  amount: number;
  /** Original/compare price in MAD (shows strikethrough) */
  compareAmount?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show "From" prefix */
  showFrom?: boolean;
  /** Show currency code */
  showCode?: boolean;
  /** Show discount percentage badge */
  showSaleBadge?: boolean;
  /** Custom className */
  className?: string;
}

export interface PriceCompactProps {
  amount: number;
  compareAmount?: number;
  className?: string;
}

export interface PriceRangeProps {
  minAmount: number;
  maxAmount?: number;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// SIZE CONFIGURATION
// ═══════════════════════════════════════════════════════════

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-semibold",
  xl: "text-2xl font-bold",
};

const compareSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

// ═══════════════════════════════════════════════════════════
// PRICE COMPONENT
// ═══════════════════════════════════════════════════════════

function Price({
  amount,
  compareAmount,
  size = "md",
  showFrom = false,
  showCode = false,
  showSaleBadge = false,
  className,
}: PriceProps) {
  const { format, currency } = useCurrency();
  const t = useTranslations("common");

  const formattedPrice = format(amount);
  const formattedCompare = compareAmount ? format(compareAmount) : null;

  // Calculate discount percentage
  const discountPercent = compareAmount
    ? Math.round(((compareAmount - amount) / compareAmount) * 100)
    : 0;

  const hasDiscount = compareAmount && compareAmount > amount;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      {/* From prefix */}
      {showFrom && (
        <span className="text-wood-muted text-sm">{t("from")}</span>
      )}

      {/* Compare/Original price (strikethrough) */}
      {formattedCompare && hasDiscount && (
        <span
          className={cn("text-gray-400 line-through", compareSizeClasses[size])}
        >
          {formattedCompare}
        </span>
      )}

      {/* Main price */}
      <span
        className={cn(
          sizeClasses[size],
          "font-medium",
          hasDiscount ? "text-red-600" : "text-wood-primary"
        )}
      >
        {formattedPrice}
      </span>

      {/* Currency code */}
      {showCode && (
        <span className="text-wood-muted text-xs">{currency}</span>
      )}

      {/* Sale badge */}
      {showSaleBadge && discountPercent > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

Price.displayName = "Price";

// ═══════════════════════════════════════════════════════════
// PRICE COMPACT (for cards)
// ═══════════════════════════════════════════════════════════

function PriceCompact({ amount, compareAmount, className }: PriceCompactProps) {
  const { format } = useCurrency();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {compareAmount && compareAmount > amount && (
        <span className="text-gray-400 line-through text-sm">
          {format(compareAmount)}
        </span>
      )}
      <span
        className={cn(
          "font-semibold",
          compareAmount && compareAmount > amount
            ? "text-red-600"
            : "text-wood-primary"
        )}
      >
        {format(amount)}
      </span>
    </div>
  );
}

PriceCompact.displayName = "PriceCompact";

// ═══════════════════════════════════════════════════════════
// PRICE RANGE (for services)
// ═══════════════════════════════════════════════════════════

function PriceRange({ minAmount, maxAmount, className }: PriceRangeProps) {
  const { format } = useCurrency();
  const t = useTranslations("common");

  if (!maxAmount || minAmount === maxAmount) {
    return (
      <span className={cn("font-semibold text-wood-primary", className)}>
        {t("from")} {format(minAmount)}
      </span>
    );
  }

  return (
    <span className={cn("font-semibold text-wood-primary", className)}>
      {format(minAmount)} - {format(maxAmount)}
    </span>
  );
}

PriceRange.displayName = "PriceRange";

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export { Price, PriceCompact, PriceRange };
export default Price;
