"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type UploadedImage } from "../ImageUploader";
import { TranslationTabs, type LocaleCode, type TranslationData } from "../TranslationTabs";
import {
  Save,
  Loader2,
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Layers,
  User,
  Quote,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToProjects: "Retour aux realisations",
    newProject: "Nouvelle realisation",
    editProject: "Modifier la realisation",
    basicInfo: "Informations de base",
    slug: "Slug (URL)",
    slugPlaceholder: "cuisine-moderne-casablanca",
    category: "Categorie",
    selectCategory: "Selectionner une categorie",
    featured: "Mise en avant",
    featuredHelp: "Afficher sur la page d'accueil",
    details: "Details du projet",
    clientName: "Nom du client",
    location: "Localisation",
    year: "Annee",
    duration: "Duree",
    durationPlaceholder: "3 mois",
    woodType: "Type de bois",
    woodTypePlaceholder: "Chene, Noyer",
    surface: "Surface",
    surfacePlaceholder: "150 m²",
    translations: "Traductions",
    gallery: "Galerie d'images",
    testimonial: "Temoignage client",
    testimonialQuote: "Citation",
    testimonialQuotePlaceholder: "Ce projet a depasse nos attentes...",
    testimonialName: "Nom du client",
    testimonialRole: "Role/Titre",
    testimonialRolePlaceholder: "Proprietaire",
    settings: "Parametres",
    visibility: "Visibilite",
    published: "Publie",
    draft: "Brouillon",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    title: "Titre",
    description: "Description",
    challenge: "Defi",
    solution: "Solution",
    titlePlaceholder: "Cuisine moderne a Casablanca",
    descriptionPlaceholder: "Description du projet...",
    challengePlaceholder: "Defi a relever...",
    solutionPlaceholder: "Solution apportee...",
  },
  en: {
    backToProjects: "Back to projects",
    newProject: "New Project",
    editProject: "Edit Project",
    basicInfo: "Basic Information",
    slug: "Slug (URL)",
    slugPlaceholder: "modern-kitchen-casablanca",
    category: "Category",
    selectCategory: "Select a category",
    featured: "Featured",
    featuredHelp: "Display on homepage",
    details: "Project Details",
    clientName: "Client Name",
    location: "Location",
    year: "Year",
    duration: "Duration",
    durationPlaceholder: "3 months",
    woodType: "Wood Type",
    woodTypePlaceholder: "Oak, Walnut",
    surface: "Surface",
    surfacePlaceholder: "150 m²",
    translations: "Translations",
    gallery: "Image Gallery",
    testimonial: "Client Testimonial",
    testimonialQuote: "Quote",
    testimonialQuotePlaceholder: "This project exceeded our expectations...",
    testimonialName: "Client Name",
    testimonialRole: "Role/Title",
    testimonialRolePlaceholder: "Owner",
    settings: "Settings",
    visibility: "Visibility",
    published: "Published",
    draft: "Draft",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    title: "Title",
    description: "Description",
    challenge: "Challenge",
    solution: "Solution",
    titlePlaceholder: "Modern kitchen in Casablanca",
    descriptionPlaceholder: "Project description...",
    challengePlaceholder: "Challenge faced...",
    solutionPlaceholder: "Solution provided...",
  },
  es: {
    backToProjects: "Volver a proyectos",
    newProject: "Nuevo Proyecto",
    editProject: "Editar Proyecto",
    basicInfo: "Informacion Basica",
    slug: "Slug (URL)",
    slugPlaceholder: "cocina-moderna-casablanca",
    category: "Categoria",
    selectCategory: "Seleccionar categoria",
    featured: "Destacado",
    featuredHelp: "Mostrar en pagina principal",
    details: "Detalles del Proyecto",
    clientName: "Nombre del Cliente",
    location: "Ubicacion",
    year: "Ano",
    duration: "Duracion",
    durationPlaceholder: "3 meses",
    woodType: "Tipo de Madera",
    woodTypePlaceholder: "Roble, Nogal",
    surface: "Superficie",
    surfacePlaceholder: "150 m²",
    translations: "Traducciones",
    gallery: "Galeria de Imagenes",
    testimonial: "Testimonio del Cliente",
    testimonialQuote: "Cita",
    testimonialQuotePlaceholder: "Este proyecto supero nuestras expectativas...",
    testimonialName: "Nombre del Cliente",
    testimonialRole: "Cargo/Titulo",
    testimonialRolePlaceholder: "Propietario",
    settings: "Configuracion",
    visibility: "Visibilidad",
    published: "Publicado",
    draft: "Borrador",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    title: "Titulo",
    description: "Descripcion",
    challenge: "Desafio",
    solution: "Solucion",
    titlePlaceholder: "Cocina moderna en Casablanca",
    descriptionPlaceholder: "Descripcion del proyecto...",
    challengePlaceholder: "Desafio enfrentado...",
    solutionPlaceholder: "Solucion proporcionada...",
  },
  ar: {
    backToProjects: "العودة للمشاريع",
    newProject: "مشروع جديد",
    editProject: "تعديل المشروع",
    basicInfo: "المعلومات الأساسية",
    slug: "الرابط",
    slugPlaceholder: "مطبخ-عصري-الدار-البيضاء",
    category: "الفئة",
    selectCategory: "اختر فئة",
    featured: "مميز",
    featuredHelp: "عرض في الصفحة الرئيسية",
    details: "تفاصيل المشروع",
    clientName: "اسم العميل",
    location: "الموقع",
    year: "السنة",
    duration: "المدة",
    durationPlaceholder: "3 أشهر",
    woodType: "نوع الخشب",
    woodTypePlaceholder: "البلوط، الجوز",
    surface: "المساحة",
    surfacePlaceholder: "150 متر مربع",
    translations: "الترجمات",
    gallery: "معرض الصور",
    testimonial: "شهادة العميل",
    testimonialQuote: "الاقتباس",
    testimonialQuotePlaceholder: "هذا المشروع تجاوز توقعاتنا...",
    testimonialName: "اسم العميل",
    testimonialRole: "المنصب",
    testimonialRolePlaceholder: "المالك",
    settings: "الإعدادات",
    visibility: "الظهور",
    published: "منشور",
    draft: "مسودة",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    title: "العنوان",
    description: "الوصف",
    challenge: "التحدي",
    solution: "الحل",
    titlePlaceholder: "مطبخ عصري في الدار البيضاء",
    descriptionPlaceholder: "وصف المشروع...",
    challengePlaceholder: "التحدي الذي واجهناه...",
    solutionPlaceholder: "الحل المقدم...",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Category {
  id: string;
  translations: { name: string; locale: string }[];
}

interface ProjectTranslationData extends TranslationData {
  title: string;
  description: string;
  challenge: string;
  solution: string;
}

interface TestimonialData {
  quote: string;
  name: string;
  role: string;
}

interface ProjectFormData {
  slug: string;
  categoryId: string;
  featured: boolean;
  isPublished: boolean;
  client: string;
  location: string;
  year: number | null;
  duration: string;
  woodType: string;
  surface: string;
  translations: Record<LocaleCode, ProjectTranslationData>;
  images: UploadedImage[];
  testimonial: TestimonialData;
}

interface ProjectFormProps {
  project?: ProjectFormData & { id: string };
  categories: Category[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Project Form Component
// ═══════════════════════════════════════════════════════════

function createEmptyProjectTranslations(): Record<LocaleCode, ProjectTranslationData> {
  return {
    fr: { name: "", description: "", title: "", challenge: "", solution: "" },
    en: { name: "", description: "", title: "", challenge: "", solution: "" },
    es: { name: "", description: "", title: "", challenge: "", solution: "" },
    ar: { name: "", description: "", title: "", challenge: "", solution: "" },
  };
}

export function ProjectForm({ project, categories, locale }: ProjectFormProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const isEdit = !!project;

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    slug: project?.slug ?? "",
    categoryId: project?.categoryId ?? "",
    featured: project?.featured ?? false,
    isPublished: project?.isPublished ?? false,
    client: project?.client ?? "",
    location: project?.location ?? "",
    year: project?.year ?? new Date().getFullYear(),
    duration: project?.duration ?? "",
    woodType: project?.woodType ?? "",
    surface: project?.surface ?? "",
    translations: project?.translations ?? createEmptyProjectTranslations(),
    images: project?.images ?? [],
    testimonial: project?.testimonial ?? { quote: "", name: "", role: "" },
  });

  const [isSaving, setIsSaving] = useState(false);

  // Handle translation change
  const handleTranslationChange = (localeCode: LocaleCode, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [localeCode]: {
          ...prev.translations[localeCode],
          [field]: value,
        },
      },
    }));
  };

  // Handle image change
  const handleImageChange = (images: UploadedImage[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = isEdit ? `/api/projects/${project.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/${locale}/admin/realisations`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get category name for display
  const getCategoryName = (cat: Category) => {
    const trans = cat.translations.find((t) => t.locale === locale) ?? cat.translations[0];
    return trans?.name ?? "";
  };

  // Translation fields configuration
  const translationFields = [
    {
      name: "title",
      type: "text" as const,
      required: true,
      label: { fr: t.title, en: t.title, es: t.title, ar: t.title },
      placeholder: {
        fr: translations.fr.titlePlaceholder,
        en: translations.en.titlePlaceholder,
        es: translations.es.titlePlaceholder,
        ar: translations.ar.titlePlaceholder,
      },
    },
    {
      name: "description",
      type: "textarea" as const,
      required: false,
      label: { fr: t.description, en: t.description, es: t.description, ar: t.description },
      placeholder: {
        fr: translations.fr.descriptionPlaceholder,
        en: translations.en.descriptionPlaceholder,
        es: translations.es.descriptionPlaceholder,
        ar: translations.ar.descriptionPlaceholder,
      },
    },
    {
      name: "challenge",
      type: "textarea" as const,
      required: false,
      label: { fr: t.challenge, en: t.challenge, es: t.challenge, ar: t.challenge },
      placeholder: {
        fr: translations.fr.challengePlaceholder,
        en: translations.en.challengePlaceholder,
        es: translations.es.challengePlaceholder,
        ar: translations.ar.challengePlaceholder,
      },
    },
    {
      name: "solution",
      type: "textarea" as const,
      required: false,
      label: { fr: t.solution, en: t.solution, es: t.solution, ar: t.solution },
      placeholder: {
        fr: translations.fr.solutionPlaceholder,
        en: translations.en.solutionPlaceholder,
        es: translations.es.solutionPlaceholder,
        ar: translations.ar.solutionPlaceholder,
      },
    },
  ];

  return (
    <form onSubmit={(e) => void handleSubmit(e)} dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToProjects}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? t.editProject : t.newProject}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.saving}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Briefcase className="h-5 w-5 text-amber-600" />
              {t.basicInfo}
            </h2>
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
                  {t.category}
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <MapPin className="h-5 w-5 text-amber-600" />
              {t.details}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.clientName}
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.location}
                </label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.year}
                </label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.year ?? ""}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                    min="2000"
                    max="2099"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.duration}
                </label>
                <div className="relative">
                  <Clock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder={t.durationPlaceholder}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.woodType}
                </label>
                <input
                  type="text"
                  value={formData.woodType}
                  onChange={(e) => setFormData({ ...formData, woodType: e.target.value })}
                  placeholder={t.woodTypePlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.surface}
                </label>
                <input
                  type="text"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                  placeholder={t.surfacePlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Translations */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Layers className="h-5 w-5 text-amber-600" />
              {t.translations}
            </h2>
            <TranslationTabs
              translations={formData.translations}
              onChange={handleTranslationChange}
              fields={translationFields}
            />
          </div>

          {/* Gallery */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Layers className="h-5 w-5 text-amber-600" />
              {t.gallery}
            </h2>
            <ImageUploader
              images={formData.images}
              onChange={handleImageChange}
              maxImages={20}
              locale={locale}
            />
          </div>

          {/* Testimonial */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Quote className="h-5 w-5 text-amber-600" />
              {t.testimonial}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.testimonialQuote}
                </label>
                <textarea
                  value={formData.testimonial.quote}
                  onChange={(e) => setFormData({
                    ...formData,
                    testimonial: { ...formData.testimonial, quote: e.target.value }
                  })}
                  placeholder={t.testimonialQuotePlaceholder}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.testimonialName}
                  </label>
                  <input
                    type="text"
                    value={formData.testimonial.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      testimonial: { ...formData.testimonial, name: e.target.value }
                    })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.testimonialRole}
                  </label>
                  <input
                    type="text"
                    value={formData.testimonial.role}
                    onChange={(e) => setFormData({
                      ...formData,
                      testimonial: { ...formData.testimonial, role: e.target.value }
                    })}
                    placeholder={t.testimonialRolePlaceholder}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Settings className="h-5 w-5 text-amber-600" />
              {t.settings}
            </h2>
            <div className="space-y-4">
              {/* Visibility */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.visibility}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublished}
                      onChange={() => setFormData({ ...formData, isPublished: true })}
                      className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.published}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublished}
                      onChange={() => setFormData({ ...formData, isPublished: false })}
                      className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.draft}</span>
                  </label>
                </div>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                {formData.featured ? (
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.featured}</span>
              </label>
              <p className="text-xs text-gray-500">{t.featuredHelp}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
