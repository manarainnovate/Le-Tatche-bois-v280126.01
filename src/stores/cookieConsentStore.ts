import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentState {
  hasConsented: boolean;
  preferences: CookiePreferences;
  consentDate: string | null;
  consentId: string | null;
}

interface CookieConsentStore extends ConsentState {
  // Actions
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: Omit<CookiePreferences, "necessary">) => void;
  resetConsent: () => void;
  getConsentForType: (type: keyof CookiePreferences) => boolean;
}

// ═══════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════

const initialState: ConsentState = {
  hasConsented: false,
  preferences: {
    necessary: true,
    analytics: false,
    marketing: false,
  },
  consentDate: null,
  consentId: null,
};

// ═══════════════════════════════════════════════════════════
// HELPER: Generate consent ID
// ═══════════════════════════════════════════════════════════

const generateConsentId = (): string => {
  return `consent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ═══════════════════════════════════════════════════════════
// HELPER: Log consent to API
// ═══════════════════════════════════════════════════════════

const logConsentToAPI = async (
  consentId: string,
  preferences: CookiePreferences,
  action: "accept_all" | "reject_all" | "custom"
): Promise<void> => {
  try {
    // TODO: Replace with actual API endpoint
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consentId,
        preferences,
        action,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      }),
    });
  } catch {
    // Silently fail - consent is still saved locally
    console.warn("Failed to log consent to API");
  }
};

// ═══════════════════════════════════════════════════════════
// HELPER: Update Google Analytics consent
// ═══════════════════════════════════════════════════════════

const updateGoogleAnalyticsConsent = (granted: boolean): void => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }
};

const updateMarketingConsent = (granted: boolean): void => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════

export const useCookieConsentStore = create<CookieConsentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      acceptAll: () => {
        const consentId = generateConsentId();
        const preferences: CookiePreferences = {
          necessary: true,
          analytics: true,
          marketing: true,
        };

        set({
          hasConsented: true,
          preferences,
          consentDate: new Date().toISOString(),
          consentId,
        });

        // Update consent for tracking
        updateGoogleAnalyticsConsent(true);
        updateMarketingConsent(true);

        // Log to API
        void logConsentToAPI(consentId, preferences, "accept_all");
      },

      rejectAll: () => {
        const consentId = generateConsentId();
        const preferences: CookiePreferences = {
          necessary: true,
          analytics: false,
          marketing: false,
        };

        set({
          hasConsented: true,
          preferences,
          consentDate: new Date().toISOString(),
          consentId,
        });

        // Update consent for tracking
        updateGoogleAnalyticsConsent(false);
        updateMarketingConsent(false);

        // Log to API
        void logConsentToAPI(consentId, preferences, "reject_all");
      },

      savePreferences: (customPreferences) => {
        const consentId = generateConsentId();
        const preferences: CookiePreferences = {
          necessary: true,
          ...customPreferences,
        };

        set({
          hasConsented: true,
          preferences,
          consentDate: new Date().toISOString(),
          consentId,
        });

        // Update consent for tracking
        updateGoogleAnalyticsConsent(customPreferences.analytics);
        updateMarketingConsent(customPreferences.marketing);

        // Log to API
        void logConsentToAPI(consentId, preferences, "custom");
      },

      resetConsent: () => {
        set(initialState);
        updateGoogleAnalyticsConsent(false);
        updateMarketingConsent(false);
      },

      getConsentForType: (type) => {
        const state = get();
        if (!state.hasConsented) return type === "necessary";
        return state.preferences[type];
      },
    }),
    {
      name: "cookie-consent",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ═══════════════════════════════════════════════════════════
// GTAG TYPE DECLARATION
// ═══════════════════════════════════════════════════════════

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
