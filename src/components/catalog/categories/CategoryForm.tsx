"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "./CategoryTree";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  order?: number;
  isActive: boolean;
}

interface CategoryFormProps {
  locale: string;
  categories: Category[];
  initialData?: Partial<CategoryFormData> & { id?: string };
  parentId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  addTitle: string;
  editTitle: string;
  name: string;
  namePlaceholder: string;
  slug: string;
  slugPlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  icon: string;
  iconPlaceholder: string;
  parent: string;
  noParent: string;
  order: string;
  active: string;
  save: string;
  saving: string;
  cancel: string;
  required: string;
  error: string;
}

const translations: Record<string, Translations> = {
  fr: {
    addTitle: "Nouvelle catégorie",
    editTitle: "Modifier la catégorie",
    name: "Nom",
    namePlaceholder: "Nom de la catégorie",
    slug: "Slug",
    slugPlaceholder: "slug-de-la-categorie",
    description: "Description",
    descriptionPlaceholder: "Description de la catégorie...",
    icon: "Icône (Lucide)",
    iconPlaceholder: "folder, package, hammer...",
    parent: "Catégorie parente",
    noParent: "Aucune (racine)",
    order: "Ordre",
    active: "Actif",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    required: "Ce champ est requis",
    error: "Une erreur est survenue",
  },
  en: {
    addTitle: "New category",
    editTitle: "Edit category",
    name: "Name",
    namePlaceholder: "Category name",
    slug: "Slug",
    slugPlaceholder: "category-slug",
    description: "Description",
    descriptionPlaceholder: "Category description...",
    icon: "Icon (Lucide)",
    iconPlaceholder: "folder, package, hammer...",
    parent: "Parent category",
    noParent: "None (root)",
    order: "Order",
    active: "Active",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    required: "This field is required",
    error: "An error occurred",
  },
  es: {
    addTitle: "Nueva categoría",
    editTitle: "Editar categoría",
    name: "Nombre",
    namePlaceholder: "Nombre de la categoría",
    slug: "Slug",
    slugPlaceholder: "slug-de-categoria",
    description: "Descripción",
    descriptionPlaceholder: "Descripción de la categoría...",
    icon: "Icono (Lucide)",
    iconPlaceholder: "folder, package, hammer...",
    parent: "Categoría padre",
    noParent: "Ninguna (raíz)",
    order: "Orden",
    active: "Activo",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    required: "Este campo es obligatorio",
    error: "Ocurrió un error",
  },
  ar: {
    addTitle: "فئة جديدة",
    editTitle: "تعديل الفئة",
    name: "الاسم",
    namePlaceholder: "اسم الفئة",
    slug: "الرابط",
    slugPlaceholder: "رابط-الفئة",
    description: "الوصف",
    descriptionPlaceholder: "وصف الفئة...",
    icon: "الأيقونة (Lucide)",
    iconPlaceholder: "folder, package, hammer...",
    parent: "الفئة الأم",
    noParent: "لا شيء (جذر)",
    order: "الترتيب",
    active: "نشط",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    required: "هذا الحقل مطلوب",
    error: "حدث خطأ",
  },
};

// ═══════════════════════════════════════════════════════════
// Helper: Generate slug
// ═══════════════════════════════════════════════════════════

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ═══════════════════════════════════════════════════════════
// Helper: Flatten categories for select
// ═══════════════════════════════════════════════════════════

function flattenCategories(
  categories: Category[],
  level = 0,
  excludeId?: string
): Array<Category & { level: number }> {
  const result: Array<Category & { level: number }> = [];

  for (const cat of categories) {
    if (cat.id === excludeId) continue;
    result.push({ ...cat, level });
    if (cat.children) {
      result.push(...flattenCategories(cat.children, level + 1, excludeId));
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function CategoryForm({
  locale,
  categories,
  initialData,
  parentId,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    icon: initialData?.icon || "",
    parentId: initialData?.parentId ?? parentId ?? null,
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update slug when name changes (if auto)
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name, autoSlug]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        icon: initialData?.icon || "",
        parentId: initialData?.parentId ?? parentId ?? null,
        order: initialData?.order ?? 0,
        isActive: initialData?.isActive ?? true,
      });
      setAutoSlug(!isEditing);
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, initialData, parentId, isEditing]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.slug.trim()) newErrors.slug = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url = "/api/catalog/categories";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { id: initialData?.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t.error);
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result.data);
      }

      onClose();
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const flatCategories = flattenCategories(categories, 0, initialData?.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? t.editTitle : t.addTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Alert */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.name} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t.namePlaceholder}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.slug} *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                setFormData((prev) => ({ ...prev, slug: e.target.value }));
              }}
              placeholder={t.slugPlaceholder}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                errors.slug ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.slug && (
              <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder={t.descriptionPlaceholder}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Icon & Parent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.icon}
              </label>
              <input
                type="text"
                value={formData.icon || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder={t.iconPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.parent}
              </label>
              <select
                value={formData.parentId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: e.target.value || null,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">{t.noParent}</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.level)} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.order}
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.active}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;
