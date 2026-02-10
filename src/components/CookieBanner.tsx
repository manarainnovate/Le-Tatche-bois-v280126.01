"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, BarChart3, Megaphone, Settings, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCookieConsentStore } from "@/stores/cookieConsentStore";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface CookieBannerProps {
  locale: string;
  translations: {
    banner: {
      title: string;
      description: string;
      acceptAll: string;
      rejectAll: string;
      customize: string;
      learnMore: string;
    };
    modal: {
      title: string;
      description: string;
      necessary: {
        title: string;
        description: string;
      };
      analytics: {
        title: string;
        description: string;
      };
      marketing: {
        title: string;
        description: string;
      };
      savePreferences: string;
      close: string;
    };
  };
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════

const bannerVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
  exit: { y: 100, opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ═══════════════════════════════════════════════════════════
// TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  isRTL?: boolean;
}

function Toggle({ enabled, onChange, disabled = false, isRTL = false }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-wood-primary focus:ring-offset-2",
        enabled ? "bg-wood-primary" : "bg-gray-200",
        disabled && "cursor-not-allowed opacity-60"
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          enabled
            ? isRTL
              ? "translate-x-0"
              : "translate-x-5"
            : isRTL
              ? "translate-x-5"
              : "translate-x-0"
        )}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// COOKIE CATEGORY CARD
// ═══════════════════════════════════════════════════════════

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  isRTL?: boolean;
}

