"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Landmark,
  Percent,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface CompanySettings {
  id: string;
  companyName: string;
  tagline: string | null;
  address: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  phone: string | null;
  phoneAlt: string | null;
  email: string | null;
  website: string | null;
  rc: string | null;
  taxId: string | null;
  ice: string | null;
  pat: string | null;
  cnss: string | null;
  bankName: string | null;
  bankAgency: string | null;
  bankAddress: string | null;
  rib: string | null;
  iban: string | null;
  swift: string | null;
  defaultTvaRate: number;
  logoUrl: string | null;
}

interface CompanySettingsClientProps {
  settings: CompanySettings;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Paramètres entreprise",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Modifications enregistrées",
    error: "Erreur lors de l'enregistrement",
    identity: "Identité",
    companyName: "Raison sociale",
    tagline: "Slogan / Activité",
    logo: "Logo",
    uploadLogo: "Télécharger le logo",
    contact: "Coordonnées",
    address: "Adresse",
    city: "Ville",
    postalCode: "Code postal",
    country: "Pays",
    phone: "Téléphone",
    phoneAlt: "Téléphone secondaire",
    email: "Email",
    website: "Site web",
    legal: "Informations légales",
    legalHelp: "Informations obligatoires sur les documents commerciaux au Maroc",
    rc: "Registre de Commerce (RC)",
    taxId: "Identifiant Fiscal (IF)",
    ice: "Identifiant Commun d'Entreprise (ICE)",
    pat: "Patente",
    cnss: "CNSS",
    bank: "Informations bancaires",
    bankName: "Nom de la banque",
    rib: "Numéro de compte",
    iban: "IBAN",
    swift: "Code SWIFT/BIC",
    tva: "TVA",
    defaultTvaRate: "Taux de TVA (%)",
    yes: "Oui",
    no: "Non",
  },
  en: {
    title: "Company Settings",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    saved: "Changes saved",
    error: "Error saving",
    identity: "Identity",
    companyName: "Company name",
    tagline: "Tagline / Activity",
    logo: "Logo",
    uploadLogo: "Upload logo",
    contact: "Contact details",
    address: "Address",
    city: "City",
    postalCode: "Postal code",
    country: "Country",
    phone: "Phone",
    phoneAlt: "Secondary phone",
    email: "Email",
    website: "Website",
    legal: "Legal information",
    legalHelp: "Required information on commercial documents in Morocco",
    rc: "Trade Register (RC)",
    taxId: "Tax ID (IF)",
    ice: "Common Business ID (ICE)",
    pat: "Business License",
    cnss: "CNSS",
    bank: "Bank information",
    bankName: "Bank name",
    rib: "Account number",
    iban: "IBAN",
    swift: "SWIFT/BIC code",
    tva: "VAT",
    defaultTvaRate: "VAT rate (%)",
    yes: "Yes",
    no: "No",
  },
  es: {
    title: "Configuración de empresa",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Cambios guardados",
    error: "Error al guardar",
    identity: "Identidad",
    companyName: "Nombre de la empresa",
    tagline: "Eslogan / Actividad",
    logo: "Logo",
    uploadLogo: "Subir logo",
    contact: "Datos de contacto",
    address: "Dirección",
    city: "Ciudad",
    postalCode: "Código postal",
    country: "País",
    phone: "Teléfono",
    phoneAlt: "Teléfono secundario",
    email: "Email",
    website: "Sitio web",
    legal: "Información legal",
    legalHelp: "Información obligatoria en documentos comerciales en Marruecos",
    rc: "Registro Comercial (RC)",
    taxId: "ID Fiscal (IF)",
    ice: "ID Común de Empresa (ICE)",
    pat: "Licencia comercial",
    cnss: "CNSS",
    bank: "Información bancaria",
    bankName: "Nombre del banco",
    rib: "Número de cuenta",
    iban: "IBAN",
    swift: "Código SWIFT/BIC",
    tva: "IVA",
    defaultTvaRate: "Tasa de IVA (%)",
    yes: "Sí",
    no: "No",
  },
  ar: {
    title: "إعدادات الشركة",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم حفظ التغييرات",
    error: "خطأ في الحفظ",
    identity: "الهوية",
    companyName: "اسم الشركة",
    tagline: "الشعار / النشاط",
    logo: "الشعار",
    uploadLogo: "رفع الشعار",
    contact: "بيانات الاتصال",
    address: "العنوان",
    city: "المدينة",
    postalCode: "الرمز البريدي",
    country: "البلد",
    phone: "الهاتف",
    phoneAlt: "الهاتف الثانوي",
    email: "البريد الإلكتروني",
    website: "الموقع الإلكتروني",
    legal: "المعلومات القانونية",
    legalHelp: "المعلومات المطلوبة على الوثائق التجارية في المغرب",
    rc: "السجل التجاري (RC)",
    taxId: "الرقم الضريبي (IF)",
    ice: "المعرف الموحد للمقاولة (ICE)",
    pat: "الرخصة التجارية",
    cnss: "CNSS",
    bank: "المعلومات البنكية",
    bankName: "اسم البنك",
    rib: "رقم الحساب",
    iban: "IBAN",
    swift: "رمز SWIFT/BIC",
    tva: "الضريبة على القيمة المضافة",
    defaultTvaRate: "معدل TVA (%)",
    yes: "نعم",
    no: "لا",
  },
};

