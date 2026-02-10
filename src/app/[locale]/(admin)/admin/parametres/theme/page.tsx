"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  TreePine,
  Check,
  Home,
  Briefcase,
  Wrench,
  Image,
  ShoppingBag,
  Phone,
  Palette,
  MessageSquareQuote,
  Megaphone,
  FolderOpen,
  Package,
  Info,
  RotateCcw,
  Type,
  Square,
  Settings,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/ui/Toaster";
import type { PageKey } from "@/stores/themeSettings";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface PageSettings {
  enabled: boolean;
  image: string;
  opacity: number;
}

interface SectionSettingsData {
  type: "color" | "image";
  color: string;
  image: string;
  overlayOpacity: number;
  overlayColor: string;
  overlayEnabled: boolean;
  cardEnabled: boolean;
  cardColor: string;
  cardOpacity: number;
  cardBlur: boolean;
  titleColor: string;
  bodyColor: string;
  paginationColor: string;
  paginationActiveColor: string;
  paginationActiveBg: string;
}

type SectionKey =
  | "statsBackground" | "testimonialsBackground" | "ctaBackground" | "projectsBackground" | "productsBackground" | "aboutBackground"
  | "servicesHero" | "servicesGrid" | "servicesCta"
  | "atelierStats" | "atelierStory" | "atelierGallery" | "atelierProcess" | "atelierMachines" | "atelierValues" | "atelierTeam" | "atelierCta"
  | "realisationsHero" | "realisationsGrid" | "realisationsDetail" | "realisationsCta"
  | "boutiqueHero" | "boutiqueProduct" | "boutiqueTabs" | "boutiqueRelated" | "boutiqueCart" | "boutiqueCheckout" | "boutiqueSuccess" | "boutiqueConfirmation"
  | "contactHero" | "contactForm";

interface ThemeFormData {
  woodTexture: string;
  footerEnabled: boolean;
  footerOpacity: number;
  statsBackground: SectionSettingsData;
  testimonialsBackground: SectionSettingsData;
  ctaBackground: SectionSettingsData;
  projectsBackground: SectionSettingsData;
  productsBackground: SectionSettingsData;
  aboutBackground: SectionSettingsData;
  aboutImage: string;
  // Services page
  servicesHero: SectionSettingsData;
  servicesGrid: SectionSettingsData;
  servicesCta: SectionSettingsData;
  // Realisations page
  realisationsHero: SectionSettingsData;
  realisationsGrid: SectionSettingsData;
  realisationsDetail: SectionSettingsData;
  realisationsCta: SectionSettingsData;
  // Atelier page
  atelierStats: SectionSettingsData;
  atelierStory: SectionSettingsData;
  atelierGallery: SectionSettingsData;
  atelierProcess: SectionSettingsData;
  atelierMachines: SectionSettingsData;
  atelierValues: SectionSettingsData;
  atelierTeam: SectionSettingsData;
  atelierCta: SectionSettingsData;
  // Boutique page
  boutiqueHero: SectionSettingsData;
  boutiqueProduct: SectionSettingsData;
  boutiqueTabs: SectionSettingsData;
  boutiqueRelated: SectionSettingsData;
  boutiqueCart: SectionSettingsData;
  boutiqueCheckout: SectionSettingsData;
  boutiqueSuccess: SectionSettingsData;
  boutiqueConfirmation: SectionSettingsData;
  // Contact page
  contactHero: SectionSettingsData;
  contactForm: SectionSettingsData;
  pages: Record<PageKey, PageSettings>;
}

type TabKey = "general" | "accueil" | "atelier" | "services" | "realisations" | "boutique" | "contact";

// ═══════════════════════════════════════════════════════════
// SECTION DEFAULTS
// ═══════════════════════════════════════════════════════════

