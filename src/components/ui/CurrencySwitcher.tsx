"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
import {
  useCurrency,
  type CurrencyCode,
  type Currency,
} from "@/stores/currency";
import { useDirection } from "@/hooks/useDirection";
import { LanguageSwitcher } from "./LanguageSwitcher";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface CurrencySwitcherProps {
  /** Variant style */
  variant?: "default" | "minimal" | "compact";
  /** Custom className */
  className?: string;
  /** Show exchange rate hint */
  showRate?: boolean;
}

export interface LocaleSwitcherProps {
  /** Custom className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// CURRENCY DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════

function CurrencyDropdown({
  currencyList,
  currentCode,
  onSelect,
  direction,
  showRate,
}: {
  currencyList: Currency[];
  currentCode: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
  direction: "ltr" | "rtl";
  showRate: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-wood-light",
        "min-w-[180px] z-50",
        "animate-in fade-in-0 zoom-in-95",
        direction === "rtl" ? "left-0" : "right-0"
      )}
      role="menu"
    >
      {currencyList.map((curr) => (
        <button
          key={curr.code}
          onClick={() => onSelect(curr.code)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
            "hover:bg-wood-light/50",
            currentCode === curr.code && "bg-wood-light/30"
          )}
          role="menuitem"
        >
          <span className="font-semibold w-6">{curr.symbol}</span>
          <span className="flex-1 text-start">
            <span className="font-medium">{curr.code}</span>
            {showRate && curr.code !== "MAD" && (
              <span className="text-xs text-wood-muted block">
                1 MAD = {curr.rate.toFixed(3)} {curr.code}
              </span>
            )}
          </span>
          {currentCode === curr.code && (
            <Check className="w-4 h-4 text-wood-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CURRENCY SWITCHER COMPONENT
// ═══════════════════════════════════════════════════════════

export function CurrencySwitcher({
  variant = "default",
  className,
  showRate = false,
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency, currencyInfo, allCurrencies } = useCurrency();
  const direction = useDirection();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  // Compact variant - symbol only
  if (variant === "compact") {
    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "px-2 py-1 text-sm font-medium rounded transition-colors",
            "hover:bg-wood-light/50",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary"
          )}
          aria-label="Change currency"
          aria-expanded={isOpen}
        >
          {currencyInfo.symbol}
        </button>

        {isOpen && (
          <CurrencyDropdown
            currencyList={allCurrencies}
            currentCode={currency}
            onSelect={handleCurrencyChange}
            direction={direction}
            showRate={showRate}
          />
        )}
      </div>
    );
  }

  // Default and minimal variants
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-wood-light/50 border border-wood-light",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary",
          variant === "minimal" && "border-0 px-2"
        )}
        aria-label="Change currency"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-wood-primary">
          {currencyInfo.symbol}
        </span>
        {variant === "default" && (
          <>
            <span className="text-sm font-medium text-wood-dark">
              {currency}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-wood-muted transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {isOpen && (
        <CurrencyDropdown
          currencyList={allCurrencies}
          currentCode={currency}
          onSelect={handleCurrencyChange}
          direction={direction}
          showRate={showRate}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMBINED LOCALE SWITCHER (Language + Currency)
// ═══════════════════════════════════════════════════════════

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LanguageSwitcher variant="minimal" />
      <span className="text-wood-muted">|</span>
      <CurrencySwitcher variant="minimal" />
    </div>
  );
}

CurrencySwitcher.displayName = "CurrencySwitcher";
LocaleSwitcher.displayName = "LocaleSwitcher";

export default CurrencySwitcher;
