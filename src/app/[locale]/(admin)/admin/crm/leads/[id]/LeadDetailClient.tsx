"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  User,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";
import {
  LeadStatusBadge,
  LeadForm,
  ActivityLog,
  ActivityForm,
  ConvertLeadModal,
  Activity,
} from "@/components/crm/leads";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Lead {
  id: string;
  leadNumber: string;
  contactName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  status: string;
  source: string;
  urgency: string;
  projectType?: string | null;
  projectDescription?: string | null;
  estimatedBudget?: number | null;
  nextFollowUp?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  assignedTo?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  activities: Activity[];
  appointments: Array<{
    id: string;
    title: string;
    type: string;
    startDate: Date | string;
    status: string;
  }>;
  convertedClient?: {
    id: string;
    clientNumber: string;
    name: string;
  } | null;
}

interface UserOption {
  id: string;
  name: string | null;
}

interface LeadDetailClientProps {
  lead: Lead;
  users: UserOption[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour aux leads",
    edit: "Modifier",
    delete: "Supprimer",
    convertToClient: "Convertir en client",
    alreadyConverted: "Converti en client",
    viewClient: "Voir le client",
    contactInfo: "Informations de contact",
    projectInfo: "Informations projet",
    activities: "Activités",
    upcomingAppointments: "Prochains rendez-vous",
    noAppointments: "Aucun rendez-vous prévu",
    scheduleAppointment: "Planifier un rendez-vous",
    addActivity: "Ajouter une activité",
    createdAt: "Créé le",
    updatedAt: "Mis à jour le",
    source: "Source",
    urgency: "Urgence",
    projectType: "Type de projet",
    estimatedBudget: "Budget estimé",
    nextFollowUp: "Prochain suivi",
    assignedTo: "Assigné à",
    notes: "Notes",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce lead ?",
    deleteSuccess: "Lead supprimé avec succès",
    HAUTE: "Haute",
    MOYENNE: "Moyenne",
    BASSE: "Basse",
    FABRICATION: "Fabrication",
    INSTALLATION: "Installation",
    BOTH: "Fabrication + Installation",
    WEBSITE: "Site web",
    PHONE: "Téléphone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Recommandation",
    SOCIAL_MEDIA: "Réseaux sociaux",
    EXHIBITION: "Salon",
    OTHER: "Autre",
  },
  en: {
    back: "Back to leads",
    edit: "Edit",
    delete: "Delete",
    convertToClient: "Convert to client",
    alreadyConverted: "Converted to client",
    viewClient: "View client",
    contactInfo: "Contact information",
    projectInfo: "Project information",
    activities: "Activities",
    upcomingAppointments: "Upcoming appointments",
    noAppointments: "No appointments scheduled",
    scheduleAppointment: "Schedule appointment",
    addActivity: "Add activity",
    createdAt: "Created on",
    updatedAt: "Updated on",
    source: "Source",
    urgency: "Urgency",
    projectType: "Project type",
    estimatedBudget: "Estimated budget",
    nextFollowUp: "Next follow-up",
    assignedTo: "Assigned to",
    notes: "Notes",
    confirmDelete: "Are you sure you want to delete this lead?",
    deleteSuccess: "Lead deleted successfully",
    HAUTE: "High",
    MOYENNE: "Medium",
    BASSE: "Low",
    FABRICATION: "Manufacturing",
    INSTALLATION: "Installation",
    BOTH: "Manufacturing + Installation",
    WEBSITE: "Website",
    PHONE: "Phone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
    REFERRAL: "Referral",
    SOCIAL_MEDIA: "Social media",
    EXHIBITION: "Exhibition",
    OTHER: "Other",
  },
  es: {
    back: "Volver a prospectos",
    edit: "Editar",
    delete: "Eliminar",
    convertToClient: "Convertir a cliente",
    alreadyConverted: "Convertido a cliente",
    viewClient: "Ver cliente",
    contactInfo: "Información de contacto",
    projectInfo: "Información del proyecto",
    activities: "Actividades",
    upcomingAppointments: "Próximas citas",
    noAppointments: "No hay citas programadas",
    scheduleAppointment: "Programar cita",
    addActivity: "Agregar actividad",
    createdAt: "Creado el",
    updatedAt: "Actualizado el",
    source: "Fuente",
    urgency: "Urgencia",
    projectType: "Tipo de proyecto",
    estimatedBudget: "Presupuesto estimado",
    nextFollowUp: "Próximo seguimiento",
    assignedTo: "Asignado a",
    notes: "Notas",
    confirmDelete: "¿Está seguro de que desea eliminar este prospecto?",
    deleteSuccess: "Prospecto eliminado exitosamente",
    HAUTE: "Alta",
    MOYENNE: "Media",
    BASSE: "Baja",
    FABRICATION: "Fabricación",
    INSTALLATION: "Instalación",
    BOTH: "Fabricación + Instalación",
    WEBSITE: "Sitio web",
    PHONE: "Teléfono",
    WHATSAPP: "WhatsApp",
    EMAIL: "Correo",
    REFERRAL: "Recomendación",
    SOCIAL_MEDIA: "Redes sociales",
    EXHIBITION: "Exposición",
    OTHER: "Otro",
  },
  ar: {
    back: "العودة إلى العملاء المحتملين",
    edit: "تعديل",
    delete: "حذف",
    convertToClient: "تحويل إلى عميل",
    alreadyConverted: "تم التحويل إلى عميل",
    viewClient: "عرض العميل",
    contactInfo: "معلومات الاتصال",
    projectInfo: "معلومات المشروع",
    activities: "الأنشطة",
    upcomingAppointments: "المواعيد القادمة",
    noAppointments: "لا توجد مواعيد مجدولة",
    scheduleAppointment: "جدولة موعد",
    addActivity: "إضافة نشاط",
    createdAt: "أُنشئ في",
    updatedAt: "تم التحديث في",
    source: "المصدر",
    urgency: "الأولوية",
    projectType: "نوع المشروع",
    estimatedBudget: "الميزانية المقدرة",
    nextFollowUp: "المتابعة القادمة",
    assignedTo: "مسند إلى",
    notes: "ملاحظات",
    confirmDelete: "هل أنت متأكد من حذف هذا العميل المحتمل؟",
    deleteSuccess: "تم حذف العميل المحتمل بنجاح",
    HAUTE: "عالية",
    MOYENNE: "متوسطة",
    BASSE: "منخفضة",
    FABRICATION: "تصنيع",
    INSTALLATION: "تركيب",
    BOTH: "تصنيع + تركيب",
    WEBSITE: "الموقع",
    PHONE: "الهاتف",
    WHATSAPP: "واتساب",
    EMAIL: "البريد",
    REFERRAL: "توصية",
    SOCIAL_MEDIA: "وسائل التواصل",
    EXHIBITION: "معرض",
    OTHER: "آخر",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function LeadDetailClient({
  lead,
  users,
  locale,
}: LeadDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);

  const [isEditing, setIsEditing] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(lead.activities);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { format: formatCurrency } = useCurrency();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/${locale}/admin/crm/leads`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleAddActivity = async (data: {
    type: string;
    title: string;
    description?: string;
    outcome?: string;
    duration?: number;
    nextAction?: string;
    date?: string;
  }) => {
    const response = await fetch(`/api/crm/leads/${lead.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add activity");
    }

    const result = await response.json();
    setActivities((prev) => [result.data, ...prev]);
    router.refresh();
  };

