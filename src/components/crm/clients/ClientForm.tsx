"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Loader2,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ClientFormData {
  name: string;
  type: "PARTICULIER" | "ENTREPRISE";
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  ice?: string;
  rc?: string;
  patente?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

interface ClientFormProps {
  locale: string;
  initialData?: Partial<ClientFormData> & { id?: string; clientNumber?: string };
  onSubmit?: (data: ClientFormData) => Promise<void>;
  onCancel?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Options
// ═══════════════════════════════════════════════════════════

const CITIES = [
  "Marrakech",
  "Casablanca",
  "Rabat",
  "Fes",
  "Tanger",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    newClient: "Nouveau client",
    editClient: "Modifier le client",
    generalInfo: "Informations générales",
    contactInfo: "Contact principal",
    fiscalInfo: "Informations fiscales",
    name: "Nom / Raison sociale",
    namePlaceholder: "Nom du client ou de l'entreprise",
    type: "Type de client",
    PARTICULIER: "Particulier",
    ENTREPRISE: "Entreprise",
    email: "Email",
    emailPlaceholder: "email@exemple.com",
    phone: "Téléphone",
    phonePlaceholder: "+212 6XX XXX XXX",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "+212 6XX XXX XXX",
    address: "Adresse",
    addressPlaceholder: "Adresse complète",
    city: "Ville",
    selectCity: "Sélectionner une ville",
    ice: "ICE",
    icePlaceholder: "Identifiant Commun de l'Entreprise",
    rc: "RC",
    rcPlaceholder: "Registre de Commerce",
    patente: "Patente",
    patentePlaceholder: "Numéro de patente",
    contactPerson: "Personne de contact",
    contactPersonPlaceholder: "Nom du contact principal",
    contactEmail: "Email du contact",
    contactPhone: "Téléphone du contact",
    notes: "Notes",
    notesPlaceholder: "Notes internes sur le client...",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    required: "Champ requis",
  },
  en: {
    newClient: "New client",
    editClient: "Edit client",
    generalInfo: "General information",
    contactInfo: "Primary contact",
    fiscalInfo: "Fiscal information",
    name: "Name / Company name",
    namePlaceholder: "Client or company name",
    type: "Client type",
    PARTICULIER: "Individual",
    ENTREPRISE: "Company",
    email: "Email",
    emailPlaceholder: "email@example.com",
    phone: "Phone",
    phonePlaceholder: "+212 6XX XXX XXX",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "+212 6XX XXX XXX",
    address: "Address",
    addressPlaceholder: "Full address",
    city: "City",
    selectCity: "Select a city",
    ice: "ICE",
    icePlaceholder: "Common Business Identifier",
    rc: "RC",
    rcPlaceholder: "Trade Register",
    patente: "Patente",
    patentePlaceholder: "Tax ID number",
    contactPerson: "Contact person",
    contactPersonPlaceholder: "Primary contact name",
    contactEmail: "Contact email",
    contactPhone: "Contact phone",
    notes: "Notes",
    notesPlaceholder: "Internal notes about the client...",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    required: "Required field",
  },
  es: {
    newClient: "Nuevo cliente",
    editClient: "Editar cliente",
    generalInfo: "Información general",
    contactInfo: "Contacto principal",
    fiscalInfo: "Información fiscal",
    name: "Nombre / Razón social",
    namePlaceholder: "Nombre del cliente o empresa",
    type: "Tipo de cliente",
    PARTICULIER: "Particular",
    ENTREPRISE: "Empresa",
    email: "Correo",
    emailPlaceholder: "correo@ejemplo.com",
    phone: "Teléfono",
    phonePlaceholder: "+212 6XX XXX XXX",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "+212 6XX XXX XXX",
    address: "Dirección",
    addressPlaceholder: "Dirección completa",
    city: "Ciudad",
    selectCity: "Seleccionar ciudad",
    ice: "ICE",
    icePlaceholder: "Identificador Común de Empresa",
    rc: "RC",
    rcPlaceholder: "Registro de Comercio",
    patente: "Patente",
    patentePlaceholder: "Número de patente",
    contactPerson: "Persona de contacto",
    contactPersonPlaceholder: "Nombre del contacto principal",
    contactEmail: "Email del contacto",
    contactPhone: "Teléfono del contacto",
    notes: "Notas",
    notesPlaceholder: "Notas internas sobre el cliente...",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    required: "Campo requerido",
  },
  ar: {
    newClient: "عميل جديد",
    editClient: "تعديل العميل",
    generalInfo: "معلومات عامة",
    contactInfo: "جهة الاتصال الرئيسية",
    fiscalInfo: "المعلومات الضريبية",
    name: "الاسم / اسم الشركة",
    namePlaceholder: "اسم العميل أو الشركة",
    type: "نوع العميل",
    PARTICULIER: "فرد",
    ENTREPRISE: "شركة",
    email: "البريد الإلكتروني",
    emailPlaceholder: "email@example.com",
    phone: "الهاتف",
    phonePlaceholder: "+212 6XX XXX XXX",
    whatsapp: "واتساب",
    whatsappPlaceholder: "+212 6XX XXX XXX",
    address: "العنوان",
    addressPlaceholder: "العنوان الكامل",
    city: "المدينة",
    selectCity: "اختر مدينة",
    ice: "ICE",
    icePlaceholder: "المعرف المشترك للمقاولة",
    rc: "RC",
    rcPlaceholder: "السجل التجاري",
    patente: "الرخصة",
    patentePlaceholder: "رقم الرخصة",
    contactPerson: "شخص الاتصال",
    contactPersonPlaceholder: "اسم جهة الاتصال الرئيسية",
    contactEmail: "البريد الإلكتروني للاتصال",
    contactPhone: "هاتف الاتصال",
    notes: "ملاحظات",
    notesPlaceholder: "ملاحظات داخلية حول العميل...",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    required: "حقل مطلوب",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientForm({
  locale,
  initialData,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "PARTICULIER",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    ice: initialData?.ice || "",
    rc: initialData?.rc || "",
    patente: initialData?.patente || "",
    contactPerson: initialData?.contactPerson || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    notes: initialData?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const url = isEdit
          ? `/api/crm/clients/${initialData?.id}`
          : "/api/crm/clients";
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to save client");
        }

        const result = await response.json();
        router.push(`/${locale}/admin/crm/clients/${result.data.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/${locale}/admin/crm/clients`);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all";

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      {initialData?.clientNumber && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {initialData.clientNumber}
          </span>
        </div>
      )}

      {/* General Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-amber-600" />
          {t.generalInfo}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Type */}
          <div className="md:col-span-2">
            <label className={labelClass}>{t.type}</label>
            <div className="flex gap-3">
              {(["PARTICULIER", "ENTREPRISE"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type }))}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                    formData.type === type
                      ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {type === "PARTICULIER" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  {t[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClass}>
              {t.name} *
            </label>
            <div className="relative">
              {formData.type === "ENTREPRISE" ? (
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              ) : (
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t.namePlaceholder}
                className={cn(inputClass, "pl-10", errors.name && "border-red-500")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              {t.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder={t.emailPlaceholder}
                className={cn(inputClass, "pl-10")}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={labelClass}>
              {t.phone}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder={t.phonePlaceholder}
                className={cn(inputClass, "pl-10")}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className={labelClass}>
              {t.whatsapp}
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))
              }
              placeholder={t.whatsappPlaceholder}
              className={inputClass}
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className={labelClass}>
              {t.city}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className={cn(inputClass, "pl-10")}
              >
                <option value="">{t.selectCity}</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>
              {t.address}
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder={t.addressPlaceholder}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Fiscal Information (for companies) */}
      {formData.type === "ENTREPRISE" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-amber-600" />
            {t.fiscalInfo}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ICE */}
            <div>
              <label htmlFor="ice" className={labelClass}>
                {t.ice}
              </label>
              <input
                id="ice"
                type="text"
                value={formData.ice}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ice: e.target.value }))
                }
                placeholder={t.icePlaceholder}
                className={inputClass}
              />
            </div>

            {/* RC */}
            <div>
              <label htmlFor="rc" className={labelClass}>
                {t.rc}
              </label>
              <input
                id="rc"
                type="text"
                value={formData.rc}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rc: e.target.value }))
                }
                placeholder={t.rcPlaceholder}
                className={inputClass}
              />
            </div>

            {/* Patente */}
            <div>
              <label htmlFor="patente" className={labelClass}>
                {t.patente}
              </label>
              <input
                id="patente"
                type="text"
                value={formData.patente}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, patente: e.target.value }))
                }
                placeholder={t.patentePlaceholder}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Person (for companies) */}
      {formData.type === "ENTREPRISE" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-amber-600" />
            {t.contactInfo}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact Person */}
            <div>
              <label htmlFor="contactPerson" className={labelClass}>
                {t.contactPerson}
              </label>
              <input
                id="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactPerson: e.target.value,
                  }))
                }
                placeholder={t.contactPersonPlaceholder}
                className={inputClass}
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className={labelClass}>
                {t.contactEmail}
              </label>
              <input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                placeholder={t.emailPlaceholder}
                className={inputClass}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className={labelClass}>
                {t.contactPhone}
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactPhone: e.target.value,
                  }))
                }
                placeholder={t.phonePlaceholder}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-amber-600" />
          {t.notes}
        </h3>

        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder={t.notesPlaceholder}
          rows={4}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.saving}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t.save}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default ClientForm;
