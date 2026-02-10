"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Save,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Wallet,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  clientNumber: string;
  fullName: string;
}

interface User {
  id: string;
  name: string | null;
}

interface ProjectFormData {
  clientId: string;
  name: string;
  description?: string;
  type: "FABRICATION" | "INSTALLATION" | "BOTH";
  status?: string;
  priority: string;
  siteAddress?: string;
  siteCity?: string;
  sitePostalCode?: string;
  startDate?: string;
  expectedEndDate?: string;
  estimatedBudget?: number;
  materialCost?: number;
  laborCost?: number;
  specifications?: string;
  assignedToId?: string;
}

interface ProjectFormProps {
  locale: string;
  clients: Client[];
  users?: User[];
  initialData?: Partial<ProjectFormData> & { id?: string };
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: (project: any) => void;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  editTitle: string;
  clientInfo: string;
  selectClient: string;
  projectName: string;
  projectNamePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  type: string;
  fabrication: string;
  installation: string;
  both: string;
  priority: string;
  low: string;
  medium: string;
  high: string;
  urgent: string;
  siteInfo: string;
  address: string;
  addressPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  postalCode: string;
  postalCodePlaceholder: string;
  dates: string;
  startDate: string;
  expectedEndDate: string;
  budget: string;
  estimatedBudget: string;
  materialCost: string;
  laborCost: string;
  specifications: string;
  specificationsPlaceholder: string;
  assignedTo: string;
  selectUser: string;
  save: string;
  saving: string;
  cancel: string;
  requiredField: string;
  error: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Nouveau Projet",
    editTitle: "Modifier le Projet",
    clientInfo: "Informations Client",
    selectClient: "Sélectionner un client",
    projectName: "Nom du projet",
    projectNamePlaceholder: "Ex: Dressing Lamhamid – M. X",
    description: "Description",
    descriptionPlaceholder: "Description du projet...",
    type: "Type de projet",
    fabrication: "Fabrication",
    installation: "Pose",
    both: "Fabrication + Pose",
    priority: "Priorité",
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgente",
    siteInfo: "Site d'intervention",
    address: "Adresse",
    addressPlaceholder: "Adresse du site",
    city: "Ville",
    cityPlaceholder: "Ville",
    postalCode: "Code postal",
    postalCodePlaceholder: "Code postal",
    dates: "Dates",
    startDate: "Date de début",
    expectedEndDate: "Date de fin prévue",
    budget: "Budget",
    estimatedBudget: "Budget estimé (DH)",
    materialCost: "Coût matériaux (DH)",
    laborCost: "Coût main d'oeuvre (DH)",
    specifications: "Spécifications",
    specificationsPlaceholder: "Matériaux, finitions, coloris, quincaillerie...",
    assignedTo: "Assigné à",
    selectUser: "Sélectionner un utilisateur",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    requiredField: "Ce champ est requis",
    error: "Une erreur est survenue",
  },
  en: {
    title: "New Project",
    editTitle: "Edit Project",
    clientInfo: "Client Information",
    selectClient: "Select a client",
    projectName: "Project name",
    projectNamePlaceholder: "Ex: Dressing Lamhamid – Mr. X",
    description: "Description",
    descriptionPlaceholder: "Project description...",
    type: "Project type",
    fabrication: "Fabrication",
    installation: "Installation",
    both: "Fabrication + Installation",
    priority: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    siteInfo: "Intervention site",
    address: "Address",
    addressPlaceholder: "Site address",
    city: "City",
    cityPlaceholder: "City",
    postalCode: "Postal code",
    postalCodePlaceholder: "Postal code",
    dates: "Dates",
    startDate: "Start date",
    expectedEndDate: "Expected end date",
    budget: "Budget",
    estimatedBudget: "Estimated budget (DH)",
    materialCost: "Material cost (DH)",
    laborCost: "Labor cost (DH)",
    specifications: "Specifications",
    specificationsPlaceholder: "Materials, finishes, colors, hardware...",
    assignedTo: "Assigned to",
    selectUser: "Select a user",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    requiredField: "This field is required",
    error: "An error occurred",
  },
  es: {
    title: "Nuevo Proyecto",
    editTitle: "Editar Proyecto",
    clientInfo: "Información del Cliente",
    selectClient: "Seleccionar un cliente",
    projectName: "Nombre del proyecto",
    projectNamePlaceholder: "Ej: Vestidor Lamhamid – Sr. X",
    description: "Descripción",
    descriptionPlaceholder: "Descripción del proyecto...",
    type: "Tipo de proyecto",
    fabrication: "Fabricación",
    installation: "Instalación",
    both: "Fabricación + Instalación",
    priority: "Prioridad",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
    siteInfo: "Sitio de intervención",
    address: "Dirección",
    addressPlaceholder: "Dirección del sitio",
    city: "Ciudad",
    cityPlaceholder: "Ciudad",
    postalCode: "Código postal",
    postalCodePlaceholder: "Código postal",
    dates: "Fechas",
    startDate: "Fecha de inicio",
    expectedEndDate: "Fecha de fin esperada",
    budget: "Presupuesto",
    estimatedBudget: "Presupuesto estimado (DH)",
    materialCost: "Costo de materiales (DH)",
    laborCost: "Costo de mano de obra (DH)",
    specifications: "Especificaciones",
    specificationsPlaceholder: "Materiales, acabados, colores, herrajes...",
    assignedTo: "Asignado a",
    selectUser: "Seleccionar un usuario",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    requiredField: "Este campo es obligatorio",
    error: "Ocurrió un error",
  },
  ar: {
    title: "مشروع جديد",
    editTitle: "تعديل المشروع",
    clientInfo: "معلومات العميل",
    selectClient: "اختر عميل",
    projectName: "اسم المشروع",
    projectNamePlaceholder: "مثال: خزانة لمحميد – السيد س",
    description: "الوصف",
    descriptionPlaceholder: "وصف المشروع...",
    type: "نوع المشروع",
    fabrication: "تصنيع",
    installation: "تركيب",
    both: "تصنيع + تركيب",
    priority: "الأولوية",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    urgent: "عاجلة",
    siteInfo: "موقع التدخل",
    address: "العنوان",
    addressPlaceholder: "عنوان الموقع",
    city: "المدينة",
    cityPlaceholder: "المدينة",
    postalCode: "الرمز البريدي",
    postalCodePlaceholder: "الرمز البريدي",
    dates: "التواريخ",
    startDate: "تاريخ البداية",
    expectedEndDate: "تاريخ الانتهاء المتوقع",
    budget: "الميزانية",
    estimatedBudget: "الميزانية المقدرة (درهم)",
    materialCost: "تكلفة المواد (درهم)",
    laborCost: "تكلفة اليد العاملة (درهم)",
    specifications: "المواصفات",
    specificationsPlaceholder: "المواد، التشطيبات، الألوان، الأدوات...",
    assignedTo: "مسند إلى",
    selectUser: "اختر مستخدم",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    cancel: "إلغاء",
    requiredField: "هذا الحقل مطلوب",
    error: "حدث خطأ",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectForm({
  locale,
  clients,
  users = [],
  initialData,
  isModal = false,
  onClose,
  onSuccess,
}: ProjectFormProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState<ProjectFormData>({
    clientId: initialData?.clientId || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "BOTH",
    priority: initialData?.priority || "medium",
    siteAddress: initialData?.siteAddress || "",
    siteCity: initialData?.siteCity || "",
    sitePostalCode: initialData?.sitePostalCode || "",
    startDate: initialData?.startDate || "",
    expectedEndDate: initialData?.expectedEndDate || "",
    estimatedBudget: initialData?.estimatedBudget || undefined,
    materialCost: initialData?.materialCost || undefined,
    laborCost: initialData?.laborCost || undefined,
    specifications: initialData?.specifications || "",
    assignedToId: initialData?.assignedToId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = t.requiredField;
    }
    if (!formData.name.trim()) {
      newErrors.name = t.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/crm/projects/${initialData?.id}`
        : "/api/crm/projects";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t.error);
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result.data);
      }

      if (isModal && onClose) {
        onClose();
      } else {
        router.push(`/${locale}/admin/projets/${result.data.id}`);
        router.refresh();
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseFloat(value) : undefined) : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
        </div>
      )}

      {/* Client Selection */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">{t.clientInfo}</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.selectClient} *
          </label>
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800",
              "focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
              errors.clientId
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            )}
          >
            <option value="">{t.selectClient}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.clientNumber} - {client.fullName}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">{t.projectName}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.projectName} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.projectNamePlaceholder}
              className={cn(
                "w-full px-3 py-2 border rounded-lg",
                "focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.description}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={t.descriptionPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.type}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="BOTH">{t.both}</option>
                <option value="FABRICATION">{t.fabrication}</option>
                <option value="INSTALLATION">{t.installation}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.priority}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
                <option value="urgent">{t.urgent}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Site Information */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">{t.siteInfo}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.address}
            </label>
            <input
              type="text"
              name="siteAddress"
              value={formData.siteAddress}
              onChange={handleChange}
              placeholder={t.addressPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.city}
              </label>
              <input
                type="text"
                name="siteCity"
                value={formData.siteCity}
                onChange={handleChange}
                placeholder={t.cityPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.postalCode}
              </label>
              <input
                type="text"
                name="sitePostalCode"
                value={formData.sitePostalCode}
                onChange={handleChange}
                placeholder={t.postalCodePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">{t.dates}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.startDate}
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.expectedEndDate}
            </label>
            <input
              type="date"
              name="expectedEndDate"
              value={formData.expectedEndDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-amber-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">{t.budget}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.estimatedBudget}
            </label>
            <input
              type="number"
              name="estimatedBudget"
              value={formData.estimatedBudget || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.materialCost}
            </label>
            <input
              type="number"
              name="materialCost"
              value={formData.materialCost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.laborCost}
            </label>
            <input
              type="number"
              name="laborCost"
              value={formData.laborCost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.specifications}
        </label>
        <textarea
          name="specifications"
          value={formData.specifications}
          onChange={handleChange}
          rows={4}
          placeholder={t.specificationsPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Assigned To */}
      {users.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium text-gray-900 dark:text-white">{t.assignedTo}</h3>
          </div>

          <select
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose || (() => router.back())}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
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

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEditing ? t.editTitle : t.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">{formContent}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? t.editTitle : t.title}
      </h1>
      {formContent}
    </div>
  );
}

export default ProjectForm;
