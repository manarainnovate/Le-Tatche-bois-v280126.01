"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ChevronDown } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    selectRange: "Selectionner une periode",
    today: "Aujourd'hui",
    yesterday: "Hier",
    last7Days: "7 derniers jours",
    last30Days: "30 derniers jours",
    thisMonth: "Ce mois",
    lastMonth: "Mois dernier",
    custom: "Personnalise",
    from: "Du",
    to: "Au",
    apply: "Appliquer",
    clear: "Effacer",
  },
  en: {
    selectRange: "Select date range",
    today: "Today",
    yesterday: "Yesterday",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    thisMonth: "This month",
    lastMonth: "Last month",
    custom: "Custom",
    from: "From",
    to: "To",
    apply: "Apply",
    clear: "Clear",
  },
  es: {
    selectRange: "Seleccionar periodo",
    today: "Hoy",
    yesterday: "Ayer",
    last7Days: "Ultimos 7 dias",
    last30Days: "Ultimos 30 dias",
    thisMonth: "Este mes",
    lastMonth: "Mes pasado",
    custom: "Personalizado",
    from: "Desde",
    to: "Hasta",
    apply: "Aplicar",
    clear: "Borrar",
  },
  ar: {
    selectRange: "اختر الفترة",
    today: "اليوم",
    yesterday: "أمس",
    last7Days: "آخر 7 أيام",
    last30Days: "آخر 30 يوماً",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    custom: "مخصص",
    from: "من",
    to: "إلى",
    apply: "تطبيق",
    clear: "مسح",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type DatePreset = "today" | "yesterday" | "last7Days" | "last30Days" | "thisMonth" | "lastMonth" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset?: DatePreset;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  locale?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function getPresetDates(preset: DatePreset): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    case "last7Days":
      const week = new Date(today);
      week.setDate(week.getDate() - 6);
      return { from: week, to: today };
    case "last30Days":
      const month = new Date(today);
      month.setDate(month.getDate() - 29);
      return { from: month, to: today };
    case "thisMonth":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: today,
      };
    case "lastMonth":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lastMonthStart, to: lastMonthEnd };
    default:
      return { from: today, to: today };
  }
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DateRangePicker({
  value,
  onChange,
  locale = "fr",
  className,
}: DateRangePickerProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(toInputDate(value.from));
  const [customTo, setCustomTo] = useState(toInputDate(value.to));

  // Presets
  const presets: { value: DatePreset; label: string }[] = [
    { value: "today", label: t.today },
    { value: "yesterday", label: t.yesterday },
    { value: "last7Days", label: t.last7Days },
    { value: "last30Days", label: t.last30Days },
    { value: "thisMonth", label: t.thisMonth },
    { value: "lastMonth", label: t.lastMonth },
    { value: "custom", label: t.custom },
  ];

  // Get display label
  const getDisplayLabel = (): string => {
    if (value.preset && value.preset !== "custom") {
      const preset = presets.find((p) => p.value === value.preset);
      return preset?.label ?? t.selectRange;
    }
    return `${formatDate(value.from, locale)} - ${formatDate(value.to, locale)}`;
  };

  // Handle preset click
  const handlePresetClick = (preset: DatePreset) => {
    if (preset === "custom") {
      // Just select custom mode
      onChange({ ...value, preset: "custom" });
    } else {
      const dates = getPresetDates(preset);
      onChange({ ...dates, preset });
      setIsOpen(false);
    }
  };

  // Handle custom apply
  const handleCustomApply = () => {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    if (from <= to) {
      onChange({ from, to, preset: "custom" });
      setIsOpen(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700 dark:text-gray-300">{getDisplayLabel()}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute start-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* Presets */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    value.preset === preset.value
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Range */}
            {value.preset === "custom" && (
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      {t.from}
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      {t.to}
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
