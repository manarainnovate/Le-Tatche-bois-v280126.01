"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Facebook,
  Instagram,
  MessageCircle,
  Youtube,
  Twitter,
  Linkedin,
  Building2,
  Phone,
  Share2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Pied de Page",
    subtitle: "Gérez le contenu du footer",
    companyInfo: "Informations Entreprise",
    description: "Description",
    descriptionPlaceholder: "LE TATCHE BOIS perpétue l'art de la menuiserie...",
    contactInfo: "Informations de Contact",
    address: "Adresse",
    phone: "Téléphone",
    email: "Email",
    hours: "Horaires",
    hoursPlaceholder: "Lun - Sam: 09:00 - 18:00",
    socialMedia: "Réseaux Sociaux",
    addSocial: "Ajouter un réseau",
    platform: "Plateforme",
    url: "URL",
    newsletter: "Newsletter",
    showNewsletter: "Afficher le formulaire newsletter",
    copyright: "Texte Copyright",
    copyrightPlaceholder: "© 2026 LE TATCHE BOIS. Tous droits réservés.",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Enregistré !",
    error: "Erreur lors de l'enregistrement",
    loading: "Chargement...",
  },
  en: {
    title: "Footer",
    subtitle: "Manage footer content",
    companyInfo: "Company Information",
    description: "Description",
    descriptionPlaceholder: "LE TATCHE BOIS perpetuates the art of woodworking...",
    contactInfo: "Contact Information",
    address: "Address",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
    hoursPlaceholder: "Mon - Sat: 09:00 - 18:00",
    socialMedia: "Social Media",
    addSocial: "Add social link",
    platform: "Platform",
    url: "URL",
    newsletter: "Newsletter",
    showNewsletter: "Show newsletter form",
    copyright: "Copyright Text",
    copyrightPlaceholder: "© 2026 LE TATCHE BOIS. All rights reserved.",
    save: "Save",
    saving: "Saving...",
    saved: "Saved!",
    error: "Error saving",
    loading: "Loading...",
  },
  es: {
    title: "Pie de Página",
    subtitle: "Gestiona el contenido del footer",
    companyInfo: "Información de la Empresa",
    description: "Descripción",
    descriptionPlaceholder: "LE TATCHE BOIS perpetúa el arte de la carpintería...",
    contactInfo: "Información de Contacto",
    address: "Dirección",
    phone: "Teléfono",
    email: "Email",
    hours: "Horarios",
    hoursPlaceholder: "Lun - Sáb: 09:00 - 18:00",
    socialMedia: "Redes Sociales",
    addSocial: "Añadir red social",
    platform: "Plataforma",
    url: "URL",
    newsletter: "Newsletter",
    showNewsletter: "Mostrar formulario newsletter",
    copyright: "Texto Copyright",
    copyrightPlaceholder: "© 2026 LE TATCHE BOIS. Todos los derechos reservados.",
    save: "Guardar",
    saving: "Guardando...",
    saved: "¡Guardado!",
    error: "Error al guardar",
    loading: "Cargando...",
  },
  ar: {
    title: "تذييل الصفحة",
    subtitle: "إدارة محتوى التذييل",
    companyInfo: "معلومات الشركة",
    description: "الوصف",
    descriptionPlaceholder: "لو تاتش بوا يحافظ على فن النجارة...",
    contactInfo: "معلومات الاتصال",
    address: "العنوان",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    hours: "ساعات العمل",
    hoursPlaceholder: "الاثنين - السبت: 09:00 - 18:00",
    socialMedia: "وسائل التواصل الاجتماعي",
    addSocial: "إضافة رابط اجتماعي",
    platform: "المنصة",
    url: "الرابط",
    newsletter: "النشرة الإخبارية",
    showNewsletter: "عرض نموذج النشرة",
    copyright: "نص حقوق النشر",
    copyrightPlaceholder: "© 2026 لو تاتش بوا. جميع الحقوق محفوظة.",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    error: "خطأ في الحفظ",
    loading: "جاري التحميل...",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  isActive: boolean;
}

