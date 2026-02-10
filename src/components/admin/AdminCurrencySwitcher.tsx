"use client";

import { useState, useRef, useEffect } from "react";
import { Coins, ChevronDown, Check } from "lucide-react";
import { useCurrency, currencies, type CurrencyCode } from "@/stores/currency";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Currency options with flags
// ═══════════════════════════════════════════════════════════

const currencyOptions: {
  code: CurrencyCode;
  flag: string;
  label: string;
}[] = [
  { code: "MAD", flag: "🇲🇦", label: "Dirham (DH)" },
  { code: "EUR", flag: "🇪🇺", label: "Euro (€)" },
  { code: "USD", flag: "🇺🇸", label: "Dollar ($)" },
  { code: "GBP", flag: "🇬🇧", label: "Pound (£)" },
];

// ═══════════════════════════════════════════════════════════
// Admin Currency Switcher Component
// ═══════════════════════════════════════════════════════════

interface AdminCurrencySwitcherProps {
  isRTL?: boolean;
}

export function AdminCurrencySwitcher({ isRTL = false }: AdminCurrencySwitcherProps) {
  const { currency, setCurrency, isHydrated } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCurrency = currencies[currency];
  const currentOption = currencyOptions.find((opt) => opt.code === currency);

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  // Show skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center gap-1 rounded-md p-2 text-gray-400">
        <Coins className="h-5 w-5" />
        <span className="hidden text-sm font-medium sm:inline">--</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        aria-label="Select currency"
      >
        <Coins className="h-5 w-5" />
        <span className="hidden text-sm font-medium sm:inline">
          {currentCurrency.symbol}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50",
            isRTL ? "left-0" : "right-0"
          )}
        >
          {currencyOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => handleCurrencyChange(option.code)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                currency === option.code
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              <span className="text-lg">{option.flag}</span>
              <span className="flex-1 text-left">{option.label}</span>
              {currency === option.code && (
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCurrencySwitcher;
