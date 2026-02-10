"use client";

import { cn } from "@/lib/utils";
import {
  Settings,
  Phone,
  Share2,
  Truck,
  CreditCard,
  Search,
  Mail,
  BarChart3,
  ShoppingBag,
  Bell,
  Coins,
  Scale,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type SettingsTab =
  | "general"
  | "contact"
  | "social"
  | "shipping"
  | "payment"
  | "seo"
  | "tracking"
  | "boutique"
  | "notifications"
  | "devises"
  | "legal"
  | "emails";

interface TabInfo {
  id: SettingsTab;
  icon: React.ElementType;
  labelKey: string;
}

const tabs: TabInfo[] = [
  { id: "general", icon: Settings, labelKey: "general" },
  { id: "contact", icon: Phone, labelKey: "contact" },
  { id: "social", icon: Share2, labelKey: "social" },
  { id: "shipping", icon: Truck, labelKey: "shipping" },
  { id: "payment", icon: CreditCard, labelKey: "payment" },
  { id: "seo", icon: Search, labelKey: "seo" },
  { id: "tracking", icon: BarChart3, labelKey: "tracking" },
  { id: "boutique", icon: ShoppingBag, labelKey: "boutique" },
  { id: "notifications", icon: Bell, labelKey: "notifications" },
  { id: "devises", icon: Coins, labelKey: "devises" },
  { id: "legal", icon: Scale, labelKey: "legal" },
  { id: "emails", icon: Mail, labelKey: "emails" },
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    general: "General",
    contact: "Contact",
    social: "Reseaux sociaux",
    shipping: "Livraison",
    payment: "Paiement",
    seo: "SEO",
    tracking: "Tracking & Pixels",
    boutique: "Boutique",
    notifications: "Notifications",
    devises: "Devises",
    legal: "Legal",
    emails: "Emails",
    unsavedChanges: "Modifications non enregistrees",
  },
  en: {
    general: "General",
    contact: "Contact",
    social: "Social Media",
    shipping: "Shipping",
    payment: "Payment",
    seo: "SEO",
    tracking: "Tracking & Pixels",
    boutique: "Shop",
    notifications: "Notifications",
    devises: "Currencies",
    legal: "Legal",
    emails: "Emails",
    unsavedChanges: "Unsaved changes",
  },
  es: {
    general: "General",
    contact: "Contacto",
    social: "Redes Sociales",
    shipping: "Envio",
    payment: "Pago",
    seo: "SEO",
    tracking: "Seguimiento y Pixeles",
    boutique: "Tienda",
    notifications: "Notificaciones",
    devises: "Monedas",
    legal: "Legal",
    emails: "Correos",
    unsavedChanges: "Cambios sin guardar",
  },
  ar: {
    general: "عام",
    contact: "الاتصال",
    social: "التواصل الاجتماعي",
    shipping: "الشحن",
    payment: "الدفع",
    seo: "تحسين محركات البحث",
    tracking: "التتبع والبكسل",
    boutique: "المتجر",
    notifications: "الإشعارات",
    devises: "العملات",
    legal: "قانوني",
    emails: "البريد الإلكتروني",
    unsavedChanges: "تغييرات غير محفوظة",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  hasUnsavedChanges?: Partial<Record<SettingsTab, boolean>>;
  locale?: string;
}

export function SettingsTabs({
  activeTab,
  onTabChange,
  hasUnsavedChanges = {},
  locale = "fr",
}: SettingsTabsProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const hasChanges = hasUnsavedChanges[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
              isRTL && "flex-row-reverse text-end"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{t[tab.labelKey as keyof typeof t]}</span>
            {hasChanges && (
              <span
                className="h-2 w-2 rounded-full bg-amber-500"
                title={t.unsavedChanges}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export { tabs };
