"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layout,
  Home,
  Hammer,
  Settings,
  Image as ImageIcon,
  ShoppingBag,
  Phone,
  ChevronRight,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Pages du Site",
    subtitle: "Éditez le contenu de chaque page du site web",
    editPage: "Modifier",
    sections: "Sections",
    home: "Accueil",
    workshop: "L'Atelier",
    services: "Services",
    portfolio: "Réalisations",
    shop: "Boutique",
    contact: "Contact",
    homeDesc: "Page d'accueil avec hero, services, portfolio et témoignages",
    workshopDesc: "Présentation de l'atelier, histoire et équipe",
    servicesDesc: "Liste des services et processus de travail",
    portfolioDesc: "Galerie des réalisations et catégories",
    shopDesc: "Introduction et bannière de la boutique",
    contactDesc: "Informations de contact et formulaire",
    hero: "Hero",
    intro: "Introduction",
    stats: "Statistiques",
    servicesSection: "Services",
    portfolioSection: "Portfolio",
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
  en: {
    title: "Site Pages",
    subtitle: "Edit the content of each website page",
    editPage: "Edit",
    sections: "Sections",
    home: "Home",
    workshop: "Workshop",
    services: "Services",
    portfolio: "Portfolio",
    shop: "Shop",
    contact: "Contact",
    homeDesc: "Homepage with hero, services, portfolio and testimonials",
    workshopDesc: "Workshop presentation, history and team",
    servicesDesc: "Services list and work process",
    portfolioDesc: "Portfolio gallery and categories",
    shopDesc: "Shop introduction and banner",
    contactDesc: "Contact information and form",
    hero: "Hero",
    intro: "Introduction",
    stats: "Stats",
    servicesSection: "Services",
    portfolioSection: "Portfolio",
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
  es: {
    title: "Páginas del Sitio",
    subtitle: "Edita el contenido de cada página del sitio web",
    editPage: "Editar",
    sections: "Secciones",
    home: "Inicio",
    workshop: "Taller",
    services: "Servicios",
    portfolio: "Portfolio",
    shop: "Tienda",
    contact: "Contacto",
    homeDesc: "Página de inicio con hero, servicios, portfolio y testimonios",
    workshopDesc: "Presentación del taller, historia y equipo",
    servicesDesc: "Lista de servicios y proceso de trabajo",
    portfolioDesc: "Galería de portfolio y categorías",
    shopDesc: "Introducción y banner de la tienda",
    contactDesc: "Información de contacto y formulario",
    hero: "Hero",
    intro: "Introducción",
    stats: "Estadísticas",
    servicesSection: "Servicios",
    portfolioSection: "Portfolio",
    testimonials: "Testimonios",
    cta: "Llamada a la Acción",
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
  ar: {
    title: "صفحات الموقع",
    subtitle: "تعديل محتوى كل صفحة من الموقع",
    editPage: "تعديل",
    sections: "الأقسام",
    home: "الرئيسية",
    workshop: "الورشة",
    services: "الخدمات",
    portfolio: "الأعمال",
    shop: "المتجر",
    contact: "اتصل بنا",
    homeDesc: "الصفحة الرئيسية مع البطل والخدمات والمعرض والشهادات",
    workshopDesc: "عرض الورشة والتاريخ والفريق",
    servicesDesc: "قائمة الخدمات وعملية العمل",
    portfolioDesc: "معرض الأعمال والفئات",
    shopDesc: "مقدمة المتجر والبانر",
    contactDesc: "معلومات الاتصال والنموذج",
    hero: "البطل",
    intro: "المقدمة",
    stats: "الإحصائيات",
    servicesSection: "الخدمات",
    portfolioSection: "المعرض",
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
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface PageConfig {
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: string[];
}

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Pages Configuration
// ═══════════════════════════════════════════════════════════

const pages: PageConfig[] = [
  {
    slug: "home",
    icon: Home,
    sections: ["hero", "intro", "stats", "services", "portfolio", "testimonials", "cta"],
  },
  {
    slug: "workshop",
    icon: Hammer,
    sections: ["hero", "story", "values", "team", "gallery", "cta"],
  },
  {
    slug: "services",
    icon: Settings,
    sections: ["hero", "intro", "serviceList", "process", "cta"],
  },
  {
    slug: "portfolio",
    icon: ImageIcon,
    sections: ["hero", "stats", "categories", "cta"],
  },
  {
    slug: "shop",
    icon: ShoppingBag,
    sections: ["hero", "intro"],
  },
  {
    slug: "contact",
    icon: Phone,
    sections: ["hero", "info", "form", "map"],
  },
];

// ═══════════════════════════════════════════════════════════
// Pages Manager
// ═══════════════════════════════════════════════════════════

export default function PagesManagerPage({ params }: PageProps) {
  const locale = params.locale as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const getPageName = (slug: string) => {
    return t[slug as keyof typeof t] || slug;
  };

  const getPageDesc = (slug: string) => {
    const descKey = `${slug}Desc` as keyof typeof t;
    return t[descKey] || "";
  };

  const getSectionName = (section: string) => {
    const sectionNames: Record<string, keyof typeof t> = {
      hero: "hero",
      intro: "intro",
      stats: "stats",
      services: "servicesSection",
      portfolio: "portfolioSection",
      testimonials: "testimonials",
      cta: "cta",
      story: "story",
      values: "values",
      team: "team",
      gallery: "gallery",
      serviceList: "serviceList",
      process: "process",
      categories: "categories",
      info: "info",
      form: "form",
      map: "map",
    };
    return t[sectionNames[section] || section as keyof typeof t] || section;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.subtitle}
        </p>
      </div>

      {/* Pages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <div
              key={page.slug}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                    <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getPageName(page.slug)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /{page.slug === "home" ? "" : page.slug}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/admin/contenu/pages/${page.slug}`}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                >
                  <Edit className="h-5 w-5" />
                </Link>
              </div>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {getPageDesc(page.slug)}
              </p>

              {/* Sections */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                  {t.sections}
                </p>
                <div className="flex flex-wrap gap-1">
                  {page.sections.map((section) => (
                    <span
                      key={section}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {getSectionName(section)}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={`/${locale}/admin/contenu/pages/${page.slug}`}
                className="mt-4 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
              >
                {t.editPage}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
