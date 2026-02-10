"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  ChevronLeft,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Catégories Portfolio",
    subtitle: "Gérez les catégories de vos réalisations",
    back: "Retour au portfolio",
    addCategory: "Ajouter une catégorie",
    editCategory: "Modifier la catégorie",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette catégorie ?",
    save: "Enregistrer",
    cancel: "Annuler",
    nameFr: "Nom (FR)",
    nameEn: "Nom (EN)",
    slug: "Slug",
    icon: "Icône/Emoji",
    iconPlaceholder: "🏠 ou 🚪",
    projectCount: "{count} projet(s)",
    noCategories: "Aucune catégorie",
    createFirst: "Créez votre première catégorie",
    loading: "Chargement...",
    active: "Actif",
  },
  en: {
    title: "Portfolio Categories",
    subtitle: "Manage your portfolio categories",
    back: "Back to portfolio",
    addCategory: "Add category",
    editCategory: "Edit category",
    confirmDelete: "Are you sure you want to delete this category?",
    save: "Save",
    cancel: "Cancel",
    nameFr: "Name (FR)",
    nameEn: "Name (EN)",
    slug: "Slug",
    icon: "Icon/Emoji",
    iconPlaceholder: "🏠 or 🚪",
    projectCount: "{count} project(s)",
    noCategories: "No categories",
    createFirst: "Create your first category",
    loading: "Loading...",
    active: "Active",
  },
  es: {
    title: "Categorías Portfolio",
    subtitle: "Gestiona las categorías de tu portfolio",
    back: "Volver al portfolio",
    addCategory: "Añadir categoría",
    editCategory: "Editar categoría",
    confirmDelete: "¿Estás seguro de eliminar esta categoría?",
    save: "Guardar",
    cancel: "Cancelar",
    nameFr: "Nombre (FR)",
    nameEn: "Nombre (EN)",
    slug: "Slug",
    icon: "Icono/Emoji",
    iconPlaceholder: "🏠 o 🚪",
    projectCount: "{count} proyecto(s)",
    noCategories: "Sin categorías",
    createFirst: "Crea tu primera categoría",
    loading: "Cargando...",
    active: "Activo",
  },
  ar: {
    title: "فئات المعرض",
    subtitle: "إدارة فئات معرض أعمالك",
    back: "العودة إلى المعرض",
    addCategory: "إضافة فئة",
    editCategory: "تعديل الفئة",
    confirmDelete: "هل أنت متأكد من حذف هذه الفئة؟",
    save: "حفظ",
    cancel: "إلغاء",
    nameFr: "الاسم (FR)",
    nameEn: "الاسم (EN)",
    slug: "الرابط المختصر",
    icon: "أيقونة/إيموجي",
    iconPlaceholder: "🏠 أو 🚪",
    projectCount: "{count} مشروع(ات)",
    noCategories: "لا توجد فئات",
    createFirst: "أنشئ أول فئة لك",
    loading: "جاري التحميل...",
    active: "نشط",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PortfolioCategory {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string | null;
  nameEs: string | null;
  nameAr: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  _count?: { projects: number };
}

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Portfolio Categories Page
// ═══════════════════════════════════════════════════════════

export default function PortfolioCategoriesPage({ params }: PageProps) {
  const locale = params.locale as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PortfolioCategory | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cms/portfolio-categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
      setLoading(false);
    };
    void loadCategories();
  }, []);

  // Save category
  const handleSaveCategory = async (category: Partial<PortfolioCategory>) => {
    setSaving(true);
    try {
      const isNew = !category.id;
      const url = isNew ? "/api/cms/portfolio-categories" : `/api/cms/portfolio-categories/${category.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (res.ok) {
        const savedCategory = await res.json();
        if (isNew) {
          setCategories((prev) => [...prev, savedCategory.category]);
        } else {
          setCategories((prev) =>
            prev.map((c) => (c.id === category.id ? savedCategory.category : c))
          );
        }
        setEditingCategory(null);
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    }
    setSaving(false);
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`/api/cms/portfolio-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // New category template
  const newCategory: Partial<PortfolioCategory> = {
    nameFr: "",
    nameEn: "",
    slug: "",
    icon: "",
    order: categories.length,
    isActive: true,
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[éèêë]/g, "e")
      .replace(/[àâä]/g, "a")
      .replace(/[ùûü]/g, "u")
      .replace(/[ôö]/g, "o")
      .replace(/[îï]/g, "i")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/contenu/portfolio`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Button
          onClick={() => {
            setIsAddingNew(true);
            setEditingCategory(newCategory as PortfolioCategory);
          }}
          disabled={isAddingNew}
        >
          <Plus className="me-2 h-4 w-4" />
          {t.addCategory}
        </Button>
      </div>

      {/* Categories List */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : categories.length === 0 && !isAddingNew ? (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">{t.noCategories}</p>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(true);
                setEditingCategory(newCategory as PortfolioCategory);
              }}
              className="mt-4 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <Plus className="h-4 w-4" />
              {t.createFirst}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                  category.isActive
                    ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    : "border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900"
                )}
              >
                {/* Drag Handle */}
                <button
                  type="button"
                  className="cursor-grab text-gray-400 hover:text-gray-600"
                >
                  <GripVertical className="h-5 w-5" />
                </button>

                {/* Icon */}
                <span className="text-2xl">{category.icon || "📁"}</span>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.nameFr}
                  </p>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                </div>

                {/* Project Count */}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {t.projectCount.replace("{count}", String(category._count?.projects || 0))}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(category)}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isAddingNew ? t.addCategory : t.editCategory}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setIsAddingNew(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.icon}
                </label>
                <input
                  type="text"
                  value={editingCategory.icon || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, icon: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-2xl dark:border-gray-600 dark:bg-gray-700"
                  placeholder={t.iconPlaceholder}
                />
              </div>

              {/* Name FR */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.nameFr} *
                </label>
                <input
                  type="text"
                  value={editingCategory.nameFr}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      nameFr: newName,
                      slug: isAddingNew ? generateSlug(newName) : editingCategory.slug,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Cuisines"
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.nameEn}
                </label>
                <input
                  type="text"
                  value={editingCategory.nameEn || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, nameEn: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Kitchens"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.slug}
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="cuisines"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingCategory.isActive}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-amber-600"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {t.active}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCategory(null);
                  setIsAddingNew(false);
                }}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={() => handleSaveCategory(editingCategory)}
                disabled={saving || !editingCategory.nameFr || !editingCategory.slug}
              >
                {saving ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t.save}
                  </>
                ) : (
                  <>
                    <Save className="me-2 h-4 w-4" />
                    {t.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