type CompanyTab = "identity" | "contact" | "legal" | "bank" | "tva";

const COMPANY_TABS: { key: CompanyTab; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
  { key: "identity", icon: Building2, labelKey: "identity" },
  { key: "contact", icon: MapPin, labelKey: "contact" },
  { key: "legal", icon: FileText, labelKey: "legal" },
  { key: "bank", icon: Landmark, labelKey: "bank" },
  { key: "tva", icon: Percent, labelKey: "tva" },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function CompanySettingsClient({
  settings: initialSettings,
  locale,
}: CompanySettingsClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<CompanyTab>("identity");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setSuccess(false);
    setError("");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logos");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.uploads && data.uploads.length > 0) {
        handleChange("logoUrl", data.uploads[0].url);
      } else {
        setError(data.error || "Failed to upload logo");
      }
    } catch (err) {
      setError("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      // Reset input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    handleChange("logoUrl", null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/parametres`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.saving}
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {t.save}
            </>
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-600 dark:text-green-400">{t.saved}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {COMPANY_TABS.map((tab) => {
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
                {t[tab.labelKey]}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Identity Tab */}
        {activeTab === "identity" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.companyName} *
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.tagline}
              </label>
              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.logo}
              </label>
              <div className="flex items-start gap-4">
                {/* Current Logo Preview */}
                {settings.logoUrl ? (
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      uploadingLogo ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t.uploadLogo}</span>
                      </>
                    )}
                  </label>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, SVG. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.address}
              </label>
              <input
                type="text"
                value={settings.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.city}
              </label>
              <input
                type="text"
                value={settings.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.country}
              </label>
              <input
                type="text"
                value={settings.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.phone}
              </label>
              <input
                type="tel"
                value={settings.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.phoneAlt}
              </label>
              <input
                type="tel"
                value={settings.phoneAlt || ""}
                onChange={(e) => handleChange("phoneAlt", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.website}
              </label>
              <input
                type="url"
                value={settings.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        )}

        {/* Legal Tab */}
        {activeTab === "legal" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.legalHelp}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.rc}
              </label>
              <input
                type="text"
                value={settings.rc || ""}
                onChange={(e) => handleChange("rc", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.taxId}
              </label>
              <input
                type="text"
                value={settings.taxId || ""}
                onChange={(e) => handleChange("taxId", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.ice}
              </label>
              <input
                type="text"
                value={settings.ice || ""}
                onChange={(e) => handleChange("ice", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.pat}
              </label>
              <input
                type="text"
                value={settings.pat || ""}
                onChange={(e) => handleChange("pat", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.cnss}
              </label>
              <input
                type="text"
                value={settings.cnss || ""}
                onChange={(e) => handleChange("cnss", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        )}

        {/* Bank Tab */}
        {activeTab === "bank" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.bankName}
              </label>
              <input
                type="text"
                value={settings.bankName || ""}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.rib}
              </label>
              <input
                type="text"
                value={settings.rib || ""}
                onChange={(e) => handleChange("rib", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.iban}
              </label>
              <input
                type="text"
                value={settings.iban || ""}
                onChange={(e) => handleChange("iban", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.swift}
              </label>
              <input
                type="text"
                value={settings.swift || ""}
                onChange={(e) => handleChange("swift", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        )}

        {/* TVA Tab */}
        {activeTab === "tva" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.defaultTvaRate}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultTvaRate}
                onChange={(e) => handleChange("defaultTvaRate", parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        )}
      </form>
    </div>
  );
}
