"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type UploadedImage } from "../ImageUploader";
import { TranslationTabs, type LocaleCode, type TranslationData } from "../TranslationTabs";
import { IconPicker } from "../IconPicker";
import {
  Save,
  Loader2,
  ArrowLeft,
  Wrench,
  DollarSign,
  Clock,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Plus,
  X,
  GripVertical,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToServices: "Retour aux services",
    newService: "Nouveau service",
    editService: "Modifier le service",
    basicInfo: "Informations de base",
    slug: "Slug (URL)",
    slugPlaceholder: "menuiserie-sur-mesure",
    icon: "Icone",
    image: "Image du service",
    pricing: "Tarification",
    priceFrom: "Prix a partir de (MAD)",
    priceTo: "Prix jusqu'a (MAD)",
    priceUnit: "Unite de prix",
    priceUnitPlaceholder: "par unite, par m²",
    duration: "Duree estimee",
    durationPlaceholder: "2-4 semaines",
    translations: "Traductions",
    settings: "Parametres",
    visibility: "Visibilite",
    published: "Publie",
    draft: "Brouillon",
    featured: "Service vedette",
    featuredHelp: "Afficher en priorite",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    name: "Nom du service",
    description: "Description",
    features: "Caracteristiques",
    process: "Processus de travail",
    namePlaceholder: "Menuiserie sur mesure",
    descriptionPlaceholder: "Description detaillee du service...",
    featuresPlaceholder: "Ajouter une caracteristique...",
    processPlaceholder: "Decrivez les etapes du processus...",
    addFeature: "Ajouter",
    noFeatures: "Aucune caracteristique",
  },
  en: {
    backToServices: "Back to services",
    newService: "New Service",
    editService: "Edit Service",
    basicInfo: "Basic Information",
    slug: "Slug (URL)",
    slugPlaceholder: "custom-woodworking",
    icon: "Icon",
    image: "Service Image",
    pricing: "Pricing",
    priceFrom: "Price from (MAD)",
    priceTo: "Price up to (MAD)",
    priceUnit: "Price Unit",
    priceUnitPlaceholder: "per unit, per m²",
    duration: "Estimated Duration",
    durationPlaceholder: "2-4 weeks",
    translations: "Translations",
    settings: "Settings",
    visibility: "Visibility",
    published: "Published",
    draft: "Draft",
    featured: "Featured Service",
    featuredHelp: "Display with priority",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    name: "Service Name",
    description: "Description",
    features: "Features",
    process: "Work Process",
    namePlaceholder: "Custom Woodworking",
    descriptionPlaceholder: "Detailed service description...",
    featuresPlaceholder: "Add a feature...",
    processPlaceholder: "Describe the process steps...",
    addFeature: "Add",
    noFeatures: "No features",
  },
  es: {
    backToServices: "Volver a servicios",
    newService: "Nuevo Servicio",
    editService: "Editar Servicio",
    basicInfo: "Informacion Basica",
    slug: "Slug (URL)",
    slugPlaceholder: "carpinteria-personalizada",
    icon: "Icono",
    image: "Imagen del Servicio",
    pricing: "Precios",
    priceFrom: "Precio desde (MAD)",
    priceTo: "Precio hasta (MAD)",
    priceUnit: "Unidad de Precio",
    priceUnitPlaceholder: "por unidad, por m²",
    duration: "Duracion Estimada",
    durationPlaceholder: "2-4 semanas",
    translations: "Traducciones",
    settings: "Configuracion",
    visibility: "Visibilidad",
    published: "Publicado",
    draft: "Borrador",
    featured: "Servicio Destacado",
    featuredHelp: "Mostrar con prioridad",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    name: "Nombre del Servicio",
    description: "Descripcion",
    features: "Caracteristicas",
    process: "Proceso de Trabajo",
    namePlaceholder: "Carpinteria Personalizada",
    descriptionPlaceholder: "Descripcion detallada del servicio...",
    featuresPlaceholder: "Agregar una caracteristica...",
    processPlaceholder: "Describa los pasos del proceso...",
    addFeature: "Agregar",
    noFeatures: "Sin caracteristicas",
  },
  ar: {
    backToServices: "العودة للخدمات",
    newService: "خدمة جديدة",
    editService: "تعديل الخدمة",
    basicInfo: "المعلومات الأساسية",
    slug: "الرابط",
    slugPlaceholder: "نجارة-مخصصة",
    icon: "الأيقونة",
    image: "صورة الخدمة",
    pricing: "التسعير",
    priceFrom: "السعر من (درهم)",
    priceTo: "السعر إلى (درهم)",
    priceUnit: "وحدة السعر",
    priceUnitPlaceholder: "للوحدة، للمتر المربع",
    duration: "المدة المقدرة",
    durationPlaceholder: "2-4 أسابيع",
    translations: "الترجمات",
    settings: "الإعدادات",
    visibility: "الظهور",
    published: "منشور",
    draft: "مسودة",
    featured: "خدمة مميزة",
    featuredHelp: "عرض بأولوية",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    name: "اسم الخدمة",
    description: "الوصف",
    features: "المميزات",
    process: "عملية العمل",
    namePlaceholder: "نجارة مخصصة",
    descriptionPlaceholder: "وصف تفصيلي للخدمة...",
    featuresPlaceholder: "إضافة ميزة...",
    processPlaceholder: "صف خطوات العملية...",
    addFeature: "إضافة",
    noFeatures: "لا توجد مميزات",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ServiceTranslationData extends TranslationData {
  features: string[];
  process: string;
}

interface ServiceFormData {
  slug: string;
  icon: string;
  priceFrom: number | null;
  priceTo: number | null;
  priceUnit: string;
  duration: string;
  featured: boolean;
  isPublished: boolean;
  translations: Record<LocaleCode, ServiceTranslationData>;
  images: UploadedImage[];
}

interface ServiceFormProps {
  service?: ServiceFormData & { id: string };
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Service Form Component
// ═══════════════════════════════════════════════════════════

function createEmptyServiceTranslations(): Record<LocaleCode, ServiceTranslationData> {
  return {
    fr: { name: "", description: "", features: [], process: "" },
    en: { name: "", description: "", features: [], process: "" },
    es: { name: "", description: "", features: [], process: "" },
    ar: { name: "", description: "", features: [], process: "" },
  };
}

export function ServiceForm({ service, locale }: ServiceFormProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const isEdit = !!service;

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    slug: service?.slug ?? "",
    icon: service?.icon ?? "",
    priceFrom: service?.priceFrom ?? null,
    priceTo: service?.priceTo ?? null,
    priceUnit: service?.priceUnit ?? "",
    duration: service?.duration ?? "",
    featured: service?.featured ?? false,
    isPublished: service?.isPublished ?? false,
    translations: service?.translations ?? createEmptyServiceTranslations(),
    images: service?.images ?? [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState<Record<LocaleCode, string>>({
    fr: "",
    en: "",
    es: "",
    ar: "",
  });
  const [activeFeatureLocale, setActiveFeatureLocale] = useState<LocaleCode>("fr");

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

  // Handle feature add
  const handleAddFeature = (localeCode: LocaleCode) => {
    const feature = newFeature[localeCode].trim();
    if (!feature) return;

    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [localeCode]: {
          ...prev.translations[localeCode],
          features: [...prev.translations[localeCode].features, feature],
        },
      },
    }));
    setNewFeature((prev) => ({ ...prev, [localeCode]: "" }));
  };

  // Handle feature remove
  const handleRemoveFeature = (localeCode: LocaleCode, index: number) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [localeCode]: {
          ...prev.translations[localeCode],
          features: prev.translations[localeCode].features.filter((_, i) => i !== index),
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
      const url = isEdit ? `/api/services/${service.id}` : "/api/services";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/${locale}/admin/services`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Translation fields configuration (without features - handled separately)
  const translationFields = [
    {
      name: "name",
      type: "text" as const,
      required: true,
      label: { fr: t.name, en: t.name, es: t.name, ar: t.name },
      placeholder: {
        fr: translations.fr.namePlaceholder,
        en: translations.en.namePlaceholder,
        es: translations.es.namePlaceholder,
        ar: translations.ar.namePlaceholder,
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
      name: "process",
      type: "textarea" as const,
      required: false,
      label: { fr: t.process, en: t.process, es: t.process, ar: t.process },
      placeholder: {
        fr: translations.fr.processPlaceholder,
        en: translations.en.processPlaceholder,
        es: translations.es.processPlaceholder,
        ar: translations.ar.processPlaceholder,
      },
    },
  ];

  const locales: { code: LocaleCode; label: string; flag: string }[] = [
    { code: "fr", label: "FR", flag: "🇫🇷" },
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "es", label: "ES", flag: "🇪🇸" },
    { code: "ar", label: "AR", flag: "🇲🇦" },
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
            {t.backToServices}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? t.editService : t.newService}
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
              <Wrench className="h-5 w-5 text-amber-600" />
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
                  {t.icon}
                </label>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  locale={locale}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <DollarSign className="h-5 w-5 text-amber-600" />
              {t.pricing}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.priceFrom}
                </label>
                <input
                  type="number"
                  value={formData.priceFrom ?? ""}
                  onChange={(e) => setFormData({ ...formData, priceFrom: e.target.value ? Number(e.target.value) : null })}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.priceTo}
                </label>
                <input
                  type="number"
                  value={formData.priceTo ?? ""}
                  onChange={(e) => setFormData({ ...formData, priceTo: e.target.value ? Number(e.target.value) : null })}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.priceUnit}
                </label>
                <input
                  type="text"
                  value={formData.priceUnit}
                  onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                  placeholder={t.priceUnitPlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="me-1 inline h-4 w-4" />
                  {t.duration}
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={t.durationPlaceholder}
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

          {/* Features List */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {t.features}
            </h2>

            {/* Locale Tabs for Features */}
            <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setActiveFeatureLocale(loc.code)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeFeatureLocale === loc.code
                      ? "border-b-2 border-amber-500 text-amber-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {loc.flag} {loc.label}
                </button>
              ))}
            </div>

            {/* Feature Input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newFeature[activeFeatureLocale]}
                onChange={(e) => setNewFeature({ ...newFeature, [activeFeatureLocale]: e.target.value })}
                placeholder={t.featuresPlaceholder}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature(activeFeatureLocale);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => handleAddFeature(activeFeatureLocale)}
                disabled={!newFeature[activeFeatureLocale].trim()}
              >
                <Plus className="h-4 w-4" />
                {t.addFeature}
              </Button>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              {formData.translations[activeFeatureLocale].features.length > 0 ? (
                formData.translations[activeFeatureLocale].features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <GripVertical className="h-4 w-4 cursor-move text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(activeFeatureLocale, index)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">{t.noFeatures}</p>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Layers className="h-5 w-5 text-amber-600" />
              {t.image}
            </h2>
            <ImageUploader
              images={formData.images}
              onChange={handleImageChange}
              maxImages={1}
              locale={locale}
            />
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