const defaultStatsBackground: SectionSettingsData = {
  type: "color",
  color: "#8B4513",
  image: "",
  overlayOpacity: 65,
  overlayColor: "#000000",
  overlayEnabled: true,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#CCCCCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultTestimonialsBackground: SectionSettingsData = {
  type: "color",
  color: "#FDF6EC",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#FFFFFF",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#5D3A1A",
  bodyColor: "#A0826D",
  paginationColor: "#6B7280",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultCtaBackground: SectionSettingsData = {
  type: "image",
  color: "#5D3A1A",
  image: "/images/cta/workshop-bg.jpg",
  overlayOpacity: 85,
  overlayColor: "#3B1E0A",
  overlayEnabled: true,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#CCCCCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultProjectsBackground: SectionSettingsData = {
  type: "color",
  color: "#FFFFFF",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#FFFFFF",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#5D3A1A",
  bodyColor: "#A0826D",
  paginationColor: "#6B7280",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultProductsBackground: SectionSettingsData = {
  type: "color",
  color: "#FAFAF5",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#FFFFFF",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#5D3A1A",
  bodyColor: "#A0826D",
  paginationColor: "#6B7280",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultAboutBackground: SectionSettingsData = {
  type: "color",
  color: "#FFFFFF",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#FFFFFF",
  overlayEnabled: false,
  cardEnabled: true,
  cardColor: "#FFFFFF",
  cardOpacity: 85,
  cardBlur: true,
  titleColor: "#5D3A1A",
  bodyColor: "#A0826D",
  paginationColor: "#6B7280",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

// ── Services page defaults ──
const defaultServicesHero: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 50, overlayColor: "#000000", overlayEnabled: true, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultServicesGrid: SectionSettingsData = { type: "color", color: "#FDF6EC", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultServicesCta: SectionSettingsData = { type: "color", color: "#3B1E0A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };

// ── Realisations page defaults ──
const defaultRealisationsHero: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultRealisationsGrid: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultRealisationsDetail: SectionSettingsData = { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultRealisationsCta: SectionSettingsData = { type: "color", color: "#FDF6EC", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#6B7280", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };

// ── Atelier page defaults ──
const defaultAtelierStats: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" };
const defaultAtelierStory: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" };
const defaultAtelierGallery: SectionSettingsData = { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" };
const defaultAtelierProcess: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" };
const defaultAtelierMachines: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" };
const defaultAtelierValues: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" };
const defaultAtelierTeam: SectionSettingsData = { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3" };
const defaultAtelierCta: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26" };

// ── Boutique page defaults ──
const defaultBoutiqueHero: SectionSettingsData = { type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueProduct: SectionSettingsData = { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueTabs: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueRelated: SectionSettingsData = { type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueCart: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueCheckout: SectionSettingsData = { type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueSuccess: SectionSettingsData = { type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultBoutiqueConfirmation: SectionSettingsData = { type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };

// ── Contact page defaults ──
const defaultContactHero: SectionSettingsData = { type: "color", color: "#3B1E0A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };
const defaultContactForm: SectionSettingsData = { type: "color", color: "#F5F0EB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false, cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true, titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A" };

const SECTION_DEFAULTS: Record<SectionKey, SectionSettingsData> = {
  statsBackground: defaultStatsBackground,
  testimonialsBackground: defaultTestimonialsBackground,
  ctaBackground: defaultCtaBackground,
  projectsBackground: defaultProjectsBackground,
  productsBackground: defaultProductsBackground,
  aboutBackground: defaultAboutBackground,
  servicesHero: defaultServicesHero,
  servicesGrid: defaultServicesGrid,
  servicesCta: defaultServicesCta,
  realisationsHero: defaultRealisationsHero,
  realisationsGrid: defaultRealisationsGrid,
  realisationsDetail: defaultRealisationsDetail,
  realisationsCta: defaultRealisationsCta,
  atelierStats: defaultAtelierStats,
  atelierStory: defaultAtelierStory,
  atelierGallery: defaultAtelierGallery,
  atelierProcess: defaultAtelierProcess,
  atelierMachines: defaultAtelierMachines,
  atelierValues: defaultAtelierValues,
  atelierTeam: defaultAtelierTeam,
  atelierCta: defaultAtelierCta,
  boutiqueHero: defaultBoutiqueHero,
  boutiqueProduct: defaultBoutiqueProduct,
  boutiqueTabs: defaultBoutiqueTabs,
  boutiqueRelated: defaultBoutiqueRelated,
  boutiqueCart: defaultBoutiqueCart,
  boutiqueCheckout: defaultBoutiqueCheckout,
  boutiqueSuccess: defaultBoutiqueSuccess,
  boutiqueConfirmation: defaultBoutiqueConfirmation,
  contactHero: defaultContactHero,
  contactForm: defaultContactForm,
};

const defaultFormData: ThemeFormData = {
  woodTexture: "",
  footerEnabled: true,
  footerOpacity: 60,
  statsBackground: defaultStatsBackground,
  testimonialsBackground: defaultTestimonialsBackground,
  ctaBackground: defaultCtaBackground,
  projectsBackground: defaultProjectsBackground,
  productsBackground: defaultProductsBackground,
  aboutBackground: defaultAboutBackground,
  aboutImage: "/uploads/projects/plafonds-murs/04-projet-plafond-decoratif-bois-sculpte/avant-IMG_20200226_160352.jpg",
  servicesHero: defaultServicesHero,
  servicesGrid: defaultServicesGrid,
  servicesCta: defaultServicesCta,
  realisationsHero: defaultRealisationsHero,
  realisationsGrid: defaultRealisationsGrid,
  realisationsDetail: defaultRealisationsDetail,
  realisationsCta: defaultRealisationsCta,
  atelierStats: defaultAtelierStats,
  atelierStory: defaultAtelierStory,
  atelierGallery: defaultAtelierGallery,
  atelierProcess: defaultAtelierProcess,
  atelierMachines: defaultAtelierMachines,
  atelierValues: defaultAtelierValues,
  atelierTeam: defaultAtelierTeam,
  atelierCta: defaultAtelierCta,
  boutiqueHero: defaultBoutiqueHero,
  boutiqueProduct: defaultBoutiqueProduct,
  boutiqueTabs: defaultBoutiqueTabs,
  boutiqueRelated: defaultBoutiqueRelated,
  boutiqueCart: defaultBoutiqueCart,
  boutiqueCheckout: defaultBoutiqueCheckout,
  boutiqueSuccess: defaultBoutiqueSuccess,
  boutiqueConfirmation: defaultBoutiqueConfirmation,
  contactHero: defaultContactHero,
  contactForm: defaultContactForm,
  pages: {
    home: { enabled: true, image: "", opacity: 20 },
    atelier: { enabled: true, image: "", opacity: 25 },
    services: { enabled: true, image: "", opacity: 20 },
    realisations: { enabled: false, image: "", opacity: 30 },
    boutique: { enabled: true, image: "", opacity: 15 },
    contact: { enabled: true, image: "", opacity: 20 },
  },
};

const TABS: { key: TabKey; label: string; icon: typeof Home; count?: number }[] = [
  { key: "general", label: "General", icon: Settings },
  { key: "accueil", label: "Accueil", icon: Home, count: 6 },
  { key: "atelier", label: "Atelier", icon: Briefcase, count: 8 },
  { key: "services", label: "Services", icon: Wrench, count: 3 },
  { key: "realisations", label: "Realisations", icon: Image, count: 4 },
  { key: "boutique", label: "Boutique", icon: ShoppingBag, count: 8 },
  { key: "contact", label: "Contact", icon: Phone, count: 2 },
];

// ═══════════════════════════════════════════════════════════
// TOGGLE SWITCH COMPONENT
// ═══════════════════════════════════════════════════════════

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-gray-700 font-medium">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COLOR PICKER ROW COMPONENT
// ═══════════════════════════════════════════════════════════

function ColorPickerRow({
  label,
  value,
  onChange,
  defaultValue,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          placeholder={defaultValue}
        />
        {defaultValue && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-gray-400 hover:text-amber-600 transition-colors"
            title="Reinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COLLAPSIBLE SECTION PANEL
// ═══════════════════════════════════════════════════════════

interface SectionConfig {
  key: SectionKey;
  title: string;
  subtitle: string;
  icon: typeof Palette;
  defaultColor: string;
  defaultLabel: string;
}

function SectionPanel({
  section,
  bgData,
  defaults,
  updateSection,
  resetSectionCard,
  resetSectionColors,
  formData,
  setFormData,
}: {
  section: SectionConfig;
  bgData: SectionSettingsData;
  defaults: SectionSettingsData;
  updateSection: (section: SectionKey, field: keyof SectionSettingsData, value: string | number | boolean) => void;
  resetSectionCard: (section: SectionKey) => void;
  resetSectionColors: (section: SectionKey) => void;
  formData: ThemeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ThemeFormData>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const SectionIcon = section.icon;

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* Clickable header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SectionIcon className="w-5 h-5 text-amber-600" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
            <p className="text-xs text-gray-500">{section.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick preview swatch */}
          <div
            className="w-6 h-6 rounded-md border border-gray-200"
            style={{ backgroundColor: bgData.type === "color" ? bgData.color : "#666" }}
            title={bgData.type === "color" ? bgData.color : "Image"}
          />
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
          {/* About Section: Image Upload (special case) */}
          {section.key === "aboutBackground" && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de la section A Propos</label>
              <ImageUpload
                value={formData.aboutImage}
                onChange={(url) => setFormData({ ...formData, aboutImage: url })}
                folder="about"
                aspectRatio="wide"
              />
            </div>
          )}

          {/* Background Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de fond</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateSection(section.key, "type", "color")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  bgData.type === "color" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Palette className="w-4 h-4" />
                Couleur
              </button>
              <button
                type="button"
                onClick={() => updateSection(section.key, "type", "image")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                  bgData.type === "image" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image className="w-4 h-4" />
                Image
              </button>
            </div>
          </div>

          {bgData.type === "color" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgData.color} onChange={(e) => updateSection(section.key, "color", e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={bgData.color} onChange={(e) => updateSection(section.key, "color", e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono" />
                  <span className="text-xs text-gray-400">{section.defaultLabel}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <ImageUpload
                value={bgData.image}
                onChange={(url) => updateSection(section.key, "image", url)}
                folder="textures"
                aspectRatio="wide"
              />
              {/* Overlay */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <ToggleSwitch
                  checked={bgData.overlayEnabled}
                  onChange={(v) => updateSection(section.key, "overlayEnabled", v)}
                  label="Overlay"
                  description="Assombrit l'image"
                />
                {bgData.overlayEnabled && (
                  <>
                    <div className="flex items-center gap-3">
                      <input type="color" value={bgData.overlayColor} onChange={(e) => updateSection(section.key, "overlayColor", e.target.value)} className="w-10 h-8 rounded border border-gray-300 cursor-pointer" />
                      <input type="text" value={bgData.overlayColor} onChange={(e) => updateSection(section.key, "overlayColor", e.target.value)} className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Opacite :</span>
                        <span className="text-xs font-bold text-amber-600">{bgData.overlayOpacity}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={bgData.overlayOpacity} onChange={(e) => updateSection(section.key, "overlayOpacity", parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-amber-600" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Text Card */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Carte de texte</span>
              </div>
              <button type="button" onClick={() => resetSectionCard(section.key)} className="text-xs text-gray-400 hover:text-amber-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
            </div>
            <ToggleSwitch checked={bgData.cardEnabled} onChange={(v) => updateSection(section.key, "cardEnabled", v)} label="Carte semi-transparente" />
            {bgData.cardEnabled && (
              <div className="mt-3 space-y-3 pl-3 border-l-2 border-amber-200">
                <ColorPickerRow label="Couleur" value={bgData.cardColor} onChange={(v) => updateSection(section.key, "cardColor", v)} defaultValue={defaults.cardColor} />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Opacite :</span>
                    <span className="text-xs font-bold text-amber-600">{bgData.cardOpacity}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={bgData.cardOpacity} onChange={(e) => updateSection(section.key, "cardOpacity", parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-amber-600" />
                </div>
                <ToggleSwitch checked={bgData.cardBlur} onChange={(v) => updateSection(section.key, "cardBlur", v)} label="Effet flou (glassmorphism)" />
              </div>
            )}
          </div>

          {/* Text Colors */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Couleurs du texte</span>
              </div>
              <button type="button" onClick={() => resetSectionColors(section.key)} className="text-xs text-gray-400 hover:text-amber-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorPickerRow label="Titres" value={bgData.titleColor} onChange={(v) => updateSection(section.key, "titleColor", v)} defaultValue={defaults.titleColor} />
              <ColorPickerRow label="Texte" value={bgData.bodyColor} onChange={(v) => updateSection(section.key, "bodyColor", v)} defaultValue={defaults.bodyColor} />
            </div>
            {/* Badge / Pagination Colors */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500 mb-2 block">Badge de section &amp; Pagination</span>
              <div className="grid grid-cols-3 gap-3">
                <ColorPickerRow label="Badge fond" value={bgData.paginationActiveBg} onChange={(v) => updateSection(section.key, "paginationActiveBg", v)} defaultValue={defaults.paginationActiveBg} />
                <ColorPickerRow label="Badge texte" value={bgData.paginationActiveColor} onChange={(v) => updateSection(section.key, "paginationActiveColor", v)} defaultValue={defaults.paginationActiveColor} />
                <ColorPickerRow label="Pagination" value={bgData.paginationColor} onChange={(v) => updateSection(section.key, "paginationColor", v)} defaultValue={defaults.paginationColor} />
              </div>
              {/* Badge + Pagination mini preview */}
              <div className="mt-2 flex items-center justify-center gap-3 p-2 rounded-lg border border-gray-200" style={{ backgroundColor: bgData.type === "color" ? bgData.color : "#333" }}>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: bgData.paginationActiveBg, color: bgData.paginationActiveColor }}>Notre Section</span>
                <span className="flex items-center gap-1">
                  <span className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{ color: bgData.paginationColor }}>1</span>
                  <span className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold" style={{ backgroundColor: bgData.paginationActiveBg, color: bgData.paginationActiveColor }}>2</span>
                  <span className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{ color: bgData.paginationColor }}>3</span>
                </span>
              </div>
            </div>
            {/* Live Preview */}
            <div className="mt-3 relative h-64 rounded-xl overflow-hidden shadow-md border border-gray-200">
              {/* Background layer */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={
                  bgData.type === "image" && bgData.image
                    ? { backgroundImage: `url(${bgData.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { backgroundColor: bgData.color }
                }
              />
              {/* Overlay layer */}
              {bgData.type === "image" && bgData.overlayEnabled && (
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{ backgroundColor: bgData.overlayColor, opacity: bgData.overlayOpacity / 100 }}
                />
              )}
              {/* Sample content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                {bgData.cardEnabled ? (
                  <div
                    className={`px-6 py-5 rounded-xl max-w-[85%] ${bgData.cardBlur ? "backdrop-blur-md" : ""}`}
                    style={{
                      backgroundColor: (() => {
                        const hex = bgData.cardColor;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r},${g},${b},${bgData.cardOpacity / 100})`;
                      })(),
                    }}
                  >
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2" style={{ backgroundColor: bgData.paginationActiveBg, color: bgData.paginationActiveColor }}>Badge</span>
                    <h4 className="text-lg font-bold mb-1" style={{ color: bgData.titleColor }}>Titre de section</h4>
                    <p className="text-sm mb-3" style={{ color: bgData.bodyColor }}>Apercu du texte avec les couleurs configurees.</p>
                    <div className="flex gap-2 justify-center">
                      <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full font-medium">Bouton 1</span>
                      <span className="px-3 py-1 border border-current text-xs rounded-full font-medium" style={{ color: bgData.titleColor }}>Bouton 2</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2" style={{ backgroundColor: bgData.paginationActiveBg, color: bgData.paginationActiveColor }}>Badge</span>
                    <h4 className="text-lg font-bold mb-1" style={{ color: bgData.titleColor }}>Titre de section</h4>
                    <p className="text-sm mb-3" style={{ color: bgData.bodyColor }}>Apercu du texte avec les couleurs configurees.</p>
                    <div className="flex gap-2 justify-center">
                      <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full font-medium">Bouton 1</span>
                      <span className="px-3 py-1 border border-current text-xs rounded-full font-medium" style={{ color: bgData.titleColor }}>Bouton 2</span>
                    </div>
                  </>
                )}
              </div>
              {/* Overlay opacity badge */}
              {bgData.type === "image" && bgData.overlayEnabled && (
                <div className="absolute bottom-2 right-2 z-20 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                  Overlay {bgData.overlayOpacity}%
                </div>
              )}
              {/* Card opacity badge */}
              {bgData.cardEnabled && (
                <div className="absolute bottom-2 left-2 z-20 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                  Carte {bgData.cardOpacity}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SECTION CONFIGURATIONS
// ═══════════════════════════════════════════════════════════

// Order matches frontend page flow: Hero > Stats > ServicesPreview > Projects > About > Testimonials > Products > CTA
// Note: Hero and ServicesPreview don't have admin theme controls (ServicesPreview has its own page)
const HOMEPAGE_SECTIONS: SectionConfig[] = [
  { key: "statsBackground", title: "1. Section Chiffres (Stats)", subtitle: "Apres le hero — \"LE TATCHE BOIS en Chiffres\"", icon: Palette, defaultColor: "#8B4513", defaultLabel: "Par defaut: #8B4513 (brun bois)" },
  { key: "projectsBackground", title: "2. Section Realisations", subtitle: "Apres les services — galerie de projets", icon: FolderOpen, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "aboutBackground", title: "3. Section A Propos", subtitle: "\"L'Art de la Menuiserie\" — image + texte", icon: Info, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "testimonialsBackground", title: "4. Section Temoignages", subtitle: "Carousel des avis clients", icon: MessageSquareQuote, defaultColor: "#FDF6EC", defaultLabel: "Par defaut: #FDF6EC (creme bois)" },
  { key: "productsBackground", title: "5. Section Boutique", subtitle: "\"Nos Produits Phares\" — 4 produits", icon: Package, defaultColor: "#FAFAF5", defaultLabel: "Par defaut: #FAFAF5 (beige clair)" },
  { key: "ctaBackground", title: "6. Section CTA", subtitle: "\"Demander un Devis Gratuit\" — en bas de page", icon: Megaphone, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A (brun fonce)" },
];

const SERVICES_SECTIONS: SectionConfig[] = [
  { key: "servicesHero", title: "1. Hero", subtitle: "En haut — slideshow d'images de fond", icon: Palette, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A" },
  { key: "servicesGrid", title: "2. Grille des Services", subtitle: "Zone centrale — cartes de services", icon: FolderOpen, defaultColor: "#FDF6EC", defaultLabel: "Par defaut: #FDF6EC (creme)" },
  { key: "servicesCta", title: "3. CTA", subtitle: "En bas — appel a l'action devis", icon: Megaphone, defaultColor: "#3B1E0A", defaultLabel: "Par defaut: #3B1E0A" },
];

const REALISATIONS_SECTIONS: SectionConfig[] = [
  { key: "realisationsHero", title: "1. Hero", subtitle: "En haut — banniere portfolio", icon: Palette, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A" },
  { key: "realisationsGrid", title: "2. Grille Projets", subtitle: "Zone centrale — galerie de projets", icon: FolderOpen, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF" },
  { key: "realisationsDetail", title: "3. Page Detail Projet", subtitle: "Page individuelle d'un projet", icon: Info, defaultColor: "#F9FAFB", defaultLabel: "Par defaut: #F9FAFB" },
  { key: "realisationsCta", title: "4. CTA", subtitle: "En bas — section devis", icon: Megaphone, defaultColor: "#FDF6EC", defaultLabel: "Par defaut: #FDF6EC" },
];

const ATELIER_SECTIONS: SectionConfig[] = [
  { key: "atelierStats", title: "1. Chiffres Cles", subtitle: "Banniere stats — annees, projets, artisans", icon: Palette, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A (bois fonce)" },
  { key: "atelierStory", title: "2. Notre Histoire", subtitle: "Section histoire avec image + texte", icon: Info, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "atelierGallery", title: "3. Galerie Apercu", subtitle: "\"De l'Idee a la Realite\" — icones processus", icon: FolderOpen, defaultColor: "#F9FAFB", defaultLabel: "Par defaut: #F9FAFB (gris clair)" },
  { key: "atelierProcess", title: "4. Processus", subtitle: "Timeline interactive — 6 etapes", icon: Package, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "atelierMachines", title: "5. Equipements", subtitle: "\"Nos Equipements\" — cartes machines", icon: Wrench, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A (bois fonce)" },
  { key: "atelierValues", title: "6. Valeurs", subtitle: "\"Ce Qui Nous Anime\" — 4 valeurs", icon: MessageSquareQuote, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "atelierTeam", title: "7. Equipe", subtitle: "\"Les Mains Expertes\" — cartes membres", icon: Info, defaultColor: "#F9FAFB", defaultLabel: "Par defaut: #F9FAFB (gris clair)" },
  { key: "atelierCta", title: "8. CTA Final", subtitle: "\"Visitez Notre Atelier\" — en bas", icon: Megaphone, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A (bois fonce)" },
];

const BOUTIQUE_SECTIONS: SectionConfig[] = [
  { key: "boutiqueHero", title: "1. Hero", subtitle: "En haut — banniere de la boutique", icon: Palette, defaultColor: "#5D3A1A", defaultLabel: "Par defaut: #5D3A1A" },
  { key: "boutiqueProduct", title: "2. Page Produit", subtitle: "Zone principale — images + infos produit", icon: Package, defaultColor: "#F9FAFB", defaultLabel: "Par defaut: #F9FAFB (gris clair)" },
  { key: "boutiqueTabs", title: "3. Onglets Produit", subtitle: "Description / Caracteristiques / Livraison", icon: Info, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "boutiqueRelated", title: "4. Produits Similaires", subtitle: "Grille de produits recommandes", icon: FolderOpen, defaultColor: "#F9FAFB", defaultLabel: "Par defaut: #F9FAFB (gris clair)" },
  { key: "boutiqueCart", title: "5. Panier", subtitle: "Page du panier d'achat", icon: ShoppingBag, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "boutiqueCheckout", title: "6. Checkout", subtitle: "Page de paiement", icon: Wrench, defaultColor: "#FFFFFF", defaultLabel: "Par defaut: #FFFFFF (blanc)" },
  { key: "boutiqueSuccess", title: "7. Succes Commande", subtitle: "Page de confirmation apres paiement", icon: Megaphone, defaultColor: "#F0FDF4", defaultLabel: "Par defaut: #F0FDF4 (vert clair)" },
  { key: "boutiqueConfirmation", title: "8. Confirmation", subtitle: "Page de suivi de commande", icon: MessageSquareQuote, defaultColor: "#F0FDF4", defaultLabel: "Par defaut: #F0FDF4 (vert clair)" },
];

const CONTACT_SECTIONS: SectionConfig[] = [
  { key: "contactHero", title: "1. Hero", subtitle: "En haut — banniere contact", icon: Palette, defaultColor: "#3B1E0A", defaultLabel: "Par defaut: #3B1E0A" },
  { key: "contactForm", title: "2. Formulaire", subtitle: "Zone centrale — formulaire + coordonnees", icon: MessageSquareQuote, defaultColor: "#F5F0EB", defaultLabel: "Par defaut: #F5F0EB" },
];

// ═══════════════════════════════════════════════════════════
// THEME SETTINGS PAGE
// ═══════════════════════════════════════════════════════════

export default function ThemeSettingsPage() {
  const [formData, setFormData] = useState<ThemeFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const toast = useToast();

  // ─────────────────────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch("/api/settings/theme", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const s = data.data?.settings || {};

        // Backward compat: migrate legacy aboutTextCard/aboutTextCardOpacity
        const aboutBg: SectionSettingsData = {
          ...defaultAboutBackground,
          ...(s.aboutBackground ?? {}),
          cardEnabled: s.aboutBackground?.cardEnabled ?? s.aboutTextCard ?? defaultAboutBackground.cardEnabled,
          cardOpacity: s.aboutBackground?.cardOpacity ?? s.aboutTextCardOpacity ?? defaultAboutBackground.cardOpacity,
        };

        setFormData({
          woodTexture: s.woodTexture ?? defaultFormData.woodTexture,
          footerEnabled: s.footerEnabled ?? defaultFormData.footerEnabled,
          footerOpacity: s.footerOpacity ?? defaultFormData.footerOpacity,
          statsBackground: { ...defaultStatsBackground, ...(s.statsBackground ?? {}) },
          testimonialsBackground: { ...defaultTestimonialsBackground, ...(s.testimonialsBackground ?? {}) },
          ctaBackground: { ...defaultCtaBackground, ...(s.ctaBackground ?? {}) },
          projectsBackground: { ...defaultProjectsBackground, ...(s.projectsBackground ?? {}) },
          productsBackground: { ...defaultProductsBackground, ...(s.productsBackground ?? {}) },
          aboutBackground: aboutBg,
          aboutImage: s.aboutImage ?? defaultFormData.aboutImage,
          // Services page
          servicesHero: { ...defaultServicesHero, ...(s.servicesHero ?? {}) },
          servicesGrid: { ...defaultServicesGrid, ...(s.servicesGrid ?? {}) },
          servicesCta: { ...defaultServicesCta, ...(s.servicesCta ?? {}) },
          // Realisations page
          realisationsHero: { ...defaultRealisationsHero, ...(s.realisationsHero ?? {}) },
          realisationsGrid: { ...defaultRealisationsGrid, ...(s.realisationsGrid ?? {}) },
          realisationsDetail: { ...defaultRealisationsDetail, ...(s.realisationsDetail ?? {}) },
          realisationsCta: { ...defaultRealisationsCta, ...(s.realisationsCta ?? {}) },
          // Atelier page
          atelierStats: { ...defaultAtelierStats, ...(s.atelierStats ?? {}) },
          atelierStory: { ...defaultAtelierStory, ...(s.atelierStory ?? {}) },
          atelierGallery: { ...defaultAtelierGallery, ...(s.atelierGallery ?? {}) },
          atelierProcess: { ...defaultAtelierProcess, ...(s.atelierProcess ?? {}) },
          atelierMachines: { ...defaultAtelierMachines, ...(s.atelierMachines ?? {}) },
          atelierValues: { ...defaultAtelierValues, ...(s.atelierValues ?? {}) },
          atelierTeam: { ...defaultAtelierTeam, ...(s.atelierTeam ?? {}) },
          atelierCta: { ...defaultAtelierCta, ...(s.atelierCta ?? {}) },
          // Boutique page
          boutiqueHero: { ...defaultBoutiqueHero, ...(s.boutiqueHero ?? {}) },
          boutiqueProduct: { ...defaultBoutiqueProduct, ...(s.boutiqueProduct ?? {}) },
          boutiqueTabs: { ...defaultBoutiqueTabs, ...(s.boutiqueTabs ?? {}) },
          boutiqueRelated: { ...defaultBoutiqueRelated, ...(s.boutiqueRelated ?? {}) },
          boutiqueCart: { ...defaultBoutiqueCart, ...(s.boutiqueCart ?? {}) },
          boutiqueCheckout: { ...defaultBoutiqueCheckout, ...(s.boutiqueCheckout ?? {}) },
          boutiqueSuccess: { ...defaultBoutiqueSuccess, ...(s.boutiqueSuccess ?? {}) },
          boutiqueConfirmation: { ...defaultBoutiqueConfirmation, ...(s.boutiqueConfirmation ?? {}) },
          // Contact page
          contactHero: { ...defaultContactHero, ...(s.contactHero ?? {}) },
          contactForm: { ...defaultContactForm, ...(s.contactForm ?? {}) },
          pages: {
            home: s.pages?.home ?? defaultFormData.pages.home,
            atelier: s.pages?.atelier ?? defaultFormData.pages.atelier,
            services: s.pages?.services ?? defaultFormData.pages.services,
            realisations: s.pages?.realisations ?? defaultFormData.pages.realisations,
            boutique: s.pages?.boutique ?? defaultFormData.pages.boutique,
            contact: s.pages?.contact ?? defaultFormData.pages.contact,
          },
        });
      } catch (err) {
        console.error("Failed to load theme settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchTheme();
  }, []);

  // ─────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Erreur lors de la sauvegarde");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success("Enregistre !", "Les parametres du theme ont ete enregistres");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      toast.error("Erreur", err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  const updatePage = (pageKey: PageKey, field: "enabled" | "image" | "opacity", value: boolean | string | number) => {
    setFormData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          [field]: value,
        },
      },
    }));
  };

  const updateSection = (section: SectionKey, field: keyof SectionSettingsData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const resetSectionColors = (section: SectionKey) => {
    const defaults = SECTION_DEFAULTS[section];
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        titleColor: defaults.titleColor,
        bodyColor: defaults.bodyColor,
        paginationColor: defaults.paginationColor,
        paginationActiveColor: defaults.paginationActiveColor,
        paginationActiveBg: defaults.paginationActiveBg,
      },
    }));
  };

  const resetSectionCard = (section: SectionKey) => {
    const defaults = SECTION_DEFAULTS[section];
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        cardEnabled: defaults.cardEnabled,
        cardColor: defaults.cardColor,
        cardOpacity: defaults.cardOpacity,
        cardBlur: defaults.cardBlur,
      },
    }));
  };

  // ─────────────────────────────────────────────────────────
  // Render section list helper
  // ─────────────────────────────────────────────────────────

  const renderSections = (sections: SectionConfig[]) => (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionPanel
          key={section.key}
          section={section}
          bgData={formData[section.key]}
          defaults={SECTION_DEFAULTS[section.key]}
          updateSection={updateSection}
          resetSectionCard={resetSectionCard}
          resetSectionColors={resetSectionColors}
          formData={formData}
          setFormData={setFormData}
        />
      ))}
    </div>
  );

  const renderPageTexture = (pageKey: PageKey, pageLabel: string) => {
    const pageSettings = formData.pages[pageKey];
    return (
      <div className={`p-4 rounded-xl border-2 transition-all ${
        pageSettings.enabled ? "border-amber-300 bg-amber-50/50" : "border-gray-200 bg-gray-50/50"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              pageSettings.enabled ? "bg-amber-200 text-amber-700" : "bg-gray-200 text-gray-500"
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">Texture de fond</div>
              <div className="text-xs text-gray-500">Texture bois en arriere-plan de cette page</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pageSettings.enabled}
              onChange={(e) => updatePage(pageKey, "enabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
          </label>
        </div>

        {pageSettings.enabled && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Image de fond pour {pageLabel}
              </label>
              {pageSettings.image ? (
                <div className="relative group h-24 rounded-lg overflow-hidden border-2 border-amber-300">
                  <img src={pageSettings.image} alt={pageLabel} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100">
                      Changer
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("folder", "textures");
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        if (res.ok) {
                          const data = await res.json();
                          updatePage(pageKey, "image", data.url || data.path);
                        }
                      }} />
                    </label>
                    <button type="button" onClick={() => updatePage(pageKey, "image", "")} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Choisir une image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "textures");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      updatePage(pageKey, "image", data.url || data.path);
                    }
                  }} />
                </label>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overlay blanc :</span>
                <span className="font-bold text-amber-600">{pageSettings.opacity}%</span>
              </div>
              <input type="range" min="0" max="100" value={pageSettings.opacity} onChange={(e) => updatePage(pageKey, "opacity", parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-amber-600" />
            </div>

            {(pageSettings.image || formData.woodTexture) && (
              <div className="relative h-64 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                {/* Background texture image */}
                <div className="absolute inset-0 bg-cover bg-center bg-repeat" style={{ backgroundImage: `url(${pageSettings.image || formData.woodTexture})` }} />
                {/* White overlay with opacity */}
                <div className="absolute inset-0 bg-white transition-opacity duration-200" style={{ opacity: pageSettings.opacity / 100 }} />
                {/* Sample content to visualize readability */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-gray-900/70 text-white text-xs font-medium tracking-wide uppercase">
                    Apercu en direct
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {pageLabel}
                  </h3>
                  <p className="text-sm text-gray-600 text-center max-w-xs">
                    Exemple de texte sur cette page. Ajustez l&apos;opacite pour controler la visibilite de la texture.
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-lg font-medium">Bouton CTA</span>
                    <span className="px-3 py-1 border border-gray-400 text-gray-700 text-xs rounded-lg font-medium">Lien</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md font-mono">
                    {pageSettings.opacity}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header + Save */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TreePine className="w-7 h-7 text-amber-600" />
            Theme des Pages
          </h1>
          <p className="text-gray-500 mt-1">Apparence visuelle de chaque page du site</p>
        </div>
        <Button onClick={() => void handleSave()} disabled={isSaving} isLoading={isSaving}>
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Enregistre !
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Enregistrer
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB NAVIGATION                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "border-amber-500 text-amber-700 bg-amber-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Texture Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                <TreePine className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Texture bois globale</h2>
                <p className="text-xs text-gray-500">Cette image sera utilisee sur toutes les pages activees</p>
              </div>
            </div>
            <ImageUpload
              value={formData.woodTexture}
              onChange={(url) => setFormData({ ...formData, woodTexture: url })}
              folder="textures"
              aspectRatio="wide"
              maxSizeMB={50}
            />
          </div>

          {/* Unified Footer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold">Footer unifie (toutes les pages)</h2>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Activer texture sur le footer</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.footerEnabled}
                  onChange={(e) => setFormData({ ...formData, footerEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>

            {formData.footerEnabled && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Opacite overlay noir :</span>
                  <span className="font-bold text-amber-600">{formData.footerOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.footerOpacity}
                  onChange={(e) => setFormData({ ...formData, footerOpacity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0% = Texture claire</span>
                  <span>100% = Tres sombre</span>
                </div>

                {/* Footer Preview */}
                {formData.woodTexture && (
                  <div className="mt-4 relative h-24 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.woodTexture})` }}
                    />
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: formData.footerOpacity / 100 }}
                    />
                    <div className="relative z-10 flex items-center justify-center h-full text-white font-medium">
                      Apercu Footer
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACCUEIL TAB ── */}
      {activeTab === "accueil" && (
        <div className="space-y-6">
          {renderPageTexture("home", "Accueil")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page Accueil</h2>
                <p className="text-xs text-gray-500">6 sections configurables — cliquez pour ouvrir</p>
              </div>
            </div>
            {renderSections(HOMEPAGE_SECTIONS)}
          </div>
        </div>
      )}

      {/* ── ATELIER TAB ── */}
      {activeTab === "atelier" && (
        <div className="space-y-6">
          {renderPageTexture("atelier", "L'Atelier")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page</h2>
                <p className="text-xs text-gray-500">8 sections — de haut en bas</p>
              </div>
            </div>
            {renderSections(ATELIER_SECTIONS)}
          </div>
        </div>
      )}

      {/* ── SERVICES TAB ── */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {renderPageTexture("services", "Services")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page</h2>
                <p className="text-xs text-gray-500">3 sections — de haut en bas</p>
              </div>
            </div>
            {renderSections(SERVICES_SECTIONS)}
          </div>
        </div>
      )}

      {/* ── REALISATIONS TAB ── */}
      {activeTab === "realisations" && (
        <div className="space-y-6">
          {renderPageTexture("realisations", "Realisations")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page</h2>
                <p className="text-xs text-gray-500">4 sections — de haut en bas + page detail</p>
              </div>
            </div>
            {renderSections(REALISATIONS_SECTIONS)}
          </div>
        </div>
      )}

      {/* ── BOUTIQUE TAB ── */}
      {activeTab === "boutique" && (
        <div className="space-y-6">
          {renderPageTexture("boutique", "Boutique")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page</h2>
                <p className="text-xs text-gray-500">8 sections — hero, produit, onglets, similaires, panier, checkout, succes, confirmation</p>
              </div>
            </div>
            {renderSections(BOUTIQUE_SECTIONS)}
          </div>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {renderPageTexture("contact", "Contact")}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sections de la page</h2>
                <p className="text-xs text-gray-500">2 sections — de haut en bas</p>
              </div>
            </div>
            {renderSections(CONTACT_SECTIONS)}
          </div>
        </div>
      )}


      {/* Bottom Save */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={() => void handleSave()}
          disabled={isSaving}
          isLoading={isSaving}
          size="lg"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Enregistre !
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
