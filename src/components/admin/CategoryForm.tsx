"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Loader2, Check, AlertCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type LocaleCode = "fr" | "en" | "es" | "ar";

export interface CategoryTranslations {
  fr: { name: string; description: string };
  en: { name: string; description: string };
  es: { name: string; description: string };
  ar: { name: string; description: string };
}

interface CategoryFormData {
  slug: string;
  parentId: string | null;
  translations: CategoryTranslations;
}

interface ParentCategory {
  id: string;
  translations: { name: string; locale: string }[];
}

interface CategoryFormProps {
  category?: {
    id: string;
    slug: string;
    parentId: string | null;
    translations: { name: string; description: string | null; locale: string }[];
  };
  parentCategories: ParentCategory[];
  categoryType: string;
  locale: string;
  onSave: (data: CategoryFormData) => Promise<void>;
  onClose: () => void;
  translations: {
    addCategory: string;
    editCategory: string;
    name: string;
    slug: string;
    slugPlaceholder: string;
    parentCategory: string;
    noParent: string;
    description: string;
    save: string;
    saving: string;
    cancel: string;
    translations: string;
  };
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
// Category Form Component
// ═══════════════════════════════════════════════════════════

function createEmptyTranslations(): CategoryTranslations {
  return {
    fr: { name: "", description: "" },
    en: { name: "", description: "" },
    es: { name: "", description: "" },
    ar: { name: "", description: "" },
  };
}

export function CategoryForm({
  category,
  parentCategories,
  locale,
  onSave,
  onClose,
  translations: t,
}: CategoryFormProps) {
  const isEdit = !!category;

  // Initialize form data
  const initialTranslations = createEmptyTranslations();
  if (category) {
    category.translations.forEach((trans) => {
      const loc = trans.locale as LocaleCode;
      if (loc in initialTranslations) {
        initialTranslations[loc] = {
          name: trans.name,
          description: trans.description ?? "",
        };
      }
    });
  }

  const [formData, setFormData] = useState<CategoryFormData>({
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? null,
    translations: initialTranslations,
  });

  const [activeLocale, setActiveLocale] = useState<LocaleCode>("fr");
  const [isSaving, setIsSaving] = useState(false);

  // Check if a locale has required fields filled
  const isLocaleComplete = (loc: LocaleCode): boolean => {
    return formData.translations[loc].name.trim() !== "";
  };

  // Get parent category name
  const getParentName = (parent: ParentCategory) => {
    const trans = parent.translations.find((t) => t.locale === locale) ?? parent.translations[0];
    return trans?.name ?? "";
  };

  // Handle translation change
  const handleTranslationChange = (loc: LocaleCode, field: "name" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [loc]: {
          ...prev.translations[loc],
          [field]: value,
        },
      },
    }));

    // Auto-generate slug from French name
    if (field === "name" && loc === "fr" && !isEdit) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentLocale = locales.find((l) => l.code === activeLocale) ?? locales[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? t.editCategory : t.addCategory}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6">
          <div className="space-y-6">
            {/* Basic Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.slug} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={t.slugPlaceholder}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.parentCategory}
                </label>
                <select
                  value={formData.parentId ?? ""}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t.noParent}</option>
                  {parentCategories
                    .filter((p) => p.id !== category?.id)
                    .map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {getParentName(parent)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Translations */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700">
              {/* Tab Header */}
              <div className="flex items-center gap-1 border-b border-gray-200 px-2 dark:border-gray-700">
                <Globe className="mx-2 h-4 w-4 text-gray-400" />
                {locales.map((loc) => {
                  const isComplete = isLocaleComplete(loc.code);
                  const isActive = activeLocale === loc.code;

                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => setActiveLocale(loc.code)}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      )}
                    >
                      <span>{loc.flag}</span>
                      <span className="hidden sm:inline">{loc.label}</span>

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
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.translations[activeLocale].name}
                      onChange={(e) => handleTranslationChange(activeLocale, "name", e.target.value)}
                      className={cn(
                        "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
                        "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
                        "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        activeLocale === "ar" && "text-right"
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.description}
                    </label>
                    <textarea
                      value={formData.translations[activeLocale].description}
                      onChange={(e) => handleTranslationChange(activeLocale, "description", e.target.value)}
                      rows={3}
                      className={cn(
                        "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm",
                        "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500",
                        "dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        activeLocale === "ar" && "text-right"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
