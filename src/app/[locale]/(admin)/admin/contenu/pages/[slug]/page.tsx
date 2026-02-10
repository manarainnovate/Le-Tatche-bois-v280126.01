"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/ui/Toaster";
import { ImageUpload } from "@/components/admin/ImageUpload";
import MultilingualInput from "@/components/admin/MultilingualInput";
import TranslateAllButton from "@/components/admin/TranslateAllButton";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface MultilingualValues {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface PageSection {
  id?: string;
  sectionKey: string;
  sectionType: string;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  subtitleFr: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleAr: string;
  contentFr: string;
  contentEn: string;
  contentEs: string;
  contentAr: string;
  imageUrl: string;
  videoUrl: string;
  bgColor: string;
  bgImage: string;
  bgOverlay: number;
  ctaTextFr: string;
  ctaTextEn: string;
  ctaTextEs: string;
  ctaTextAr: string;
  ctaUrl: string;
  ctaStyle: string;
  cta2TextFr: string;
  cta2TextEn: string;
  cta2TextEs: string;
  cta2TextAr: string;
  cta2Url: string;
  order: number;
  isActive: boolean;
}

interface PageProps {
  params: { locale: string; slug: string };
}

// Page configuration - define which sections each page has
const PAGE_CONFIGS: Record<string, string[]> = {
  home: ["hero", "intro", "stats", "services", "portfolio", "testimonials", "cta"],
  workshop: ["hero", "story", "values", "team", "gallery", "cta"],
  services: ["hero", "intro", "serviceList", "process", "cta"],
  portfolio: ["hero", "stats", "categories", "cta"],
  shop: ["hero", "intro"],
  contact: ["hero", "info", "form", "map"],
};

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    back: "Retour aux pages",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistré !",
    error: "Erreur lors de l'enregistrement",
    loading: "Chargement...",
    addSection: "Ajouter une section",
    sectionTitle: "Titre",
    sectionSubtitle: "Sous-titre",
    sectionContent: "Contenu",
    sectionImage: "Image",
    sectionBgImage: "Image de fond",
    ctaText: "Texte du bouton",
    ctaUrl: "URL du bouton",
    active: "Active",
    pageTitle: {
      home: "Page d'Accueil",
      workshop: "Page Atelier",
      services: "Page Services",
      portfolio: "Page Réalisations",
      shop: "Page Boutique",
      contact: "Page Contact",
    },
    sectionNames: {
      hero: "Bannière Hero",
      intro: "Introduction",
      stats: "Statistiques",
      services: "Services",
      portfolio: "Portfolio",
      testimonials: "Témoignages",
      cta: "Appel à l'action",
      story: "Notre Histoire",
      values: "Nos Valeurs",
      team: "Équipe",
      gallery: "Galerie",
      serviceList: "Liste des services",
      process: "Processus",
      categories: "Catégories",
      info: "Informations",
      form: "Formulaire",
      map: "Carte",
    },
  },
  en: {
    back: "Back to pages",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    error: "Error saving",
    loading: "Loading...",
    addSection: "Add section",
    sectionTitle: "Title",
    sectionSubtitle: "Subtitle",
    sectionContent: "Content",
    sectionImage: "Image",
    sectionBgImage: "Background Image",
    ctaText: "Button text",
    ctaUrl: "Button URL",
    active: "Active",
    pageTitle: {
      home: "Home Page",
      workshop: "Workshop Page",
      services: "Services Page",
      portfolio: "Portfolio Page",
      shop: "Shop Page",
      contact: "Contact Page",
    },
    sectionNames: {
      hero: "Hero Banner",
      intro: "Introduction",
      stats: "Statistics",
      services: "Services",
      portfolio: "Portfolio",
      testimonials: "Testimonials",
      cta: "Call to Action",
      story: "Our Story",
      values: "Our Values",
      team: "Team",
      gallery: "Gallery",
      serviceList: "Service List",
      process: "Process",
      categories: "Categories",
      info: "Information",
      form: "Form",
      map: "Map",
    },
  },
  es: {
    back: "Volver a páginas",
    save: "Guardar",
    saving: "Guardando...",
    saved: "¡Guardado!",
    error: "Error al guardar",
    loading: "Cargando...",
    addSection: "Añadir sección",
    sectionTitle: "Título",
    sectionSubtitle: "Subtítulo",
    sectionContent: "Contenido",
    sectionImage: "Imagen",
    sectionBgImage: "Imagen de fondo",
    ctaText: "Texto del botón",
    ctaUrl: "URL del botón",
    active: "Activo",
    pageTitle: {
      home: "Página de Inicio",
      workshop: "Página del Taller",
      services: "Página de Servicios",
      portfolio: "Página de Portfolio",
      shop: "Página de Tienda",
      contact: "Página de Contacto",
    },
    sectionNames: {
      hero: "Banner Hero",
      intro: "Introducción",
      stats: "Estadísticas",
      services: "Servicios",
      portfolio: "Portfolio",
      testimonials: "Testimonios",
      cta: "Llamada a la acción",
      story: "Nuestra Historia",
      values: "Nuestros Valores",
      team: "Equipo",
      gallery: "Galería",
      serviceList: "Lista de Servicios",
      process: "Proceso",
      categories: "Categorías",
      info: "Información",
      form: "Formulario",
      map: "Mapa",
    },
  },
  ar: {
    back: "العودة إلى الصفحات",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    error: "خطأ في الحفظ",
    loading: "جاري التحميل...",
    addSection: "إضافة قسم",
    sectionTitle: "العنوان",
    sectionSubtitle: "العنوان الفرعي",
    sectionContent: "المحتوى",
    sectionImage: "الصورة",
    sectionBgImage: "صورة الخلفية",
    ctaText: "نص الزر",
    ctaUrl: "رابط الزر",
    active: "نشط",
    pageTitle: {
      home: "الصفحة الرئيسية",
      workshop: "صفحة الورشة",
      services: "صفحة الخدمات",
      portfolio: "صفحة الأعمال",
      shop: "صفحة المتجر",
      contact: "صفحة الاتصال",
    },
    sectionNames: {
      hero: "بانر البطل",
      intro: "المقدمة",
      stats: "الإحصائيات",
      services: "الخدمات",
      portfolio: "المعرض",
      testimonials: "الشهادات",
      cta: "دعوة للعمل",
      story: "قصتنا",
      values: "قيمنا",
      team: "الفريق",
      gallery: "المعرض",
      serviceList: "قائمة الخدمات",
      process: "العملية",
      categories: "الفئات",
      info: "المعلومات",
      form: "النموذج",
      map: "الخريطة",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Page Section Editor
// ═══════════════════════════════════════════════════════════

export default function PageSectionEditor({ params }: PageProps) {
  // Use both props and useParams hook for reliability
  const routeParams = useParams();
  const locale = (params?.locale || routeParams?.locale || "fr") as string;
  const slug = (params?.slug || routeParams?.slug || "") as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const toast = useToast();

  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  // Get page title and available sections - memoize to prevent re-renders
  const pageTitle = t.pageTitle[slug as keyof typeof t.pageTitle] || slug;
  const availableSections = useMemo(() => PAGE_CONFIGS[slug] || [], [slug]);

  // Create empty section helper
  const createEmptySection = (key: string, order: number): PageSection => ({
    sectionKey: key,
    sectionType: key,
    titleFr: "",
    titleEn: "",
    titleEs: "",
    titleAr: "",
    subtitleFr: "",
    subtitleEn: "",
    subtitleEs: "",
    subtitleAr: "",
    contentFr: "",
    contentEn: "",
    contentEs: "",
    contentAr: "",
    imageUrl: "",
    videoUrl: "",
    bgColor: "",
    bgImage: "",
    bgOverlay: 0.5,
    ctaTextFr: "",
    ctaTextEn: "",
    ctaTextEs: "",
    ctaTextAr: "",
    ctaUrl: "",
    ctaStyle: "primary",
    cta2TextFr: "",
    cta2TextEn: "",
    cta2TextEs: "",
    cta2TextAr: "",
    cta2Url: "",
    order,
    isActive: true,
  });

  // Helper to get multilingual values from a section
  const getMultilingualValues = (section: PageSection, field: string): MultilingualValues => ({
    fr: section[`${field}Fr` as keyof PageSection] as string || "",
    en: section[`${field}En` as keyof PageSection] as string || "",
    es: section[`${field}Es` as keyof PageSection] as string || "",
    ar: section[`${field}Ar` as keyof PageSection] as string || "",
  });

  // Helper to update multilingual values in a section
  const updateMultilingualField = (sectionKey: string, field: string, values: MultilingualValues) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionKey === sectionKey
          ? {
              ...s,
              [`${field}Fr`]: values.fr,
              [`${field}En`]: values.en,
              [`${field}Es`]: values.es,
              [`${field}Ar`]: values.ar,
            }
          : s
      )
    );
  };

  // Load sections from API or initialize with empty sections
  useEffect(() => {
    // Skip if no slug or no available sections configured
    if (!slug) {
      console.log("[PageSectionEditor] No slug provided");
      setLoading(false);
      return;
    }

    console.log("[PageSectionEditor] Loading sections for:", { slug, availableSections });

    const loadSections = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cms/pages/${slug}/sections`);
        const data = res.ok ? await res.json() : { sections: [] };
        const existingSections: PageSection[] = data.sections || [];

        console.log("[PageSectionEditor] API response:", { existingSections: existingSections.length });

        // Always create all sections based on page config, merge with existing data
        const allSections = availableSections.map((key, index) => {
          const existing = existingSections.find(
            (s: PageSection) => s.sectionKey === key
          );
          if (existing) {
            return { ...createEmptySection(key, index), ...existing, order: index };
          }
          return createEmptySection(key, index);
        });

        console.log("[PageSectionEditor] Setting sections:", allSections.length);
        setSections(allSections);

        // Set first section as active tab
        if (allSections.length > 0 && !activeTab) {
          setActiveTab(allSections[0].sectionKey);
        }
      } catch (error) {
        console.error("[PageSectionEditor] Failed to load sections:", error);
        // On error, still initialize with empty sections so UI is usable
        const emptySections = availableSections.map((key, index) =>
          createEmptySection(key, index)
        );
        setSections(emptySections);
        if (emptySections.length > 0 && !activeTab) {
          setActiveTab(emptySections[0].sectionKey);
        }
      }
      setLoading(false);
    };

    if (availableSections.length > 0) {
      void loadSections();
    } else {
      console.log("[PageSectionEditor] No sections configured for slug:", slug);
      setLoading(false);
    }
  }, [slug, availableSections]);

  // Save sections
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/cms/pages/${slug}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success(t.saved, locale === "ar" ? "تم حفظ التعديلات بنجاح" : locale === "es" ? "Los cambios se han guardado" : locale === "en" ? "Changes saved successfully" : "Les modifications ont été enregistrées");
      } else {
        toast.error(locale === "ar" ? "خطأ" : locale === "es" ? "Error" : locale === "en" ? "Error" : "Erreur", locale === "ar" ? "حدث خطأ أثناء الحفظ" : locale === "es" ? "Error al guardar" : locale === "en" ? "An error occurred while saving" : "Une erreur est survenue lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Failed to save sections:", error);
      toast.error(locale === "ar" ? "خطأ" : locale === "es" ? "Error" : locale === "en" ? "Error" : "Erreur", locale === "ar" ? "حدث خطأ أثناء الحفظ" : locale === "es" ? "Error al guardar" : locale === "en" ? "An error occurred while saving" : "Une erreur est survenue lors de l'enregistrement");
    }
    setSaving(false);
  };

  // Update section
  const updateSection = (key: string, updates: Partial<PageSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === key ? { ...s, ...updates } : s))
    );
  };

  // Get section name
  const getSectionName = (key: string) => {
    return t.sectionNames[key as keyof typeof t.sectionNames] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/contenu/pages`}
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-sm text-gray-500">/{slug === "home" ? "" : slug}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.saving}
            </>
          ) : saved ? (
            t.saved
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t.save}
            </>
          )}
        </button>
      </div>

      {/* Multilingual Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
        <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            {locale === "fr" ? "Contenu multilingue - 4 langues" : "Multilingual Content - 4 Languages"}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            {locale === "fr"
              ? "Chaque section peut être traduite en Français, Anglais, Espagnol et Arabe"
              : "Each section can be translated in French, English, Spanish and Arabic"}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      {sections.length === 0 ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/20">
          <p className="text-yellow-800 dark:text-yellow-200">
            {locale === "fr"
              ? `Aucune section configurée pour cette page (${slug}). Vérifiez que le slug est valide.`
              : `No sections configured for this page (${slug}). Check that the slug is valid.`
            }
          </p>
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            Slugs valides: {Object.keys(PAGE_CONFIGS).join(", ")}
          </p>
        </div>
      ) : (
        <>
          {/* Horizontal Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-0 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.sectionKey}
                  type="button"
                  onClick={() => setActiveTab(section.sectionKey)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === section.sectionKey
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300",
                    !section.isActive && "opacity-50"
                  )}
                >
                  {getSectionName(section.sectionKey)}
                  {!section.isActive && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded dark:bg-gray-700">
                      off
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content */}
          {sections.filter((s) => s.sectionKey === activeTab).map((section) => (
            <div key={section.sectionKey} className="rounded-xl border border-gray-200 bg-white p-6 space-y-6 dark:border-gray-700 dark:bg-gray-800">
              {/* Auto-Translate All Fields */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
                <TranslateAllButton
                  fields={[
                    {
                      fieldName: "title",
                      values: getMultilingualValues(section, "title"),
                      onChange: (values) => updateMultilingualField(section.sectionKey, "title", values),
                    },
                    {
                      fieldName: "subtitle",
                      values: getMultilingualValues(section, "subtitle"),
                      onChange: (values) => updateMultilingualField(section.sectionKey, "subtitle", values),
                    },
                    {
                      fieldName: "content",
                      values: getMultilingualValues(section, "content"),
                      onChange: (values) => updateMultilingualField(section.sectionKey, "content", values),
                    },
                    {
                      fieldName: "ctaText",
                      values: getMultilingualValues(section, "ctaText"),
                      onChange: (values) => updateMultilingualField(section.sectionKey, "ctaText", values),
                    },
                  ]}
                />
              </div>

              {/* Title - 4 Languages */}
              <MultilingualInput
                label={t.sectionTitle}
                values={getMultilingualValues(section, "title")}
                onChange={(values) => updateMultilingualField(section.sectionKey, "title", values)}
                placeholder={locale === "fr" ? "Titre de la section" : "Section title"}
              />

              {/* Subtitle - 4 Languages */}
              <MultilingualInput
                label={t.sectionSubtitle}
                values={getMultilingualValues(section, "subtitle")}
                onChange={(values) => updateMultilingualField(section.sectionKey, "subtitle", values)}
                placeholder={locale === "fr" ? "Sous-titre" : "Subtitle"}
              />

              {/* Content - 4 Languages */}
              <MultilingualInput
                label={t.sectionContent}
                values={getMultilingualValues(section, "content")}
                onChange={(values) => updateMultilingualField(section.sectionKey, "content", values)}
                type="textarea"
                rows={4}
                placeholder={locale === "fr" ? "Contenu de la section" : "Section content"}
              />

              {/* Map Embed URL (only for map sections) */}
              {section.sectionKey === "map" && (
                <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {locale === "fr" ? "URL d'intégration Google Maps" : "Google Maps Embed URL"}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {locale === "fr"
                      ? "Collez l'URL ou le code iframe complet de Google Maps"
                      : "Paste the URL or the full iframe code from Google Maps"}
                  </p>
                  <textarea
                    value={section.videoUrl || ""}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Auto-extract src= URL from pasted <iframe> HTML
                      if (val.includes("<iframe")) {
                        const srcMatch = val.match(/src=["']([^"']+)["']/);
                        if (srcMatch) val = srcMatch[1];
                      }
                      updateSection(section.sectionKey, { videoUrl: val });
                    }}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm font-mono"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              )}

              {/* Image */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {t.sectionImage}
                </label>
                <ImageUpload
                  value={section.imageUrl}
                  onChange={(url) =>
                    updateSection(section.sectionKey, { imageUrl: url })
                  }
                  folder="general"
                  locale={locale}
                  aspectRatio="video"
                />
              </div>

              {/* Background Image (for hero sections) */}
              {section.sectionKey === "hero" && (
                <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {t.sectionBgImage}
                  </label>
                  <ImageUpload
                    value={section.bgImage}
                    onChange={(url) =>
                      updateSection(section.sectionKey, { bgImage: url })
                    }
                    folder="general"
                    locale={locale}
                    aspectRatio="wide"
                  />
                </div>
              )}

              {/* CTA Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {locale === "fr" ? "Bouton d'action (CTA)" : "Call to Action Button"}
                </h4>

                {/* CTA Text - 4 Languages */}
                <MultilingualInput
                  label={t.ctaText}
                  values={getMultilingualValues(section, "ctaText")}
                  onChange={(values) => updateMultilingualField(section.sectionKey, "ctaText", values)}
                  placeholder={locale === "fr" ? "Texte du bouton" : "Button text"}
                />

                {/* CTA URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.ctaUrl}
                  </label>
                  <input
                    type="text"
                    value={section.ctaUrl}
                    onChange={(e) =>
                      updateSection(section.sectionKey, {
                        ctaUrl: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="/contact"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                <input
                  type="checkbox"
                  id={`active-${section.sectionKey}`}
                  checked={section.isActive}
                  onChange={(e) =>
                    updateSection(section.sectionKey, {
                      isActive: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label
                  htmlFor={`active-${section.sectionKey}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t.active}
                </label>
                <span className={`ml-auto text-xs px-2 py-1 rounded ${
                  section.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}>
                  {section.isActive
                    ? (locale === "fr" ? "Section visible" : "Section visible")
                    : (locale === "fr" ? "Section masquée" : "Section hidden")
                  }
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
