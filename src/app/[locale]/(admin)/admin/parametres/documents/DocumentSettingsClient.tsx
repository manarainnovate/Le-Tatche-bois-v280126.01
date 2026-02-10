"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Hash,
  FileText,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface DocumentSettings {
  id: string;
  devisPrefix: string;
  bcPrefix: string;
  blPrefix: string;
  pvPrefix: string;
  facturePrefix: string;
  avoirPrefix: string;
  defaultPaymentTerms: string | null;
  defaultDeliveryTime: string | null;
  defaultValidityDays: number;
  defaultPaymentDays: number;
  devisFooter: string | null;
  factureFooter: string | null;
  blFooter: string | null;
  generalConditions: string | null;
  showLogo: boolean;
  showBankInfo: boolean;
  showSignature: boolean;
}

interface DocumentSettingsClientProps {
  settings: DocumentSettings;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Paramètres documents",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Modifications enregistrées",
    error: "Erreur lors de l'enregistrement",
    numbering: "Numérotation",
    numberingHelp: "Préfixes utilisés pour la numérotation automatique des documents",
    devisPrefix: "Préfixe Devis",
    bcPrefix: "Préfixe Bon de Commande",
    blPrefix: "Préfixe Bon de Livraison",
    pvPrefix: "Préfixe PV Réception",
    facturePrefix: "Préfixe Facture",
    avoirPrefix: "Préfixe Avoir",
    preview: "Ex:",
    defaults: "Valeurs par défaut",
    defaultPaymentTerms: "Conditions de paiement",
    defaultDeliveryTime: "Délai de livraison",
    defaultValidityDays: "Validité devis (jours)",
    defaultPaymentDays: "Échéance facture (jours)",
    footers: "Pieds de page",
    footersHelp: "Textes affichés en bas des documents",
    devisFooter: "Pied de page Devis",
    factureFooter: "Pied de page Facture",
    blFooter: "Pied de page BL",
    conditions: "Conditions générales",
    conditionsHelp: "Conditions générales de vente (affichées au dos ou en annexe)",
    display: "Affichage PDF",
    showLogo: "Afficher le logo",
    showBankInfo: "Afficher les coordonnées bancaires",
    showSignature: "Afficher la zone de signature",
    yes: "Oui",
    no: "Non",
  },
  en: {
    title: "Document Settings",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    saved: "Changes saved",
    error: "Error saving",
    numbering: "Numbering",
    numberingHelp: "Prefixes used for automatic document numbering",
    devisPrefix: "Quote Prefix",
    bcPrefix: "Purchase Order Prefix",
    blPrefix: "Delivery Note Prefix",
    pvPrefix: "Reception Report Prefix",
    facturePrefix: "Invoice Prefix",
    avoirPrefix: "Credit Note Prefix",
    preview: "Ex:",
    defaults: "Default Values",
    defaultPaymentTerms: "Payment terms",
    defaultDeliveryTime: "Delivery time",
    defaultValidityDays: "Quote validity (days)",
    defaultPaymentDays: "Invoice due (days)",
    footers: "Footers",
    footersHelp: "Text displayed at the bottom of documents",
    devisFooter: "Quote footer",
    factureFooter: "Invoice footer",
    blFooter: "Delivery note footer",
    conditions: "General Conditions",
    conditionsHelp: "General terms and conditions (displayed on back or as attachment)",
    display: "PDF Display",
    showLogo: "Show logo",
    showBankInfo: "Show bank details",
    showSignature: "Show signature area",
    yes: "Yes",
    no: "No",
  },
  es: {
    title: "Configuración de documentos",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Cambios guardados",
    error: "Error al guardar",
    numbering: "Numeración",
    numberingHelp: "Prefijos utilizados para la numeración automática de documentos",
    devisPrefix: "Prefijo Cotización",
    bcPrefix: "Prefijo Orden de Compra",
    blPrefix: "Prefijo Nota de Entrega",
    pvPrefix: "Prefijo Acta de Recepción",
    facturePrefix: "Prefijo Factura",
    avoirPrefix: "Prefijo Nota de Crédito",
    preview: "Ej:",
    defaults: "Valores Predeterminados",
    defaultPaymentTerms: "Condiciones de pago",
    defaultDeliveryTime: "Tiempo de entrega",
    defaultValidityDays: "Validez cotización (días)",
    defaultPaymentDays: "Vencimiento factura (días)",
    footers: "Pies de Página",
    footersHelp: "Texto mostrado al pie de los documentos",
    devisFooter: "Pie de cotización",
    factureFooter: "Pie de factura",
    blFooter: "Pie de nota de entrega",
    conditions: "Condiciones Generales",
    conditionsHelp: "Términos y condiciones generales",
    display: "Visualización PDF",
    showLogo: "Mostrar logo",
    showBankInfo: "Mostrar datos bancarios",
    showSignature: "Mostrar área de firma",
    yes: "Sí",
    no: "No",
  },
  ar: {
    title: "إعدادات المستندات",
    back: "رجوع",
    save: "حفظ",
    saving: "جاري الحفظ...",
    saved: "تم حفظ التغييرات",
    error: "خطأ في الحفظ",
    numbering: "الترقيم",
    numberingHelp: "البادئات المستخدمة للترقيم التلقائي للمستندات",
    devisPrefix: "بادئة عرض السعر",
    bcPrefix: "بادئة أمر الشراء",
    blPrefix: "بادئة إشعار التسليم",
    pvPrefix: "بادئة محضر الاستلام",
    facturePrefix: "بادئة الفاتورة",
    avoirPrefix: "بادئة إشعار الائتمان",
    preview: "مثال:",
    defaults: "القيم الافتراضية",
    defaultPaymentTerms: "شروط الدفع",
    defaultDeliveryTime: "وقت التسليم",
    defaultValidityDays: "صلاحية العرض (أيام)",
    defaultPaymentDays: "استحقاق الفاتورة (أيام)",
    footers: "تذييلات الصفحة",
    footersHelp: "النص المعروض أسفل المستندات",
    devisFooter: "تذييل عرض السعر",
    factureFooter: "تذييل الفاتورة",
    blFooter: "تذييل إشعار التسليم",
    conditions: "الشروط العامة",
    conditionsHelp: "الشروط والأحكام العامة",
    display: "عرض PDF",
    showLogo: "عرض الشعار",
    showBankInfo: "عرض البيانات البنكية",
    showSignature: "عرض منطقة التوقيع",
    yes: "نعم",
    no: "لا",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DocumentSettingsClient({
  settings: initialSettings,
  locale,
}: DocumentSettingsClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  const handleChange = (field: keyof DocumentSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setSuccess(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings/documents", {
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Numbering Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Hash className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.numbering}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.numberingHelp}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "devisPrefix", label: t.devisPrefix },
              { key: "bcPrefix", label: t.bcPrefix },
              { key: "blPrefix", label: t.blPrefix },
              { key: "pvPrefix", label: t.pvPrefix },
              { key: "facturePrefix", label: t.facturePrefix },
              { key: "avoirPrefix", label: t.avoirPrefix },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={settings[field.key as keyof DocumentSettings] as string}
                  onChange={(e) =>
                    handleChange(field.key as keyof DocumentSettings, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t.preview} {settings[field.key as keyof DocumentSettings]}-{currentYear}-000001
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Defaults Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.defaults}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.defaultPaymentTerms}
              </label>
              <input
                type="text"
                value={settings.defaultPaymentTerms || ""}
                onChange={(e) => handleChange("defaultPaymentTerms", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.defaultDeliveryTime}
              </label>
              <input
                type="text"
                value={settings.defaultDeliveryTime || ""}
                onChange={(e) => handleChange("defaultDeliveryTime", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.defaultValidityDays}
              </label>
              <input
                type="number"
                min="1"
                value={settings.defaultValidityDays}
                onChange={(e) =>
                  handleChange("defaultValidityDays", parseInt(e.target.value) || 30)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.defaultPaymentDays}
              </label>
              <input
                type="number"
                min="0"
                value={settings.defaultPaymentDays}
                onChange={(e) =>
                  handleChange("defaultPaymentDays", parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.footers}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.footersHelp}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.devisFooter}
              </label>
              <textarea
                value={settings.devisFooter || ""}
                onChange={(e) => handleChange("devisFooter", e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.factureFooter}
              </label>
              <textarea
                value={settings.factureFooter || ""}
                onChange={(e) => handleChange("factureFooter", e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.blFooter}
              </label>
              <textarea
                value={settings.blFooter || ""}
                onChange={(e) => handleChange("blFooter", e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* General Conditions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.conditions}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.conditionsHelp}
          </p>
          <textarea
            value={settings.generalConditions || ""}
            onChange={(e) => handleChange("generalConditions", e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Display Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.display}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "showLogo", label: t.showLogo, icon: Eye },
              { key: "showBankInfo", label: t.showBankInfo, icon: Eye },
              { key: "showSignature", label: t.showSignature, icon: Eye },
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleChange(
                      field.key as keyof DocumentSettings,
                      !settings[field.key as keyof DocumentSettings]
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[field.key as keyof DocumentSettings]
                      ? "bg-amber-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[field.key as keyof DocumentSettings]
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