function CategoryCard({
  icon,
  title,
  description,
  enabled,
  onChange,
  disabled = false,
  isRTL = false,
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg bg-wood-light/50 border border-wood-secondary/20",
        isRTL && "flex-row-reverse"
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-wood-primary/10 rounded-lg flex items-center justify-center text-wood-primary">
        {icon}
      </div>
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
          <h4 className="font-semibold text-wood-dark">{title}</h4>
          <Toggle enabled={enabled} onChange={onChange} disabled={disabled} isRTL={isRTL} />
        </div>
        <p className="mt-1 text-sm text-wood-muted">{description}</p>
        {disabled && (
          <span
            className={cn(
              "inline-flex items-center gap-1 mt-2 text-xs text-wood-primary font-medium",
              isRTL && "flex-row-reverse"
            )}
          >
            <Check className="w-3 h-3" />
            {isRTL ? "مطلوب دائماً" : "Always required"}
          </span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PREFERENCES MODAL
// ═══════════════════════════════════════════════════════════

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations: CookieBannerProps["translations"]["modal"];
  locale: string;
}

function PreferencesModal({ isOpen, onClose, translations, locale }: PreferencesModalProps) {
  const isRTL = locale === "ar";
  const { preferences, savePreferences } = useCookieConsentStore();

  const [localPreferences, setLocalPreferences] = useState({
    analytics: preferences.analytics,
    marketing: preferences.marketing,
  });

  // Sync local preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalPreferences({
        analytics: preferences.analytics,
        marketing: preferences.marketing,
      });
    }
  }, [isOpen, preferences]);

  const handleSave = () => {
    savePreferences(localPreferences);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-white rounded-2xl shadow-2xl z-[61] overflow-hidden flex flex-col max-h-[90vh]",
              isRTL && "rtl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-wood-secondary/20">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 bg-wood-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-wood-primary" />
                </div>
                <h3 className="text-xl font-bold text-wood-dark">{translations.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-wood-light transition-colors"
                aria-label={translations.close}
              >
                <X className="w-5 h-5 text-wood-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-wood-muted text-sm">{translations.description}</p>

              {/* Necessary Cookies */}
              <CategoryCard
                icon={<Shield className="w-5 h-5" />}
                title={translations.necessary.title}
                description={translations.necessary.description}
                enabled={true}
                onChange={() => {}}
                disabled={true}
                isRTL={isRTL}
              />

              {/* Analytics Cookies */}
              <CategoryCard
                icon={<BarChart3 className="w-5 h-5" />}
                title={translations.analytics.title}
                description={translations.analytics.description}
                enabled={localPreferences.analytics}
                onChange={(enabled) => setLocalPreferences((prev) => ({ ...prev, analytics: enabled }))}
                isRTL={isRTL}
              />

              {/* Marketing Cookies */}
              <CategoryCard
                icon={<Megaphone className="w-5 h-5" />}
                title={translations.marketing.title}
                description={translations.marketing.description}
                enabled={localPreferences.marketing}
                onChange={(enabled) => setLocalPreferences((prev) => ({ ...prev, marketing: enabled }))}
                isRTL={isRTL}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-wood-secondary/20 bg-wood-light/30">
              <button
                onClick={handleSave}
                className="w-full bg-wood-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-wood-dark transition-colors"
              >
                {translations.savePreferences}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function CookieBanner({ locale, translations }: CookieBannerProps) {
  const isRTL = locale === "ar";
  const { hasConsented, acceptAll, rejectAll } = useCookieConsentStore();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server or before hydration
  if (!mounted) return null;

  // Don't show banner if user has already consented
  if (hasConsented) return null;

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {!hasConsented && (
          <motion.div
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
              isRTL && "rtl"
            )}
          >
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-wood-secondary/20 overflow-hidden">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className={cn("flex items-start gap-4 mb-4", isRTL && "flex-row-reverse")}>
                  <div className="flex-shrink-0 w-12 h-12 bg-wood-primary/10 rounded-xl flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-wood-primary" />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <h3 className="text-lg font-bold text-wood-dark mb-1">
                      {translations.banner.title}
                    </h3>
                    <p className="text-wood-muted text-sm leading-relaxed">
                      {translations.banner.description}{" "}
                      <Link
                        href={`/${locale}/cookies`}
                        className="text-wood-primary hover:underline font-medium"
                      >
                        {translations.banner.learnMore}
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className={cn(
                    "flex flex-col sm:flex-row gap-3 mt-6",
                    isRTL && "sm:flex-row-reverse"
                  )}
                >
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-wood-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-wood-dark transition-colors"
                  >
                    {translations.banner.acceptAll}
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 bg-wood-light text-wood-dark py-3 px-6 rounded-xl font-semibold hover:bg-wood-secondary/30 transition-colors border border-wood-secondary/30"
                  >
                    {translations.banner.rejectAll}
                  </button>
                  <button
                    onClick={handleCustomize}
                    className={cn(
                      "flex-1 bg-transparent text-wood-primary py-3 px-6 rounded-xl font-semibold hover:bg-wood-primary/5 transition-colors border border-wood-primary flex items-center justify-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    {translations.banner.customize}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        translations={translations.modal}
        locale={locale}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// FOOTER BUTTON TO RE-OPEN PREFERENCES
// ═══════════════════════════════════════════════════════════

interface CookiePreferencesButtonProps {
  locale: string;
  label: string;
}

export function CookiePreferencesButton({ locale, label }: CookiePreferencesButtonProps) {
  const isRTL = locale === "ar";
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Default translations for the modal when opened from footer
  const modalTranslations = {
    title: isRTL ? "إعدادات ملفات تعريف الارتباط" : locale === "es" ? "Configuración de cookies" : locale === "en" ? "Cookie Settings" : "Paramètres des cookies",
    description: isRTL ? "اختر ملفات تعريف الارتباط التي تريد قبولها" : locale === "es" ? "Elige qué cookies deseas aceptar" : locale === "en" ? "Choose which cookies you want to accept" : "Choisissez les cookies que vous souhaitez accepter",
    necessary: {
      title: isRTL ? "ملفات تعريف الارتباط الضرورية" : locale === "es" ? "Cookies necesarias" : locale === "en" ? "Necessary Cookies" : "Cookies nécessaires",
      description: isRTL ? "ضرورية لعمل الموقع بشكل صحيح" : locale === "es" ? "Esenciales para el funcionamiento del sitio" : locale === "en" ? "Essential for the website to function properly" : "Essentiels au bon fonctionnement du site",
    },
    analytics: {
      title: isRTL ? "ملفات تعريف الارتباط التحليلية" : locale === "es" ? "Cookies analíticas" : locale === "en" ? "Analytics Cookies" : "Cookies analytiques",
      description: isRTL ? "تساعدنا في فهم كيفية استخدام الموقع" : locale === "es" ? "Nos ayudan a entender cómo se usa el sitio" : locale === "en" ? "Help us understand how the site is used" : "Nous aident à comprendre comment le site est utilisé",
    },
    marketing: {
      title: isRTL ? "ملفات تعريف الارتباط التسويقية" : locale === "es" ? "Cookies de marketing" : locale === "en" ? "Marketing Cookies" : "Cookies marketing",
      description: isRTL ? "تستخدم لعرض إعلانات مخصصة" : locale === "es" ? "Utilizadas para mostrar anuncios personalizados" : locale === "en" ? "Used to display personalized ads" : "Utilisés pour afficher des publicités personnalisées",
    },
    savePreferences: isRTL ? "حفظ التفضيلات" : locale === "es" ? "Guardar preferencias" : locale === "en" ? "Save Preferences" : "Enregistrer les préférences",
    close: isRTL ? "إغلاق" : locale === "es" ? "Cerrar" : locale === "en" ? "Close" : "Fermer",
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          "flex items-center gap-2 text-sm text-wood-muted hover:text-wood-primary transition-colors",
          isRTL && "flex-row-reverse"
        )}
      >
        <Cookie className="w-4 h-4" />
        {label}
      </button>

      <PreferencesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        translations={modalTranslations}
        locale={locale}
      />
    </>
  );
}