interface FooterSettings {
  description: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  copyright: string;
  showNewsletter: boolean;
  socialLinks: SocialLink[];
}

interface PageProps {
  params: { locale: string };
}

type FooterTab = "company" | "contact" | "social" | "newsletter";

const TABS: { key: FooterTab; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { key: "company", icon: Building2, labelKey: "companyInfo" },
  { key: "contact", icon: Phone, labelKey: "contactInfo" },
  { key: "social", icon: Share2, labelKey: "socialMedia" },
  { key: "newsletter", icon: Mail, labelKey: "newsletter" },
];

// Social platforms
const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
];

// ═══════════════════════════════════════════════════════════
// Footer Settings Page
// ═══════════════════════════════════════════════════════════

export default function FooterSettingsPage({ params }: PageProps) {
  const locale = params.locale as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [settings, setSettings] = useState<FooterSettings>({
    description: "",
    address: "",
    phone: "",
    email: "",
    hours: "",
    copyright: "",
    showNewsletter: true,
    socialLinks: [],
  });
  const [activeTab, setActiveTab] = useState<FooterTab>("company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cms/settings?group=footer");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings({
              description: data.settings.description?.valueFr || "",
              address: data.settings.address?.valueFr || "",
              phone: data.settings.phone?.valueFr || "",
              email: data.settings.email?.valueFr || "",
              hours: data.settings.hours?.valueFr || "",
              copyright: data.settings.copyright?.valueFr || "",
              showNewsletter: data.settings.showNewsletter?.valueJson ?? true,
              socialLinks: data.socialLinks || [],
            });
          }
        }
      } catch (error) {
        console.error("Failed to load footer settings:", error);
      }
      setLoading(false);
    };
    void loadSettings();
  }, []);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "footer",
          settings: {
            description: { valueFr: settings.description },
            address: { valueFr: settings.address },
            phone: { valueFr: settings.phone },
            email: { valueFr: settings.email },
            hours: { valueFr: settings.hours },
            copyright: { valueFr: settings.copyright },
            showNewsletter: { valueJson: settings.showNewsletter },
          },
          socialLinks: settings.socialLinks,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save footer settings:", error);
    }
    setSaving(false);
  };

  // Add social link
  const addSocialLink = () => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "facebook", url: "", isActive: true },
      ],
    }));
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  // Update social link
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t.saving}
            </>
          ) : saved ? (
            t.saved
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {t.save}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {t[tab.labelKey as keyof typeof t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {/* Company Info Tab */}
        {activeTab === "company" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.description}
              </label>
              <textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                placeholder={t.descriptionPlaceholder}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.copyright}
              </label>
              <input
                type="text"
                value={settings.copyright}
                onChange={(e) =>
                  setSettings({ ...settings, copyright: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                placeholder={t.copyrightPlaceholder}
              />
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.address}
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.phone}
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.hours}
              </label>
              <input
                type="text"
                value={settings.hours}
                onChange={(e) =>
                  setSettings({ ...settings, hours: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                placeholder={t.hoursPlaceholder}
              />
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <div className="space-y-3">
            {settings.socialLinks.map((link, index) => {
              const platformInfo = socialPlatforms.find(
                (p) => p.value === link.platform
              );
              const Icon = platformInfo?.icon || Facebook;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <Icon className="h-5 w-5 text-gray-500" />

                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, "platform", e.target.value)
                    }
                    className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                  >
                    {socialPlatforms.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, "url", e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
                    placeholder="https://..."
                  />

                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addSocialLink}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <Plus className="h-4 w-4" />
              {t.addSocial}
            </button>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === "newsletter" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showNewsletter"
                checked={settings.showNewsletter}
                onChange={(e) =>
                  setSettings({ ...settings, showNewsletter: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-amber-600"
              />
              <label
                htmlFor="showNewsletter"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                {t.showNewsletter}
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
