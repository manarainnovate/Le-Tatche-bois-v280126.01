import { create } from "zustand";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type PageKey = "home" | "atelier" | "services" | "realisations" | "boutique" | "contact";

export interface PageSettings {
  enabled: boolean;
  image: string;
  opacity: number;
}

export interface SectionSettings {
  // Background
  type: "color" | "image";
  color: string;
  image: string;
  overlayOpacity: number;
  overlayColor: string;
  // Overlay toggle
  overlayEnabled: boolean;
  // Text card (frosted glass)
  cardEnabled: boolean;
  cardColor: string;
  cardOpacity: number;
  cardBlur: boolean;
  // Text colors
  titleColor: string;
  bodyColor: string;
  // Pagination colors
  paginationColor: string;
  paginationActiveColor: string;
  paginationActiveBg: string;
}

/** @deprecated Use SectionSettings instead */
export type StatsBackgroundSettings = SectionSettings;
/** @deprecated Use SectionSettings instead */
export type SectionBackgroundSettings = SectionSettings;

export interface ThemeSettings {
  woodTexture: string;
  footerEnabled: boolean;
  footerOpacity: number;
  // Homepage sections
  statsBackground: SectionSettings;
  testimonialsBackground: SectionSettings;
  ctaBackground: SectionSettings;
  projectsBackground: SectionSettings;
  productsBackground: SectionSettings;
  aboutBackground: SectionSettings;
  aboutImage: string;
  /** @deprecated Use aboutBackground.cardEnabled instead */
  aboutTextCard: boolean;
  /** @deprecated Use aboutBackground.cardOpacity instead */
  aboutTextCardOpacity: number;
  // Services page sections
  servicesHero: SectionSettings;
  servicesGrid: SectionSettings;
  servicesCta: SectionSettings;
  // Realisations page sections
  realisationsHero: SectionSettings;
  realisationsGrid: SectionSettings;
  realisationsDetail: SectionSettings;
  realisationsCta: SectionSettings;
  // Atelier page sections
  atelierStats: SectionSettings;
  atelierStory: SectionSettings;
  atelierGallery: SectionSettings;
  atelierProcess: SectionSettings;
  atelierMachines: SectionSettings;
  atelierValues: SectionSettings;
  atelierTeam: SectionSettings;
  atelierCta: SectionSettings;
  // Boutique page sections
  boutiqueHero: SectionSettings;
  boutiqueProduct: SectionSettings;
  boutiqueTabs: SectionSettings;
  boutiqueRelated: SectionSettings;
  boutiqueCart: SectionSettings;
  boutiqueCheckout: SectionSettings;
  boutiqueSuccess: SectionSettings;
  boutiqueConfirmation: SectionSettings;
  // Contact page sections
  contactHero: SectionSettings;
  contactForm: SectionSettings;
  // Per-page texture settings
  pages: Record<PageKey, PageSettings>;
}

interface ThemeSettingsState {
  theme: ThemeSettings;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchTheme: (forceRefresh?: boolean) => Promise<void>;
  getPageSettings: (pageKey: PageKey) => PageSettings;
}

