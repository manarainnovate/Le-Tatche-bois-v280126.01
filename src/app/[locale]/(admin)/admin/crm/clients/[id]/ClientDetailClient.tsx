"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  User,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  FolderKanban,
  Clock,
  AlertCircle,
  MessageSquare,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";
import {
  ClientForm,
  ClientTabs,
  ClientDocuments,
  ClientPayments,
  ClientTab,
  CRMDocument,
  Payment,
} from "@/components/crm/clients";
import { ActivityLog, Activity } from "@/components/crm/leads";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Project {
  id: string;
  projectNumber: string;
  name: string;
  status: string;
  type: string;
  estimatedBudget?: number | null;
  actualCost?: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  createdAt: Date | string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number | null;
  createdAt: Date | string;
}

interface Client {
  id: string;
  clientNumber: string;
  name: string;
  type: "PARTICULIER" | "ENTREPRISE";
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  ice?: string | null;
  rc?: string | null;
  patente?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  totalRevenue: number;
  totalPaid: number;
  balance: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  projects: Project[];
  documents: CRMDocument[];
  activities: Activity[];
  attachments: Attachment[];
}

interface ClientDetailClientProps {
  client: Client;
  payments: Payment[];
  locale: string;
  initialTab?: string;
  initialEdit?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    back: "Retour aux clients",
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce client ?",
    deleteBlocked: "Impossible de supprimer un client avec des documents ou projets",
    contactInfo: "Contact",
    fiscalInfo: "Informations fiscales",
    totalRevenue: "CA Total",
    totalPaid: "Payé",
    balance: "Solde",
    noProjects: "Aucun projet",
    newProject: "Nouveau projet",
    viewProject: "Voir le projet",
    createdAt: "Client depuis",
    contactPerson: "Contact principal",
    PARTICULIER: "Particulier",
    ENTREPRISE: "Entreprise",
    DRAFT: "Brouillon",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
    ON_HOLD: "En pause",
    FABRICATION: "Fabrication",
    INSTALLATION: "Installation",
    BOTH: "Fabrication + Installation",
  },
  en: {
    back: "Back to clients",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this client?",
    deleteBlocked: "Cannot delete a client with documents or projects",
    contactInfo: "Contact",
    fiscalInfo: "Fiscal information",
    totalRevenue: "Total Revenue",
    totalPaid: "Paid",
    balance: "Balance",
    noProjects: "No projects",
    newProject: "New project",
    viewProject: "View project",
    createdAt: "Client since",
    contactPerson: "Primary contact",
    PARTICULIER: "Individual",
    ENTREPRISE: "Company",
    DRAFT: "Draft",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    ON_HOLD: "On Hold",
    FABRICATION: "Manufacturing",
    INSTALLATION: "Installation",
    BOTH: "Manufacturing + Installation",
  },
  es: {
    back: "Volver a clientes",
    edit: "Editar",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de que desea eliminar este cliente?",
    deleteBlocked: "No se puede eliminar un cliente con documentos o proyectos",
    contactInfo: "Contacto",
    fiscalInfo: "Información fiscal",
    totalRevenue: "Ingresos Totales",
    totalPaid: "Pagado",
    balance: "Saldo",
    noProjects: "Sin proyectos",
    newProject: "Nuevo proyecto",
    viewProject: "Ver proyecto",
    createdAt: "Cliente desde",
    contactPerson: "Contacto principal",
    PARTICULIER: "Particular",
    ENTREPRISE: "Empresa",
    DRAFT: "Borrador",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    ON_HOLD: "En Pausa",
    FABRICATION: "Fabricación",
    INSTALLATION: "Instalación",
    BOTH: "Fabricación + Instalación",
  },
  ar: {
    back: "العودة إلى العملاء",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا العميل؟",
    deleteBlocked: "لا يمكن حذف عميل لديه مستندات أو مشاريع",
    contactInfo: "الاتصال",
    fiscalInfo: "المعلومات الضريبية",
    totalRevenue: "إجمالي الإيرادات",
    totalPaid: "المدفوع",
    balance: "الرصيد",
    noProjects: "لا توجد مشاريع",
    newProject: "مشروع جديد",
    viewProject: "عرض المشروع",
    createdAt: "عميل منذ",
    contactPerson: "جهة الاتصال الرئيسية",
    PARTICULIER: "فرد",
    ENTREPRISE: "شركة",
    DRAFT: "مسودة",
    IN_PROGRESS: "قيد التنفيذ",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغى",
    ON_HOLD: "معلق",
    FABRICATION: "تصنيع",
    INSTALLATION: "تركيب",
    BOTH: "تصنيع + تركيب",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientDetailClient({
  client,
  payments,
  locale,
  initialTab = "info",
  initialEdit = false,
}: ClientDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Record<string, string>;

  const [activeTab, setActiveTab] = useState<ClientTab>(initialTab as ClientTab);
  const [isEditing, setIsEditing] = useState(initialEdit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const { format: formatCurrency } = useCurrency();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/crm/clients/${client.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/${locale}/admin/crm/clients`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleAddPayment = async (data: {
    documentId: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
    date?: string;
  }) => {
    const response = await fetch(`/api/crm/clients/${client.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add payment");
    }

    router.refresh();
  };

  // Show edit form
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

        <ClientForm
          locale={locale}
          initialData={{
            id: client.id,
            clientNumber: client.clientNumber,
            name: client.name,
            type: client.type,
            email: client.email || undefined,
            phone: client.phone || undefined,
            whatsapp: client.whatsapp || undefined,
            address: client.address || undefined,
            city: client.city || undefined,
            ice: client.ice || undefined,
            rc: client.rc || undefined,
            patente: client.patente || undefined,
            contactPerson: client.contactPerson || undefined,
            contactEmail: client.contactEmail || undefined,
            contactPhone: client.contactPhone || undefined,
            notes: client.notes || undefined,
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
            href={`/${locale}/admin/crm/clients`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                client.type === "ENTREPRISE"
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              )}
            >
              {client.type === "ENTREPRISE" ? (
                <Building2 className="h-6 w-6 text-purple-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  {client.clientNumber}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    client.type === "ENTREPRISE"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {t[client.type]}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.totalRevenue}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(client.totalRevenue)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalPaid}</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(client.totalPaid)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.balance}</p>
          <p
            className={cn(
              "text-xl font-bold",
              client.balance > 0 ? "text-red-600" : "text-gray-500"
            )}
          >
            {formatCurrency(client.balance)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <ClientTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        locale={locale}
        counts={{
          projects: client.projects.length,
          documents: client.documents.length,
          payments: payments.length,
          files: client.attachments.length,
          activities: client.activities.length,
        }}
      />

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {t.contactInfo}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900 dark:text-white">{client.phone}</span>
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-900 dark:text-white truncate">{client.email}</span>
                  </a>
                )}
                {client.whatsapp && (
                  <a
                    href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span className="text-gray-900 dark:text-white">{client.whatsapp}</span>
                  </a>
                )}
                {client.city && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <span className="text-gray-900 dark:text-white">{client.city}</span>
                  </div>
                )}
              </div>
              {client.address && (
                <p className="mt-3 text-gray-600 dark:text-gray-300">{client.address}</p>
              )}
            </div>

            {/* Fiscal Info (for companies) */}
            {client.type === "ENTREPRISE" && (client.ice || client.rc || client.patente) && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {t.fiscalInfo}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {client.ice && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">ICE</p>
                      <p className="font-mono text-gray-900 dark:text-white">{client.ice}</p>
                    </div>
                  )}
                  {client.rc && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">RC</p>
                      <p className="font-mono text-gray-900 dark:text-white">{client.rc}</p>
                    </div>
                  )}
                  {client.patente && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Patente</p>
                      <p className="font-mono text-gray-900 dark:text-white">{client.patente}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Person (for companies) */}
            {client.type === "ENTREPRISE" && client.contactPerson && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  {t.contactPerson}
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {client.contactPerson}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {client.contactEmail && <span>{client.contactEmail}</span>}
                    {client.contactPhone && <span>{client.contactPhone}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </div>
            )}

            {/* Created date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              {t.createdAt}: {formatDate(client.createdAt)}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link
                href={`/${locale}/admin/crm/projects/new?clientId=${client.id}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t.newProject}
              </Link>
            </div>

            {client.projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">{t.noProjects}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {client.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/${locale}/admin/crm/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <FolderKanban className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">
                          {project.projectNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                          {t[project.status] || project.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {project.name}
                      </p>
                    </div>
                    {project.estimatedBudget && (
                      <p className="font-medium text-amber-600">
                        {formatCurrency(project.estimatedBudget)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <ClientDocuments
            documents={client.documents}
            locale={locale}
            clientId={client.id}
          />
        )}

        {activeTab === "payments" && (
          <ClientPayments
            payments={payments}
            documents={client.documents}
            locale={locale}
            clientId={client.id}
            onAddPayment={handleAddPayment}
          />
        )}

        {activeTab === "files" && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {client.attachments.length === 0
                ? "Aucun fichier"
                : `${client.attachments.length} fichiers`}
            </p>
          </div>
        )}

        {activeTab === "activities" && (
          <ActivityLog activities={client.activities} locale={locale} showAddButton={false} />
        )}
      </div>

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
                  Cancel
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
