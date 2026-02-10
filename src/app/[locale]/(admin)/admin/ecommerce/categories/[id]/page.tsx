"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string; id: string };
}

interface CategoryTranslation {
  locale: string;
  name: string;
  description: string | null;
}

interface Category {
  id: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  image: string | null;
  order: number;
  translations: CategoryTranslation[];
}

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    newCategory: "Nouvelle Catégorie",
    editCategory: "Modifier la Catégorie",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    delete: "Supprimer",
    deleting: "Suppression...",
    error: "Une erreur est survenue",
    categoryName: "Nom de la catégorie",
    categoryNamePlaceholder: "Ex: Meubles",
    description: "Description",
    descriptionPlaceholder: "Décrivez cette catégorie...",
    slug: "Slug (URL)",
    parentCategory: "Catégorie parente",
    selectParentCategory: "Aucune (catégorie racine)",
    isActive: "Actif",
    isFeatured: "En vedette",
    validationError: "Veuillez vérifier les champs requis",
    requiredField: "Champ requis",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette catégorie?",
    cannotDelete: "Impossible de supprimer cette catégorie. Elle contient des produits ou des sous-catégories.",
    duplicateSlug: "Un slug identique existe déjà",
    loadingCategories: "Chargement...",
    autoTranslate: "Traduction automatique",
    autoTranslateDesc: "Traduire FR → EN/ES/AR",
  },
  en: {
    newCategory: "New Category",
    editCategory: "Edit Category",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting...",
    error: "An error occurred",
    categoryName: "Category Name",
    categoryNamePlaceholder: "Ex: Furniture",
    description: "Description",
    descriptionPlaceholder: "Describe this category...",
    slug: "Slug (URL)",
    parentCategory: "Parent Category",
    selectParentCategory: "None (Root Category)",
    isActive: "Active",
    isFeatured: "Featured",
    validationError: "Please check required fields",
    requiredField: "Required field",
    confirmDelete: "Are you sure you want to delete this category?",
    cannotDelete: "Cannot delete this category. It contains products or subcategories.",
    duplicateSlug: "A category with this slug already exists",
    loadingCategories: "Loading...",
    autoTranslate: "Auto translation",
    autoTranslateDesc: "Translate FR → EN/ES/AR",
  },
  es: {
    newCategory: "Nueva Categoría",
    editCategory: "Editar Categoría",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    error: "Ocurrió un error",
    categoryName: "Nombre de la Categoría",
    categoryNamePlaceholder: "Ej: Muebles",
    description: "Descripción",
    descriptionPlaceholder: "Describe esta categoría...",
    slug: "Slug (URL)",
    parentCategory: "Categoría Padre",
    selectParentCategory: "Ninguna (Categoría raíz)",
    isActive: "Activo",
    isFeatured: "Destacado",
    validationError: "Por favor verifica los campos requeridos",
    requiredField: "Campo requerido",
    confirmDelete: "¿Estás seguro de que deseas eliminar esta categoría?",
    cannotDelete: "No se puede eliminar esta categoría. Contiene productos o subcategorías.",
    duplicateSlug: "Ya existe una categoría con este slug",
    loadingCategories: "Cargando...",
    autoTranslate: "Traducción automática",
    autoTranslateDesc: "Traducir FR → EN/ES/AR",
  },
  ar: {
    newCategory: "فئة جديدة",
    editCategory: "تعديل الفئة",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    delete: "حذف",
    deleting: "جاري الحذف...",
    error: "حدث خطأ",
    categoryName: "اسم الفئة",
    categoryNamePlaceholder: "مثال: الأثاث",
    description: "الوصف",
    descriptionPlaceholder: "صف هذه الفئة...",
    slug: "الرابط المختصر",
    parentCategory: "الفئة الأب",
    selectParentCategory: "لا شيء (فئة جذر)",
    isActive: "نشط",
    isFeatured: "مميز",
    validationError: "يرجى التحقق من الحقول المطلوبة",
    requiredField: "حقل مطلوب",
    confirmDelete: "هل أنت متأكد من حذف هذه الفئة؟",
    cannotDelete: "لا يمكن حذف هذه الفئة. تحتوي على منتجات أو فئات فرعية.",
    duplicateSlug: "توجد فئة بهذا الرابط المختصر بالفعل",
    loadingCategories: "جاري التحميل...",
    autoTranslate: "ترجمة تلقائية",
    autoTranslateDesc: "ترجمة FR → EN/ES/AR",
  },
};

// ═══════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════

