"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import MultilingualInput from "@/components/admin/MultilingualInput";

interface PageProps {
  params: { locale: string; id: string };
}

const ICONS = ["🔨", "🚪", "🪟", "🪜", "🍳", "👔", "🪑", "🪵", "🛠️", "✏️", "🏠", "🕌", "🎨", "🧱", "📐", "🪚"];

const translations = {
  fr: {
    newCategory: "Nouvelle Catégorie",
    editCategory: "Modifier la Catégorie",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    slug: "Slug (URL)",
    icon: "Icône",
    isActive: "Catégorie active",
    cancel: "Annuler",
    error: "Une erreur est survenue",
  },
  en: {
    newCategory: "New Category",
    editCategory: "Edit Category",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    slug: "Slug (URL)",
    icon: "Icon",
    isActive: "Active category",
    cancel: "Cancel",
    error: "An error occurred",
  },
  es: {
    newCategory: "Nueva Categoría",
    editCategory: "Editar Categoría",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    slug: "Slug (URL)",
    icon: "Icono",
    isActive: "Categoría activa",
    cancel: "Cancelar",
    error: "Ocurrió un error",
  },
  ar: {
    newCategory: "فئة جديدة",
    editCategory: "تعديل الفئة",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    slug: "الرابط المختصر",
    icon: "الأيقونة",
    isActive: "فئة نشطة",
    cancel: "إلغاء",
    error: "حدث خطأ",
  },
};

export default function CategoryEditPage({ params }: PageProps) {
  const locale = params.locale as string;
  const id = params.id;
  const isNew = id === "new";
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Multilingual name values
  const [nameValues, setNameValues] = useState({ fr: "", en: "", es: "", ar: "" });

  const [form, setForm] = useState({
    slug: "",
    icon: "🔨",
    isActive: true,
  });

  useEffect(() => {
    if (!isNew) {
      fetchCategory();
    }
  }, [id, isNew]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/cms/portfolio-categories/${id}`);
      if (res.ok) {
        const data = await res.json();
        const category = data.category || data;

        setNameValues({
          fr: category.nameFr || "",
          en: category.nameEn || "",
          es: category.nameEs || "",
          ar: category.nameAr || "",
        });

        setForm({
          slug: category.slug || "",
          icon: category.icon || "🔨",
          isActive: category.isActive ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (values: typeof nameValues) => {
    setNameValues(values);
    // Auto-generate slug from French name if empty
    if (values.fr && !form.slug) {
      setForm(prev => ({ ...prev, slug: generateSlug(values.fr) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew
        ? "/api/cms/portfolio-categories"
        : `/api/cms/portfolio-categories/${id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        nameFr: nameValues.fr,
        nameEn: nameValues.en,
        nameEs: nameValues.es,
        nameAr: nameValues.ar,
        ...form,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/${locale}/admin/contenu/portfolio/categories`);
      } else {
        const error = await res.json();
        alert(error.message || error.error || t.error);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert(t.error);
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
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/contenu/portfolio/categories`}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNew ? t.newCategory : t.editCategory}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name - 4 Languages with MultilingualInput */}
        <MultilingualInput
          label="Nom de la catégorie"
          required
          placeholder="Ex: Cuisines"
          values={nameValues}
          onChange={handleNameChange}
        />

        {/* Icon Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.icon}
          </label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                  form.icon === icon
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.slug}
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="cuisines"
          />
        </div>

        {/* Active */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="w-5 h-5 text-amber-600 rounded border-gray-300"
          />
          <span className="text-gray-700 dark:text-gray-300">{t.isActive}</span>
        </label>

        {/* Submit */}
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
            href={`/${locale}/admin/contenu/portfolio/categories`}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
