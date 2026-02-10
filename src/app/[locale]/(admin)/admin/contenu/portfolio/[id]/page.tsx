"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X, Camera, CheckCircle, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

interface PageProps {
  params: { locale: string; id: string };
}

interface PortfolioCategory {
  id: string;
  nameFr: string;
  nameEn: string | null;
  nameEs: string | null;
  nameAr: string | null;
  slug: string;
  icon: string | null;
}

// Icons for quick category creation
const CATEGORY_ICONS = ["🍳", "👔", "🚪", "🪟", "🪜", "🧱", "🏠", "🕌", "🪑", "🎨", "🖥️", "🏨", "🔨", "🪵", "📐", "🛠️", "🪚", "🎯"];

const translations = {
  fr: {
    newProject: "Nouveau Projet",
    editProject: "Modifier le Projet",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    category: "Catégorie",
    selectCategory: "Sélectionner une catégorie",
    location: "Lieu",
    year: "Année",
    duration: "Durée",
    client: "Client",
    coverImage: "Image de couverture",
    slug: "Slug (URL)",
    isActive: "Actif",
    isFeatured: "En vedette (page d'accueil)",
    error: "Une erreur est survenue",
    cancel: "Annuler",
    autoTranslate: "Traduction automatique",
    autoTranslateDesc: "Traduire FR → EN/ES/AR",
    newCategory: "Nouvelle catégorie",
    addCategory: "Ajouter",
    categoryNameFr: "Nom (Français)",
    categoryNameEn: "Nom (English)",
    categoryNameEs: "Nom (Español)",
    categoryNameAr: "Nom (العربية)",
    categoryIcon: "Icône",
    categorySlug: "Slug",
    createCategory: "Créer la catégorie",
    creating: "Création...",
    noCategoriesWarning: "Aucune catégorie disponible. Cliquez sur \"+\" pour en créer une.",
    loadingCategories: "Chargement...",
    // Tabs
    tabInfo: "Informations",
    tabBefore: "AVANT (Travaux)",
    tabAfter: "APRÈS (Résultat)",
    // Before section
    beforeTitle: "Photos AVANT - Travaux en cours",
    beforeDesc: "Montrez l'état initial du chantier, les travaux en cours",
    beforeDescLabel: "Description des travaux (état initial)",
    beforeDescPlaceholder: "Décrivez l'état initial, les défis rencontrés...",
    beforeImagesLabel: "Photos AVANT",
    // After section
    afterTitle: "Photos APRÈS - Résultat final",
    afterDesc: "Montrez le résultat final, le travail terminé, les finitions",
    afterDescLabel: "Description du résultat final",
    afterDescPlaceholder: "Décrivez le résultat final, les finitions...",
    afterImagesLabel: "Photos APRÈS",
    images: "images",
    deleteProject: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.",
    deleting: "Suppression...",
  },
  en: {
    newProject: "New Project",
    editProject: "Edit Project",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    category: "Category",
    selectCategory: "Select a category",
    location: "Location",
    year: "Year",
    duration: "Duration",
    client: "Client",
    coverImage: "Cover Image",
    slug: "Slug (URL)",
    isActive: "Active",
    isFeatured: "Featured (homepage)",
    error: "An error occurred",
    cancel: "Cancel",
    autoTranslate: "Auto translation",
    autoTranslateDesc: "Translate FR → EN/ES/AR",
    newCategory: "New category",
    addCategory: "Add",
    categoryNameFr: "Name (French)",
    categoryNameEn: "Name (English)",
    categoryNameEs: "Name (Spanish)",
    categoryNameAr: "Name (Arabic)",
    categoryIcon: "Icon",
    categorySlug: "Slug",
    createCategory: "Create category",
    creating: "Creating...",
    noCategoriesWarning: "No categories available. Click \"+\" to create one.",
    loadingCategories: "Loading...",
    // Tabs
    tabInfo: "Information",
    tabBefore: "BEFORE (Works)",
    tabAfter: "AFTER (Result)",
    // Before section
    beforeTitle: "BEFORE Photos - Work in Progress",
    beforeDesc: "Show the initial state, work in progress",
    beforeDescLabel: "Description of work (initial state)",
    beforeDescPlaceholder: "Describe the initial state, challenges...",
    beforeImagesLabel: "BEFORE Photos",
    // After section
    afterTitle: "AFTER Photos - Final Result",
    afterDesc: "Show the final result, finished work, finishes",
    afterDescLabel: "Description of the final result",
    afterDescPlaceholder: "Describe the final result, finishes...",
    afterImagesLabel: "AFTER Photos",
    images: "images",
    deleteProject: "Delete",
    confirmDelete: "Are you sure you want to delete this project? This action cannot be undone.",
    deleting: "Deleting...",
  },
  es: {
    newProject: "Nuevo Proyecto",
    editProject: "Editar Proyecto",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    category: "Categoría",
    selectCategory: "Seleccionar categoría",
    location: "Ubicación",
    year: "Año",
    duration: "Duración",
    client: "Cliente",
    coverImage: "Imagen de portada",
    slug: "Slug (URL)",
    isActive: "Activo",
    isFeatured: "Destacado (página principal)",
    error: "Ocurrió un error",
    cancel: "Cancelar",
    autoTranslate: "Traducción automática",
    autoTranslateDesc: "Traducir FR → EN/ES/AR",
    newCategory: "Nueva categoría",
    addCategory: "Añadir",
    categoryNameFr: "Nombre (Francés)",
    categoryNameEn: "Nombre (Inglés)",
    categoryNameEs: "Nombre (Español)",
    categoryNameAr: "Nombre (Árabe)",
    categoryIcon: "Icono",
    categorySlug: "Slug",
    createCategory: "Crear categoría",
    creating: "Creando...",
    noCategoriesWarning: "No hay categorías. Haga clic en \"+\" para crear una.",
    loadingCategories: "Cargando...",
    // Tabs
    tabInfo: "Información",
    tabBefore: "ANTES (Obras)",
    tabAfter: "DESPUÉS (Resultado)",
    // Before section
    beforeTitle: "Fotos ANTES - Obras en curso",
    beforeDesc: "Muestre el estado inicial, las obras en curso",
    beforeDescLabel: "Descripción de las obras (estado inicial)",
    beforeDescPlaceholder: "Describa el estado inicial, los desafíos...",
    beforeImagesLabel: "Fotos ANTES",
    // After section
    afterTitle: "Fotos DESPUÉS - Resultado final",
    afterDesc: "Muestre el resultado final, el trabajo terminado",
    afterDescLabel: "Descripción del resultado final",
    afterDescPlaceholder: "Describa el resultado final, los acabados...",
    afterImagesLabel: "Fotos DESPUÉS",
    images: "imágenes",
    deleteProject: "Eliminar",
    confirmDelete: "¿Estás seguro de eliminar este proyecto? Esta acción es irreversible.",
    deleting: "Eliminando...",
  },
  ar: {
    newProject: "مشروع جديد",
    editProject: "تعديل المشروع",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    category: "الفئة",
    selectCategory: "اختر فئة",
    location: "الموقع",
    year: "السنة",
    duration: "المدة",
    client: "العميل",
    coverImage: "صورة الغلاف",
    slug: "الرابط المختصر",
    isActive: "نشط",
    isFeatured: "مميز (الصفحة الرئيسية)",
    error: "حدث خطأ",
    cancel: "إلغاء",
    autoTranslate: "ترجمة تلقائية",
    autoTranslateDesc: "ترجمة FR → EN/ES/AR",
    newCategory: "فئة جديدة",
    addCategory: "إضافة",
    categoryNameFr: "الاسم (فرنسي)",
    categoryNameEn: "الاسم (إنجليزي)",
    categoryNameEs: "الاسم (إسباني)",
    categoryNameAr: "الاسم (عربي)",
    categoryIcon: "الأيقونة",
    categorySlug: "الرابط",
    createCategory: "إنشاء الفئة",
    creating: "جاري الإنشاء...",
    noCategoriesWarning: "لا توجد فئات. انقر على \"+\" لإنشاء واحدة.",
    loadingCategories: "جاري التحميل...",
    // Tabs
    tabInfo: "المعلومات",
    tabBefore: "قبل (الأشغال)",
    tabAfter: "بعد (النتيجة)",
    // Before section
    beforeTitle: "صور قبل - الأشغال الجارية",
    beforeDesc: "أظهر الحالة الأولية، الأشغال الجارية",
    beforeDescLabel: "وصف الأشغال (الحالة الأولية)",
    beforeDescPlaceholder: "صف الحالة الأولية، التحديات...",
    beforeImagesLabel: "صور قبل",
    // After section
    afterTitle: "صور بعد - النتيجة النهائية",
    afterDesc: "أظهر النتيجة النهائية، العمل المنجز",
    afterDescLabel: "وصف النتيجة النهائية",
    afterDescPlaceholder: "صف النتيجة النهائية، التشطيبات...",
    afterImagesLabel: "صور بعد",
    images: "صور",
    deleteProject: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.",
    deleting: "جاري الحذف...",
  },
};

