"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Globe, Check, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type LocaleCode = "fr" | "en" | "es" | "ar";

export interface TranslationData {
  name: string;
  description: string;
  [key: string]: string | string[];
}

interface TranslationTabsProps {
  translations: Record<LocaleCode, TranslationData>;
  onChange: (locale: LocaleCode, field: string, value: string) => void;
  fields: {
    name: string;
    label: Record<LocaleCode, string>;
    type: "text" | "textarea" | "richtext";
    required?: boolean;
    placeholder?: Record<LocaleCode, string>;
  }[];
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Locale Info
// ═══════════════════════════════════════════════════════════

const locales: { code: LocaleCode; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇲🇦", dir: "rtl" },
];

// ═══════════════════════════════════════════════════════════
// Translation Tabs Component
// ═══════════════════════════════════════════════════════════

export function TranslationTabs({
  translations,
  onChange,
  fields,
  className,
}: TranslationTabsProps) {
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("fr");

  // Check if a locale has all required fields filled
  const isLocaleComplete = (locale: LocaleCode): boolean => {
    const trans = translations[locale];
    return fields
      .filter((f) => f.required)
      .every((f) => {
        const value = trans[f.name];
        if (Array.isArray(value)) return value.length > 0;
        return typeof value === "string" && value.trim() !== "";
      });
  };

  // Get current locale info
  const currentLocale = locales.find((l) => l.code === activeLocale) ?? locales[0];

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800", className)}>
      {/* Tab Header */}
      <div className="flex items-center gap-1 border-b border-gray-200 px-2 dark:border-gray-700">
        <Globe className="mx-2 h-4 w-4 text-gray-400" />
        {locales.map((locale) => {
          const isComplete = isLocaleComplete(locale.code);
          const isActive = activeLocale === locale.code;

          return (
            <button
              key={locale.code}
              type="button"
              onClick={() => setActiveLocale(locale.code)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <span>{locale.flag}</span>
              <span className="hidden sm:inline">{locale.label}</span>

              {/* Completion Indicator */}
              {isComplete ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
              )}

              {/* Active Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6" dir={currentLocale?.dir}>
        <div className="space-y-4">
          {fields.map((field) => {
            const value = translations[activeLocale][field.name] ?? "";
            const label = field.label[activeLocale];
            const placeholder = field.placeholder?.[activeLocale] ?? "";

            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                  {field.required && <span className="ms-1 text-red-500">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    onChange={(e) => onChange(activeLocale, field.name, e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
                      "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
                      "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                      activeLocale === "ar" && "text-right"
                    )}
                  />
                ) : field.type === "richtext" ? (
                  // For rich text, we'll use a simple textarea for now
                  // In production, integrate a rich text editor like TipTap or Quill
                  <textarea
                    value={value}
                    onChange={(e) => onChange(activeLocale, field.name, e.target.value)}
                    placeholder={placeholder}
                    rows={8}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono",
                      "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
                      "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                      activeLocale === "ar" && "text-right"
                    )}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(activeLocale, field.name, e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                      "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
                      "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
                      "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                      activeLocale === "ar" && "text-right"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Locale Helper Text */}
        <p className="mt-4 text-xs text-gray-400">
          {activeLocale === "ar"
            ? "أدخل الترجمات لهذه اللغة"
            : activeLocale === "es"
            ? "Ingrese las traducciones para este idioma"
            : activeLocale === "en"
            ? "Enter translations for this language"
            : "Entrez les traductions pour cette langue"}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helper: Create Empty Translations
// ═══════════════════════════════════════════════════════════

export function createEmptyTranslations(fields: string[]): Record<LocaleCode, TranslationData> {
  const empty: TranslationData = fields.reduce((acc, field) => {
    acc[field] = "";
    return acc;
  }, {} as TranslationData);

  return {
    fr: { ...empty },
    en: { ...empty },
    es: { ...empty },
    ar: { ...empty },
  };
}