const defaultStatsBackground: SectionSettings = {
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

const defaultTestimonialsBackground: SectionSettings = {
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

const defaultCtaBackground: SectionSettings = {
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

const defaultProjectsBackground: SectionSettings = {
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

const defaultProductsBackground: SectionSettings = {
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

const defaultAboutBackground: SectionSettings = {
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

// ── Services page ──
const defaultServicesHero: SectionSettings = {
  type: "color",
  color: "#5D3A1A",
  image: "",
  overlayOpacity: 50,
  overlayColor: "#000000",
  overlayEnabled: true,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFFCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultServicesGrid: SectionSettings = {
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

const defaultServicesCta: SectionSettings = {
  type: "color",
  color: "#3B1E0A",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#000000",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFFCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

// ── Realisations page ──
const defaultRealisationsHero: SectionSettings = {
  type: "color",
  color: "#5D3A1A",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#000000",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFFCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultRealisationsGrid: SectionSettings = {
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

const defaultRealisationsDetail: SectionSettings = {
  type: "color",
  color: "#F9FAFB",
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

const defaultRealisationsCta: SectionSettings = {
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
  bodyColor: "#6B7280",
  paginationColor: "#6B7280",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

// ── Atelier page ──
const defaultAtelierDark: SectionSettings = {
  type: "color", color: "#5D3A1A", image: "", overlayOpacity: 0, overlayColor: "#000000", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#FFFFFF", bodyColor: "#FFFFFFCC", paginationColor: "#FFFFFF", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#FFFFFF26",
};
const defaultAtelierLight: SectionSettings = {
  type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3",
};
const defaultAtelierGray: SectionSettings = {
  type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#8B5E3C", paginationActiveBg: "#F5E6D3",
};

// ── Boutique page ──
const defaultBoutiqueHero: SectionSettings = {
  type: "color",
  color: "#5D3A1A",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#000000",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFFCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueProduct: SectionSettings = {
  type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueTabs: SectionSettings = {
  type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueRelated: SectionSettings = {
  type: "color", color: "#F9FAFB", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueCart: SectionSettings = {
  type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueCheckout: SectionSettings = {
  type: "color", color: "#FFFFFF", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueSuccess: SectionSettings = {
  type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};
const defaultBoutiqueConfirmation: SectionSettings = {
  type: "color", color: "#F0FDF4", image: "", overlayOpacity: 0, overlayColor: "#FFFFFF", overlayEnabled: false,
  cardEnabled: false, cardColor: "#FFFFFF", cardOpacity: 80, cardBlur: true,
  titleColor: "#5D3A1A", bodyColor: "#A0826D", paginationColor: "#6B7280", paginationActiveColor: "#FFFFFF", paginationActiveBg: "#5D3A1A",
};

// ── Contact page ──
const defaultContactHero: SectionSettings = {
  type: "color",
  color: "#3B1E0A",
  image: "",
  overlayOpacity: 0,
  overlayColor: "#000000",
  overlayEnabled: false,
  cardEnabled: false,
  cardColor: "#FFFFFF",
  cardOpacity: 80,
  cardBlur: true,
  titleColor: "#FFFFFF",
  bodyColor: "#FFFFFFCC",
  paginationColor: "#FFFFFF",
  paginationActiveColor: "#FFFFFF",
  paginationActiveBg: "#5D3A1A",
};

const defaultContactForm: SectionSettings = {
  type: "color",
  color: "#F5F0EB",
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

const defaultTheme: ThemeSettings = {
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
  aboutTextCard: true,
  aboutTextCardOpacity: 85,
  // Services page
  servicesHero: defaultServicesHero,
  servicesGrid: defaultServicesGrid,
  servicesCta: defaultServicesCta,
  // Realisations page
  realisationsHero: defaultRealisationsHero,
  realisationsGrid: defaultRealisationsGrid,
  realisationsDetail: defaultRealisationsDetail,
  realisationsCta: defaultRealisationsCta,
  // Atelier page
  atelierStats: defaultAtelierDark,
  atelierStory: defaultAtelierLight,
  atelierGallery: defaultAtelierGray,
  atelierProcess: defaultAtelierLight,
  atelierMachines: defaultAtelierDark,
  atelierValues: defaultAtelierLight,
  atelierTeam: defaultAtelierGray,
  atelierCta: defaultAtelierDark,
  // Boutique page
  boutiqueHero: defaultBoutiqueHero,
  boutiqueProduct: defaultBoutiqueProduct,
  boutiqueTabs: defaultBoutiqueTabs,
  boutiqueRelated: defaultBoutiqueRelated,
  boutiqueCart: defaultBoutiqueCart,
  boutiqueCheckout: defaultBoutiqueCheckout,
  boutiqueSuccess: defaultBoutiqueSuccess,
  boutiqueConfirmation: defaultBoutiqueConfirmation,
  // Contact page
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

// ═══════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════

export const useThemeSettingsStore = create<ThemeSettingsState>((set, get) => ({
  theme: defaultTheme,
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchTheme: async (forceRefresh = false) => {
    if (!forceRefresh && (get().isLoaded || get().isLoading)) return;
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/settings/theme", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch theme settings");

      const data = await response.json();
      const s = data.data?.settings || {};

      // Deep-merge each section with defaults so new fields get default values
      const aboutBg = {
        ...defaultTheme.aboutBackground,
        ...(s.aboutBackground ?? {}),
        // Backward compat: migrate legacy top-level aboutTextCard/aboutTextCardOpacity
        cardEnabled: s.aboutBackground?.cardEnabled ?? s.aboutTextCard ?? defaultTheme.aboutBackground.cardEnabled,
        cardOpacity: s.aboutBackground?.cardOpacity ?? s.aboutTextCardOpacity ?? defaultTheme.aboutBackground.cardOpacity,
      };

      set({
        theme: {
          woodTexture: s.woodTexture ?? defaultTheme.woodTexture,
          footerEnabled: s.footerEnabled ?? defaultTheme.footerEnabled,
          footerOpacity: s.footerOpacity ?? defaultTheme.footerOpacity,
          statsBackground: { ...defaultTheme.statsBackground, ...(s.statsBackground ?? {}) },
          testimonialsBackground: { ...defaultTheme.testimonialsBackground, ...(s.testimonialsBackground ?? {}) },
          ctaBackground: { ...defaultTheme.ctaBackground, ...(s.ctaBackground ?? {}) },
          projectsBackground: { ...defaultTheme.projectsBackground, ...(s.projectsBackground ?? {}) },
          productsBackground: { ...defaultTheme.productsBackground, ...(s.productsBackground ?? {}) },
          aboutBackground: aboutBg,
          aboutImage: s.aboutImage ?? defaultTheme.aboutImage,
          // Services page
          servicesHero: { ...defaultTheme.servicesHero, ...(s.servicesHero ?? {}) },
          servicesGrid: { ...defaultTheme.servicesGrid, ...(s.servicesGrid ?? {}) },
          servicesCta: { ...defaultTheme.servicesCta, ...(s.servicesCta ?? {}) },
          // Realisations page
          realisationsHero: { ...defaultTheme.realisationsHero, ...(s.realisationsHero ?? {}) },
          realisationsGrid: { ...defaultTheme.realisationsGrid, ...(s.realisationsGrid ?? {}) },
          realisationsDetail: { ...defaultTheme.realisationsDetail, ...(s.realisationsDetail ?? {}) },
          realisationsCta: { ...defaultTheme.realisationsCta, ...(s.realisationsCta ?? {}) },
          // Atelier page
          atelierStats: { ...defaultTheme.atelierStats, ...(s.atelierStats ?? {}) },
          atelierStory: { ...defaultTheme.atelierStory, ...(s.atelierStory ?? {}) },
          atelierGallery: { ...defaultTheme.atelierGallery, ...(s.atelierGallery ?? {}) },
          atelierProcess: { ...defaultTheme.atelierProcess, ...(s.atelierProcess ?? {}) },
          atelierMachines: { ...defaultTheme.atelierMachines, ...(s.atelierMachines ?? {}) },
          atelierValues: { ...defaultTheme.atelierValues, ...(s.atelierValues ?? {}) },
          atelierTeam: { ...defaultTheme.atelierTeam, ...(s.atelierTeam ?? {}) },
          atelierCta: { ...defaultTheme.atelierCta, ...(s.atelierCta ?? {}) },
          // Boutique page
          boutiqueHero: { ...defaultTheme.boutiqueHero, ...(s.boutiqueHero ?? {}) },
          boutiqueProduct: { ...defaultTheme.boutiqueProduct, ...(s.boutiqueProduct ?? {}) },
          boutiqueTabs: { ...defaultTheme.boutiqueTabs, ...(s.boutiqueTabs ?? {}) },
          boutiqueRelated: { ...defaultTheme.boutiqueRelated, ...(s.boutiqueRelated ?? {}) },
          boutiqueCart: { ...defaultTheme.boutiqueCart, ...(s.boutiqueCart ?? {}) },
          boutiqueCheckout: { ...defaultTheme.boutiqueCheckout, ...(s.boutiqueCheckout ?? {}) },
          boutiqueSuccess: { ...defaultTheme.boutiqueSuccess, ...(s.boutiqueSuccess ?? {}) },
          boutiqueConfirmation: { ...defaultTheme.boutiqueConfirmation, ...(s.boutiqueConfirmation ?? {}) },
          // Contact page
          contactHero: { ...defaultTheme.contactHero, ...(s.contactHero ?? {}) },
          contactForm: { ...defaultTheme.contactForm, ...(s.contactForm ?? {}) },
          aboutTextCard: aboutBg.cardEnabled,
          aboutTextCardOpacity: aboutBg.cardOpacity,
          pages: {
            home: s.pages?.home ?? defaultTheme.pages.home,
            atelier: s.pages?.atelier ?? defaultTheme.pages.atelier,
            services: s.pages?.services ?? defaultTheme.pages.services,
            realisations: s.pages?.realisations ?? defaultTheme.pages.realisations,
            boutique: s.pages?.boutique ?? defaultTheme.pages.boutique,
            contact: s.pages?.contact ?? defaultTheme.pages.contact,
          },
        },
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch theme settings:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
        isLoaded: true,
      });
    }
  },

  getPageSettings: (pageKey: PageKey) => {
    const { theme } = get();
    return theme.pages[pageKey] ?? { enabled: false, image: "", opacity: 20 };
  },
}));

// ═══════════════════════════════════════════════════════════
// SSR-SAFE HOOK
// ═══════════════════════════════════════════════════════════

export function useThemeSettings() {
  const [isClient, setIsClient] = useState(false);
  const store = useThemeSettingsStore();

  useEffect(() => {
    setIsClient(true);
    store.fetchTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isClient) {
    return {
      ...defaultTheme,
      isLoaded: false,
      isLoading: false,
      error: null,
      getPageSettings: () => ({ enabled: false, image: "", opacity: 20 }),
    };
  }

  return {
    ...store.theme,
    isLoaded: store.isLoaded,
    isLoading: store.isLoading,
    error: store.error,
    getPageSettings: store.getPageSettings,
  };
}