export default function PortfolioEditPage({ params }: PageProps) {
  const locale = params.locale as string;
  const id = params.id;
  const isNew = id === "new";
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "before" | "after">("info");

  // Quick Add Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    nameFr: "",
    nameEn: "",
    nameEs: "",
    nameAr: "",
    icon: "🔨",
    slug: "",
  });

  // Form state with multilingual values
  const [titleValues, setTitleValues] = useState({ fr: "", en: "", es: "", ar: "" });
  const [descriptionValues, setDescriptionValues] = useState({ fr: "", en: "", es: "", ar: "" });
  const [beforeDescValues, setBeforeDescValues] = useState({ fr: "", en: "", es: "", ar: "" });
  const [afterDescValues, setAfterDescValues] = useState({ fr: "", en: "", es: "", ar: "" });

  const [form, setForm] = useState({
    categoryId: "",
    location: "",
    year: new Date().getFullYear(),
    duration: "",
    client: "",
    coverImage: "",
    images: [] as string[],
    beforeImages: [] as string[],
    afterImages: [] as string[],
    slug: "",
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProject();
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/cms/portfolio-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/cms/portfolio/${id}`);
      if (res.ok) {
        const data = await res.json();
        const project = data.project || data;

        setTitleValues({
          fr: project.titleFr || "",
          en: project.titleEn || "",
          es: project.titleEs || "",
          ar: project.titleAr || "",
        });

        setDescriptionValues({
          fr: project.descriptionFr || "",
          en: project.descriptionEn || "",
          es: project.descriptionEs || "",
          ar: project.descriptionAr || "",
        });

        setBeforeDescValues({
          fr: project.beforeDescFr || "",
          en: project.beforeDescEn || "",
          es: project.beforeDescEs || "",
          ar: project.beforeDescAr || "",
        });

        setAfterDescValues({
          fr: project.afterDescFr || "",
          en: project.afterDescEn || "",
          es: project.afterDescEs || "",
          ar: project.afterDescAr || "",
        });

        setForm({
          categoryId: project.categoryId || "",
          location: project.location || "",
          year: project.year || new Date().getFullYear(),
          duration: project.duration || "",
          client: project.client || "",
          coverImage: project.coverImage || "",
          images: project.images || [],
          beforeImages: project.beforeImages || [],
          afterImages: project.afterImages || [],
          slug: project.slug || "",
          isActive: project.isActive ?? true,
          isFeatured: project.isFeatured ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
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

  const handleTitleChange = (values: typeof titleValues) => {
    setTitleValues(values);
    // Auto-generate slug from French title if empty
    if (values.fr && !form.slug) {
      setForm(prev => ({ ...prev, slug: generateSlug(values.fr) }));
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // QUICK ADD CATEGORY
  // ═══════════════════════════════════════════════════════════════

  const handleQuickAddCategory = async () => {
    if (!newCategory.nameFr.trim()) {
      alert(locale === "fr" ? "Le nom en français est requis" : "French name is required");
      return;
    }

    setSavingCategory(true);

    try {
      const payload = {
        nameFr: newCategory.nameFr,
        nameEn: newCategory.nameEn || null,
        nameEs: newCategory.nameEs || null,
        nameAr: newCategory.nameAr || null,
        icon: newCategory.icon,
        slug: newCategory.slug || generateSlug(newCategory.nameFr),
        isActive: true,
      };

      const res = await fetch("/api/cms/portfolio-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.category || data;

        // Add to categories list
        setCategories(prev => [...prev, created]);

        // Select the new category
        setForm(prev => ({ ...prev, categoryId: created.id }));

        // Close modal and reset
        setShowCategoryModal(false);
        setNewCategory({
          nameFr: "",
          nameEn: "",
          nameEs: "",
          nameAr: "",
          icon: "🔨",
          slug: "",
        });

        console.log("✅ Category created:", created.nameFr);
      } else {
        const error = await res.json();
        alert(error.error || error.message || t.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert(t.error);
    } finally {
      setSavingCategory(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // DELETE PROJECT
  // ═══════════════════════════════════════════════════════════════

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/cms/portfolio/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/${locale}/admin/contenu/portfolio`);
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(t.error);
    } finally {
      setDeleting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SUBMIT PROJECT
  // ═══════════════════════════════════════════════════════════════

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/cms/portfolio" : `/api/cms/portfolio/${id}`;
      const method = isNew ? "POST" : "PUT";

      const payload = {
        // Title
        titleFr: titleValues.fr,
        titleEn: titleValues.en,
        titleEs: titleValues.es,
        titleAr: titleValues.ar,
        // Description
        descriptionFr: descriptionValues.fr,
        descriptionEn: descriptionValues.en,
        descriptionEs: descriptionValues.es,
        descriptionAr: descriptionValues.ar,
        // Before
        beforeDescFr: beforeDescValues.fr,
        beforeDescEn: beforeDescValues.en,
        beforeDescEs: beforeDescValues.es,
        beforeDescAr: beforeDescValues.ar,
        // After
        afterDescFr: afterDescValues.fr,
        afterDescEn: afterDescValues.en,
        afterDescEs: afterDescValues.es,
        afterDescAr: afterDescValues.ar,
        ...form,
      };

      console.log("📤 Sending payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        console.log("✅ Project saved:", responseData);
        router.push(`/${locale}/admin/contenu/portfolio`);
      } else {
        console.error("❌ Error response:", responseData);
        alert(responseData.error || responseData.details || t.error);
      }
    } catch (error) {
      console.error("Error saving project:", error);
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
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/contenu/portfolio`}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? t.newProject : t.editProject}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Portfolio / Réalisations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? t.deleting : t.deleteProject}
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

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "info"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <FileText className="w-4 h-4" />
          {t.tabInfo}
        </button>
        <button
          onClick={() => setActiveTab("before")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "before"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <Camera className="w-4 h-4" />
          {t.tabBefore}
          {form.beforeImages.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
              {form.beforeImages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("after")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "after"
              ? "text-amber-600 border-amber-600"
              : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {t.tabAfter}
          {form.afterImages.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
              {form.afterImages.length}
            </span>
          )}
        </button>
      </div>

      {/* Auto-Translate Section */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">{t.autoTranslate}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{t.autoTranslateDesc}</p>
        </div>
        <TranslateAllButton
          fields={[
            { fieldName: "title", values: titleValues, onChange: setTitleValues },
            { fieldName: "description", values: descriptionValues, onChange: setDescriptionValues },
            { fieldName: "beforeDesc", values: beforeDescValues, onChange: setBeforeDescValues },
            { fieldName: "afterDesc", values: afterDescValues, onChange: setAfterDescValues },
          ]}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: INFORMATION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - 4 Languages */}
          <MultilingualInput
            label="Titre du projet"
            required
            placeholder="Ex: Cuisine moderne en chêne"
            values={titleValues}
            onChange={handleTitleChange}
          />

          {/* Description - 4 Languages */}
          <MultilingualInput
            label="Description générale"
            type="textarea"
            rows={4}
            placeholder="Décrivez le projet..."
            values={descriptionValues}
            onChange={setDescriptionValues}
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.category}
            </label>
            <div className="flex gap-2">
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">
                  {loadingCategories ? t.loadingCategories : t.selectCategory}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.nameFr}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                title={t.newCategory}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {!loadingCategories && categories.length === 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ {t.noCategoriesWarning}
              </p>
            )}
          </div>

          {/* Location, Year, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.location}
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Marrakech"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.year}
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                min={2000}
                max={2100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.duration}
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="3 semaines"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.client}
            </label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="Nom du client (optionnel)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.coverImage}
            </label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm({ ...form, coverImage: url })}
              folder="projects"
              locale={locale}
              aspectRatio="video"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.slug}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">/portfolio/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.isActive}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-gray-300"
              />
              <span className="text-gray-700 dark:text-gray-300">{t.isFeatured}</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t.saving : t.save}
            </button>
            <Link
              href={`/${locale}/admin/contenu/portfolio`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: BEFORE (AVANT - Travaux) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "before" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {t.beforeTitle}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {t.beforeDesc}
            </p>
          </div>

          {/* Before Description */}
          <MultilingualInput
            label={t.beforeDescLabel}
            type="textarea"
            rows={3}
            placeholder={t.beforeDescPlaceholder}
            values={beforeDescValues}
            onChange={setBeforeDescValues}
          />

          {/* Before Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.beforeImagesLabel} ({form.beforeImages.length} {t.images})
            </label>
            <MultiImageUpload
              value={form.beforeImages}
              onChange={(urls) => setForm({ ...form, beforeImages: urls })}
              folder="projects/before"
              maxImages={30}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB: AFTER (APRÈS - Résultat) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "after" && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t.afterTitle}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t.afterDesc}
            </p>
          </div>

          {/* After Description */}
          <MultilingualInput
            label={t.afterDescLabel}
            type="textarea"
            rows={3}
            placeholder={t.afterDescPlaceholder}
            values={afterDescValues}
            onChange={setAfterDescValues}
          />

          {/* After Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.afterImagesLabel} ({form.afterImages.length} {t.images})
            </label>
            <MultiImageUpload
              value={form.afterImages}
              onChange={(urls) => setForm({ ...form, afterImages: urls })}
              folder="projects/after"
              maxImages={30}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* QUICK ADD CATEGORY MODAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.newCategory}</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Name FR (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.categoryNameFr} *
                </label>
                <input
                  type="text"
                  value={newCategory.nameFr}
                  onChange={(e) => setNewCategory({
                    ...newCategory,
                    nameFr: e.target.value,
                    slug: generateSlug(e.target.value),
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Cuisines"
                  autoFocus
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.categoryIcon}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                        newCategory.icon === icon
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleQuickAddCategory}
                disabled={savingCategory || !newCategory.nameFr.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingCategory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.creating}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t.createCategory}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
