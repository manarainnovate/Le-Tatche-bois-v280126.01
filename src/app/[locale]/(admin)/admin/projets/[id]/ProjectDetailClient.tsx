"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Copy,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectTabs } from "@/components/crm/projects";
import { ProjectStatusBadge } from "@/components/crm/projects/ProjectStatusBadge";
import { ProjectTypeBadge } from "@/components/crm/projects/ProjectTypeBadge";
import { ProjectPriorityBadge } from "@/components/crm/projects/ProjectPriorityBadge";
import type { ProjectData } from "@/components/crm/projects";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ProjectDetailClientProps {
  project: ProjectData;
  users: Array<{ id: string; name: string | null }>;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  back: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  copyNumber: string;
  copied: string;
  viewClient: string;
  changeStatus: string;
  actions: string;
}

const translations: Record<string, Translations> = {
  fr: {
    back: "Retour",
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce projet ?",
    copyNumber: "Copier le numéro",
    copied: "Copié !",
    viewClient: "Voir le client",
    changeStatus: "Changer le statut",
    actions: "Actions",
  },
  en: {
    back: "Back",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this project?",
    copyNumber: "Copy number",
    copied: "Copied!",
    viewClient: "View client",
    changeStatus: "Change status",
    actions: "Actions",
  },
  es: {
    back: "Volver",
    edit: "Editar",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de que desea eliminar este proyecto?",
    copyNumber: "Copiar número",
    copied: "¡Copiado!",
    viewClient: "Ver cliente",
    changeStatus: "Cambiar estado",
    actions: "Acciones",
  },
  ar: {
    back: "رجوع",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المشروع؟",
    copyNumber: "نسخ الرقم",
    copied: "تم النسخ!",
    viewClient: "عرض العميل",
    changeStatus: "تغيير الحالة",
    actions: "الإجراءات",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Options
// ═══════════════════════════════════════════════════════════

const statusOptions = [
  "STUDY",
  "MEASURES",
  "QUOTE",
  "PENDING",
  "PRODUCTION",
  "READY",
  "DELIVERY",
  "INSTALLATION",
  "COMPLETED",
  "RECEIVED",
  "CLOSED",
  "CANCELLED",
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectDetailClient({
  project,
  users,
  locale,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = async () => {
    await navigator.clipboard.writeText(project.projectNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/crm/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setShowStatusMenu(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.confirmDelete)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      router.push(`/${locale}/admin/projets`);
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Link
            href={`/${locale}/admin/projets`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Project Info */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={handleCopyNumber}
                className="flex items-center gap-1 text-sm font-mono text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {project.projectNumber}
                <Copy className="h-3 w-3" />
              </button>
              {copied && (
                <span className="text-xs text-green-600">{t.copied}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Status with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="focus:outline-none"
                >
                  <ProjectStatusBadge
                    status={project.status as any}
                    locale={locale}
                  />
                </button>

                {showStatusMenu && (
                  <div className="absolute left-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                          status === project.status && "bg-amber-50 dark:bg-amber-900/20"
                        )}
                      >
                        <ProjectStatusBadge
                          status={status as any}
                          locale={locale}
                          size="sm"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ProjectTypeBadge type={project.type as any} locale={locale} />
              <ProjectPriorityBadge
                priority={project.priority as any}
                locale={locale}
              />
            </div>

            {/* Client Link */}
            <Link
              href={`/${locale}/admin/crm/clients/${project.client.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 mt-2"
            >
              <Building2 className="h-4 w-4" />
              {project.client.clientNumber} - {project.client.fullName}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/projets/${project.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            {t.edit}
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                <Link
                  href={`/${locale}/admin/crm/clients/${project.client.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.viewClient}
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.delete}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProjectTabs project={project} locale={locale} users={users} />

      {/* Click outside handler */}
      {(showMenu || showStatusMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowMenu(false);
            setShowStatusMenu(false);
          }}
        />
      )}
    </div>
  );
}
