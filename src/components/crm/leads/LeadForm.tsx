"use client";

import { useState, useEffect } from "react";
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
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface LeadFormData {
  contactName: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  source: string;
  urgency: string;
  projectType?: string;
  projectDescription?: string;
  estimatedBudget?: number;
  nextFollowUp?: string;
  notes?: string;
  assignedToId?: string;
}

interface User {
  id: string;
  name: string;
}

interface LeadFormProps {
  locale: string;
  initialData?: Partial<LeadFormData> & { id?: string; leadNumber?: string };
  users?: User[];
  onSubmit?: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Options
// ═══════════════════════════════════════════════════════════

const SOURCES = [
  "WEBSITE",
  "PHONE",
  "WHATSAPP",
  "EMAIL",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "EXHIBITION",
  "OTHER",
];

const URGENCY_LEVELS = ["HAUTE", "MOYENNE", "BASSE"];

const PROJECT_TYPES = ["FABRICATION", "INSTALLATION", "BOTH"];

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
    newLead: "Nouveau lead",
    editLead: "Modifier le lead",
    contactInfo: "Informations de contact",
    projectInfo: "Informations projet",
    followUp: "Suivi",
    contactName: "Nom du contact",
    contactNamePlaceholder: "Prénom et Nom",
    company: "Entreprise",
    companyPlaceholder: "Nom de l'entreprise (optionnel)",
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
    source: "Source",
    selectSource: "Sélectionner la source",
    urgency: "Urgence",
    projectType: "Type de projet",
    selectProjectType: "Sélectionner le type",
    projectDescription: "Description du projet",
    projectDescriptionPlaceholder: "Décrivez le projet en détail...",
    estimatedBudget: "Budget estimé (MAD)",
    estimatedBudgetPlaceholder: "Ex: 50000",
    nextFollowUp: "Prochain suivi",
    assignedTo: "Assigné à",
    selectUser: "Sélectionner un utilisateur",
    notes: "Notes internes",
    notesPlaceholder: "Notes visibles uniquement par l'équipe...",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    required: "Champ requis",
    WEBSITE: "Site web",
    PHONE: "Téléphone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Recommandation",
    SOCIAL_MEDIA: "Réseaux sociaux",
    EXHIBITION: "Salon/Exposition",
    OTHER: "Autre",
    HAUTE: "Haute",
    MOYENNE: "Moyenne",
    BASSE: "Basse",
    FABRICATION: "Fabrication",
    INSTALLATION: "Installation",
    BOTH: "Fabrication + Installation",
  },
  en: {
    newLead: "New lead",
    editLead: "Edit lead",
    contactInfo: "Contact information",
    projectInfo: "Project information",
    followUp: "Follow-up",
    contactName: "Contact name",
    contactNamePlaceholder: "First and Last name",
    company: "Company",
    companyPlaceholder: "Company name (optional)",
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
    source: "Source",
    selectSource: "Select source",
    urgency: "Urgency",
    projectType: "Project type",
    selectProjectType: "Select type",
    projectDescription: "Project description",
    projectDescriptionPlaceholder: "Describe the project in detail...",
    estimatedBudget: "Estimated budget (MAD)",
    estimatedBudgetPlaceholder: "E.g., 50000",
    nextFollowUp: "Next follow-up",
    assignedTo: "Assigned to",
    selectUser: "Select a user",
    notes: "Internal notes",
    notesPlaceholder: "Notes visible only to the team...",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    required: "Required field",
    WEBSITE: "Website",
    PHONE: "Phone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Referral",
    SOCIAL_MEDIA: "Social media",
    EXHIBITION: "Exhibition",
    OTHER: "Other",
    HAUTE: "High",
    MOYENNE: "Medium",
    BASSE: "Low",
    FABRICATION: "Manufacturing",
    INSTALLATION: "Installation",
    BOTH: "Manufacturing + Installation",
  },
  es: {
    newLead: "Nuevo prospecto",
    editLead: "Editar prospecto",
    contactInfo: "Información de contacto",
    projectInfo: "Información del proyecto",
    followUp: "Seguimiento",
    contactName: "Nombre del contacto",
    contactNamePlaceholder: "Nombre y Apellido",
    company: "Empresa",
    companyPlaceholder: "Nombre de la empresa (opcional)",
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
    source: "Fuente",
    selectSource: "Seleccionar fuente",
    urgency: "Urgencia",
    projectType: "Tipo de proyecto",
    selectProjectType: "Seleccionar tipo",
    projectDescription: "Descripción del proyecto",
    projectDescriptionPlaceholder: "Describa el proyecto en detalle...",
    estimatedBudget: "Presupuesto estimado (MAD)",
    estimatedBudgetPlaceholder: "Ej: 50000",
    nextFollowUp: "Próximo seguimiento",
    assignedTo: "Asignado a",
    selectUser: "Seleccionar usuario",
    notes: "Notas internas",
    notesPlaceholder: "Notas visibles solo para el equipo...",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    required: "Campo requerido",
    WEBSITE: "Sitio web",
    PHONE: "Teléfono",
    WHATSAPP: "WhatsApp",
    EMAIL: "Correo",
    REFERRAL: "Recomendación",
    SOCIAL_MEDIA: "Redes sociales",
    EXHIBITION: "Exposición",
    OTHER: "Otro",
    HAUTE: "Alta",
    MOYENNE: "Media",
    BASSE: "Baja",
    FABRICATION: "Fabricación",
    INSTALLATION: "Instalación",
    BOTH: "Fabricación + Instalación",
  },
  ar: {
    newLead: "عميل محتمل جديد",
    editLead: "تعديل العميل المحتمل",
    contactInfo: "معلومات الاتصال",
    projectInfo: "معلومات المشروع",
    followUp: "المتابعة",
    contactName: "اسم جهة الاتصال",
    contactNamePlaceholder: "الاسم الأول والأخير",
    company: "الشركة",
    companyPlaceholder: "اسم الشركة (اختياري)",
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
    source: "المصدر",
    selectSource: "اختر المصدر",
    urgency: "الأولوية",
    projectType: "نوع المشروع",
    selectProjectType: "اختر النوع",
    projectDescription: "وصف المشروع",
    projectDescriptionPlaceholder: "صف المشروع بالتفصيل...",
    estimatedBudget: "الميزانية المقدرة (درهم)",
    estimatedBudgetPlaceholder: "مثال: 50000",
    nextFollowUp: "المتابعة القادمة",
    assignedTo: "مسند إلى",
    selectUser: "اختر مستخدم",
    notes: "ملاحظات داخلية",
    notesPlaceholder: "ملاحظات مرئية فقط للفريق...",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    required: "حقل مطلوب",
    WEBSITE: "الموقع الإلكتروني",
    PHONE: "الهاتف",
    WHATSAPP: "واتساب",
    EMAIL: "البريد الإلكتروني",
    REFERRAL: "توصية",
    SOCIAL_MEDIA: "وسائل التواصل الاجتماعي",
    EXHIBITION: "معرض",
    OTHER: "آخر",
    HAUTE: "عالية",
    MOYENNE: "متوسطة",
    BASSE: "منخفضة",
    FABRICATION: "تصنيع",
    INSTALLATION: "تركيب",
    BOTH: "تصنيع + تركيب",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function LeadForm({
  locale,
  initialData,
  users = [],
  onSubmit,
  onCancel,
}: LeadFormProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState<LeadFormData>({
    contactName: initialData?.contactName || "",
    company: initialData?.company || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    source: initialData?.source || "WEBSITE",
    urgency: initialData?.urgency || "MOYENNE",
    projectType: initialData?.projectType || "",
    projectDescription: initialData?.projectDescription || "",
    estimatedBudget: initialData?.estimatedBudget || undefined,
    nextFollowUp: initialData?.nextFollowUp || "",
    notes: initialData?.notes || "",
    assignedToId: initialData?.assignedToId || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = t.required;
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
        // Default API call
        const url = isEdit
          ? `/api/crm/leads/${initialData?.id}`
          : "/api/crm/leads";
        const method = isEdit ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to save lead");
        }

        router.push(`/${locale}/admin/crm/leads`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/${locale}/admin/crm/leads`);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all";

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      {initialData?.leadNumber && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {initialData.leadNumber}
          </span>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-amber-600" />
          {t.contactInfo}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Name */}
          <div>
            <label htmlFor="contactName" className={labelClass}>
              {t.contactName} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="contactName"
                type="text"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactName: e.target.value }))
                }
                placeholder={t.contactNamePlaceholder}
                className={cn(inputClass, "pl-10", errors.contactName && "border-red-500")}
              />
            </div>
            {errors.contactName && (
              <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className={labelClass}>
              {t.company}
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
                placeholder={t.companyPlaceholder}
                className={cn(inputClass, "pl-10")}
              />
            </div>
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

      {/* Project Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-amber-600" />
          {t.projectInfo}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source */}
          <div>
            <label htmlFor="source" className={labelClass}>
              {t.source}
            </label>
            <select
              id="source"
              value={formData.source}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, source: e.target.value }))
              }
              className={inputClass}
            >
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {t[source] || source}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className={labelClass}>{t.urgency}</label>
            <div className="flex gap-2">
              {URGENCY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, urgency: level }))
                  }
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                    formData.urgency === level
                      ? level === "HAUTE"
                        ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                        : level === "MOYENNE"
                          ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                          : "bg-gray-100 text-gray-700 ring-2 ring-gray-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {level === "HAUTE" && <AlertCircle className="h-3.5 w-3.5" />}
                  {t[level]}
                </button>
              ))}
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="projectType" className={labelClass}>
              {t.projectType}
            </label>
            <select
              id="projectType"
              value={formData.projectType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, projectType: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">{t.selectProjectType}</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t[type] || type}
                </option>
              ))}
            </select>
          </div>

          {/* Estimated Budget */}
          <div>
            <label htmlFor="estimatedBudget" className={labelClass}>
              {t.estimatedBudget}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="estimatedBudget"
                type="number"
                min="0"
                value={formData.estimatedBudget || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedBudget: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder={t.estimatedBudgetPlaceholder}
                className={cn(inputClass, "pl-10")}
              />
            </div>
          </div>

          {/* Project Description */}
          <div className="md:col-span-2">
            <label htmlFor="projectDescription" className={labelClass}>
              {t.projectDescription}
            </label>
            <textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectDescription: e.target.value,
                }))
              }
              placeholder={t.projectDescriptionPlaceholder}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </div>
      </div>

      {/* Follow-up */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-600" />
          {t.followUp}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Next Follow-up */}
          <div>
            <label htmlFor="nextFollowUp" className={labelClass}>
              {t.nextFollowUp}
            </label>
            <input
              id="nextFollowUp"
              type="datetime-local"
              value={formData.nextFollowUp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nextFollowUp: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          {/* Assigned To */}
          {users.length > 0 && (
            <div>
              <label htmlFor="assignedToId" className={labelClass}>
                {t.assignedTo}
              </label>
              <select
                id="assignedToId"
                value={formData.assignedToId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, assignedToId: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">{t.selectUser}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              {t.notes}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder={t.notesPlaceholder}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </div>
        </div>
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

export default LeadForm;