  const handleConvert = async (data: {
    createProject: boolean;
    projectName?: string;
    projectType?: string;
    projectBudget?: number;
  }) => {
    const response = await fetch(`/api/crm/leads/${lead.id}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to convert lead");
    }

    const result = await response.json();
    router.push(`/${locale}/admin/crm/clients/${result.data.id}`);
  };

  const urgencyConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    HAUTE: {
      color: "text-red-600 bg-red-100 dark:bg-red-900/30",
      icon: <AlertCircle className="h-4 w-4" />,
    },
    MOYENNE: {
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
      icon: <Clock className="h-4 w-4" />,
    },
    BASSE: {
      color: "text-gray-600 bg-gray-100 dark:bg-gray-800",
      icon: <Clock className="h-4 w-4" />,
    },
  };

  const urgency = urgencyConfig[lead.urgency] || urgencyConfig.BASSE;

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>

        <LeadForm
          locale={locale}
          users={users.map((u) => ({ id: u.id, name: u.name || "" }))}
          initialData={{
            id: lead.id,
            leadNumber: lead.leadNumber,
            contactName: lead.contactName,
            company: lead.company || undefined,
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            whatsapp: lead.whatsapp || undefined,
            address: lead.address || undefined,
            city: lead.city || undefined,
            source: lead.source,
            urgency: lead.urgency,
            projectType: lead.projectType || undefined,
            projectDescription: lead.projectDescription || undefined,
            estimatedBudget: lead.estimatedBudget || undefined,
            nextFollowUp: lead.nextFollowUp
              ? new Date(lead.nextFollowUp).toISOString().slice(0, 16)
              : undefined,
            notes: lead.notes || undefined,
            assignedToId: lead.assignedTo?.id,
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/admin/crm/leads`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  {lead.leadNumber}
                </span>
                <LeadStatusBadge
                  status={lead.status as Parameters<typeof LeadStatusBadge>[0]["status"]}
                  locale={locale}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lead.contactName}
              </h1>
              {lead.company && (
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {lead.company}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Converted indicator or convert button */}
          {lead.convertedClient ? (
            <Link
              href={`/${locale}/admin/crm/clients/${lead.convertedClient.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{t.viewClient}</span>
            </Link>
          ) : lead.status !== "PERDU" ? (
            <button
              type="button"
              onClick={() => setShowConvertModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Building2 className="h-4 w-4" />
              {t.convertToClient}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            {t.edit}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-amber-600" />
              {t.contactInfo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{lead.phone}</span>
                </a>
              )}

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <Mail className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900 dark:text-white truncate">{lead.email}</span>
                </a>
              )}

              {lead.whatsapp && (
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="text-gray-900 dark:text-white">{lead.whatsapp}</span>
                </a>
              )}

              {lead.city && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="text-gray-900 dark:text-white">{lead.city}</span>
                </div>
              )}
            </div>

            {lead.address && (
              <p className="mt-4 text-gray-600 dark:text-gray-300">{lead.address}</p>
            )}
          </div>

          {/* Project Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-600" />
              {t.projectInfo}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {/* Source */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t.source}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t[lead.source] || lead.source}
                </p>
              </div>

              {/* Urgency */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t.urgency}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium",
                    urgency.color
                  )}
                >
                  {urgency.icon}
                  {t[lead.urgency] || lead.urgency}
                </span>
              </div>

              {/* Project Type */}
              {lead.projectType && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t.projectType}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t[lead.projectType] || lead.projectType}
                  </p>
                </div>
              )}

              {/* Budget */}
              {lead.estimatedBudget && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t.estimatedBudget}
                  </p>
                  <p className="font-bold text-amber-600">
                    {formatCurrency(lead.estimatedBudget)}
                  </p>
                </div>
              )}
            </div>

            {lead.projectDescription && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {lead.projectDescription}
                </p>
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <ActivityLog
              activities={activities}
              locale={locale}
              onAddActivity={() => setShowActivityForm(true)}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            {/* Next Follow-up */}
            {lead.nextFollowUp && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.nextFollowUp}
                  </p>
                  <p
                    className={cn(
                      "font-medium",
                      new Date(lead.nextFollowUp) < new Date()
                        ? "text-red-600"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {formatDateTime(lead.nextFollowUp)}
                  </p>
                </div>
              </div>
            )}

            {/* Assigned To */}
            {lead.assignedTo && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.assignedTo}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {lead.assignedTo.name}
                  </p>
                </div>
              </div>
            )}

            {/* Created/Updated */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.createdAt}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(lead.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                {t.notes}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 whitespace-pre-wrap">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-amber-600" />
              {t.upcomingAppointments}
            </h3>

            {lead.appointments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t.noAppointments}
              </p>
            ) : (
              <div className="space-y-2">
                {lead.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {apt.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(apt.startDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Form Modal */}
      <ActivityForm
        locale={locale}
        isOpen={showActivityForm}
        onClose={() => setShowActivityForm(false)}
        onSubmit={handleAddActivity}
        leadId={lead.id}
      />

      {/* Convert Modal */}
      <ConvertLeadModal
        lead={{
          id: lead.id,
          leadNumber: lead.leadNumber,
          contactName: lead.contactName,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          projectType: lead.projectType,
          estimatedBudget: lead.estimatedBudget,
        }}
        locale={locale}
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvert}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t.delete}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t.confirmDelete}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {translations[locale]?.cancel || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