export default function CategoryEditPage({ params }: PageProps) {
  const locale = params.locale as string;
  const id = params.id;
  const isNew = id === "nouveau";
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Multilingual form state
  const [nameValues, setNameValues] = useState<MultilingualValues>({
    fr: "",
    en: "",
    es: "",
    ar: "",
  });
  const [descriptionValues, setDescriptionValues] = useState<MultilingualValues>({
    fr: "",
    en: "",
    es: "",
    ar: "",
  });

  // Form state
  const [form, setForm] = useState({
    slug: "",
    parentId: "",
    isActive: true,
    isFeatured: false,
    order: 0,
  });

  useEffect(() => {
    fetchParentCategories();
    if (!isNew) {
      fetchCategory();
    }
  }, [id, isNew]);

  const fetchParentCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(
        `/api/categories?isActive=true&limit=999&locale=${locale}`
      );
      if (res.ok) {
        const data = await res.json();
        // Filter out current category from parent list
        const categories = (data.data || data.pagination?.data || []).filter(
          (cat: Category) => cat.id !== id
        );
        setParentCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${id}`);
      if (res.ok) {
        const data = await res.json();
        const category = data.data || data;

        // Build multilingual values
        const namesByLocale = { fr: "", en: "", es: "", ar: "" };
        const descriptionsByLocale = { fr: "", en: "", es: "", ar: "" };

        (category.translations || []).forEach((t: CategoryTranslation) => {
          namesByLocale[t.locale as keyof MultilingualValues] = t.name;
          descriptionsByLocale[t.locale as keyof MultilingualValues] =
            t.description || "";
        });

        setNameValues(namesByLocale);
        setDescriptionValues(descriptionsByLocale);

        setForm({
          slug: category.slug || "",
          parentId: category.parentId || "",
          isActive: category.isActive ?? true,
          isFeatured: category.isFeatured ?? false,
          order: category.order ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (values: MultilingualValues) => {
    setNameValues(values);
    // Auto-generate slug from French name if empty
    if (values.fr && !form.slug) {
      setForm((prev) => ({ ...prev, slug: generateSlug(values.fr) }));
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!nameValues.fr.trim()) {
      errors.push(t.categoryName + " (FR): " + t.requiredField);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/${locale}/admin/ecommerce/categories`);
      } else {
        const data = await res.json();
        setDeleteError(
          data.error || t.cannotDelete
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteError(t.error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      alert(t.validationError);
      return;
    }

    setSaving(true);
    setDeleteError(null);

    try {
      const url = isNew ? "/api/categories" : `/api/categories/${id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        slug: form.slug,
        parentId: form.parentId || null,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        order: form.order,
        translations: [
          {
            locale: "fr",
            name: nameValues.fr,
            description: descriptionValues.fr,
          },
          {
            locale: "en",
            name: nameValues.en,
            description: descriptionValues.en,
          },
          {
            locale: "es",
            name: nameValues.es,
            description: descriptionValues.es,
          },
          {
            locale: "ar",
            name: nameValues.ar,
            description: descriptionValues.ar,
          },
        ],
      };

      console.log("📤 Sending category payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log("✅ Category saved:", responseData);
        router.push(`/${locale}/admin/ecommerce/categories`);
      } else {
        console.error("❌ Error response:", responseData);
        setDeleteError(responseData.error || responseData.details || t.error);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setDeleteError(t.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/ecommerce/categories`}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? t.newCategory : t.editCategory}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              E-Commerce / Catégories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors dark:border-red-700 dark:hover:bg-red-900/20"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? t.deleting : t.delete}
            </button>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
            {t.validationError}
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Error */}
      {deleteError && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">{deleteError}</p>
        </div>
      )}

      {/* Auto-Translate Section */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">
            {t.autoTranslate}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t.autoTranslateDesc}
          </p>
        </div>
        <TranslateAllButton
          fields={[
            { fieldName: "name", values: nameValues, onChange: setNameValues },
            {
              fieldName: "description",
              values: descriptionValues,
              onChange: setDescriptionValues,
            },
          ]}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name (Multilingual) */}
        <MultilingualInput
          label={t.categoryName}
          required
          placeholder={t.categoryNamePlaceholder}
          values={nameValues}
          onChange={handleNameChange}
        />

        {/* Description (Multilingual) */}
        <MultilingualInput
          label={t.description}
          type="textarea"
          rows={4}
          placeholder={t.descriptionPlaceholder}
          values={descriptionValues}
          onChange={setDescriptionValues}
        />

        {/* Slug & Parent Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.slug}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.parentCategory}
            </label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                {loadingCategories
                  ? t.loadingCategories
                  : t.selectParentCategory}
              </option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {/* Get name from translations or use slug as fallback */}
                  {cat.translations?.find((tr) => tr.locale === "fr")?.name ||
                    cat.translations?.[0]?.name ||
                    cat.slug}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded border-gray-300"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {t.isActive}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
              className="w-4 h-4 text-amber-600 rounded border-gray-300"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {t.isFeatured}
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? t.saving : t.save}
          </button>
          <Link
            href={`/${locale}/admin/ecommerce/categories`}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
