import { create } from "zustand";
import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface SiteSettings {
  // General
  siteName: string;
  siteNameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  logoHeader: string;
  logoFooter: string;
  favicon: string;
  businessHours: string;
  yearFounded: string;
  defaultLocale: string;
  defaultCurrency: string;
  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressAr: string;
  city: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  hoursSundayAr: string;
  googleMapsUrl: string;
  // Social
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  linkedin: string;
  pinterest: string;
  tiktok: string;
}

interface SiteSettingsState {
  settings: SiteSettings;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchSettings: (forceRefresh?: boolean) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// DEFAULT SETTINGS
// ═══════════════════════════════════════════════════════════

const defaultSettings: SiteSettings = {
  // General
  siteName: "LE TATCHE BOIS",
  siteNameAr: "التاتش بوا",
  tagline: "Artisanat du bois marocain",
  taglineAr: "حرفة الخشب المغربية",
  description: "Artisan menuisier marocain - Fabrication sur mesure",
  descriptionAr: "حرفي نجارة مغربي - تصنيع حسب الطلب",
  logoHeader: "/images/logo.png",
  logoFooter: "/images/logo-light.png",
  favicon: "/favicon.ico",
  businessHours: "Lun-Sam: 9h-18h",
  yearFounded: "2020",
  defaultLocale: "fr",
  defaultCurrency: "MAD",
  // Contact
  phone: "+212 698 013 468",
  whatsapp: "+212 698 013 468",
  email: "contact@letatchebois.com",
  address: "Lot Hamane El Fetouaki N°365, Lamhamid",
  addressAr: "تجزئة حمان الفتواكي رقم 365، لمحاميد",
  city: "Marrakech",
  country: "Maroc",
  postalCode: "40000",
  latitude: 31.6295,
  longitude: -7.9811,
  hoursWeekdays: "08:00 - 18:00",
  hoursSaturday: "09:00 - 14:00",
  hoursSunday: "Fermé",
  hoursSundayAr: "مغلق",
  googleMapsUrl: "",
  // Social
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
  linkedin: "",
  pinterest: "",
  tiktok: "",
};

// ═══════════════════════════════════════════════════════════
// SITE SETTINGS STORE
// ═══════════════════════════════════════════════════════════

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchSettings: async (forceRefresh = false) => {
    // Don't fetch again if already loaded (unless forced)
    if (!forceRefresh && (get().isLoaded || get().isLoading)) return;

    set({ isLoading: true, error: null });

    try {
      // Disable cache to always get fresh settings
      const response = await fetch("/api/settings", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();

      // API returns { success, data: { settings } } so check for data.data.settings
      const apiSettings = data.data?.settings || data.settings;
      if (data.success && apiSettings) {
        const generalSettings = apiSettings.general || {};
        const contactSettings = apiSettings.contact || {};
        const socialSettings = apiSettings.social || {};

        set({
          settings: {
            // General
            siteName: generalSettings.siteName ?? defaultSettings.siteName,
            siteNameAr: generalSettings.siteNameAr ?? defaultSettings.siteNameAr,
            tagline: generalSettings.tagline ?? defaultSettings.tagline,
            taglineAr: generalSettings.taglineAr ?? defaultSettings.taglineAr,
            description: generalSettings.description ?? defaultSettings.description,
            descriptionAr: generalSettings.descriptionAr ?? defaultSettings.descriptionAr,
            logoHeader: generalSettings.logoHeader ?? defaultSettings.logoHeader,
            logoFooter: generalSettings.logoFooter ?? defaultSettings.logoFooter,
            favicon: generalSettings.favicon ?? defaultSettings.favicon,
            businessHours: generalSettings.businessHours ?? defaultSettings.businessHours,
            yearFounded: generalSettings.yearFounded ?? defaultSettings.yearFounded,
            defaultLocale: generalSettings.defaultLocale ?? defaultSettings.defaultLocale,
            defaultCurrency: generalSettings.defaultCurrency ?? defaultSettings.defaultCurrency,
            // Contact
            phone: contactSettings.phone ?? defaultSettings.phone,
            whatsapp: contactSettings.whatsapp ?? defaultSettings.whatsapp,
            email: contactSettings.email ?? defaultSettings.email,
            address: contactSettings.address ?? defaultSettings.address,
            addressAr: contactSettings.addressAr ?? defaultSettings.addressAr,
            city: contactSettings.city ?? defaultSettings.city,
            country: contactSettings.country ?? defaultSettings.country,
            postalCode: contactSettings.postalCode ?? defaultSettings.postalCode,
            latitude: contactSettings.latitude ?? defaultSettings.latitude,
            longitude: contactSettings.longitude ?? defaultSettings.longitude,
            hoursWeekdays: contactSettings.hoursWeekdays ?? defaultSettings.hoursWeekdays,
            hoursSaturday: contactSettings.hoursSaturday ?? defaultSettings.hoursSaturday,
            hoursSunday: contactSettings.hoursSunday ?? defaultSettings.hoursSunday,
            hoursSundayAr: contactSettings.hoursSundayAr ?? defaultSettings.hoursSundayAr,
            googleMapsUrl: contactSettings.googleMapsUrl ?? defaultSettings.googleMapsUrl,
            // Social
            facebook: socialSettings.facebook ?? defaultSettings.facebook,
            instagram: socialSettings.instagram ?? defaultSettings.instagram,
            youtube: socialSettings.youtube ?? defaultSettings.youtube,
            twitter: socialSettings.twitter ?? defaultSettings.twitter,
            linkedin: socialSettings.linkedin ?? defaultSettings.linkedin,
            pinterest: socialSettings.pinterest ?? defaultSettings.pinterest,
            tiktok: socialSettings.tiktok ?? defaultSettings.tiktok,
          },
          isLoaded: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
        isLoaded: true, // Mark as loaded even on error to use defaults
      });
    }
  },
}));

// ═══════════════════════════════════════════════════════════
// SSR-SAFE HOOK
// ═══════════════════════════════════════════════════════════

/**
 * SSR-safe hook for site settings
 * Automatically fetches settings on client-side mount
 * Returns default settings during SSR/hydration to prevent mismatch
 */
export function useSiteSettings() {
  const [isClient, setIsClient] = useState(false);
  const store = useSiteSettingsStore();
  const fetchSettings = store.fetchSettings;

  useEffect(() => {
    setIsClient(true);
    // Fetch settings on mount
    fetchSettings();
  }, [fetchSettings]);

  // During SSR or initial hydration, always return defaults to prevent mismatch
  if (!isClient) {
    return {
      ...defaultSettings,
      isLoaded: false,
      isLoading: false,
      error: null,
    };
  }

  return {
    ...store.settings,
    isLoaded: store.isLoaded,
    isLoading: store.isLoading,
    error: store.error,
  };
}
