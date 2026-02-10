"use client";

import { useState } from "react";
import { X, Loader2, Building2, FolderKanban, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ConvertLeadData {
  createProject: boolean;
  projectName?: string;
  projectType?: "FABRICATION" | "INSTALLATION" | "BOTH";
  projectBudget?: number;
}

interface Lead {
  id: string;
  leadNumber: string;
  contactName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  projectType?: string | null;
  estimatedBudget?: number | null;
}

interface ConvertLeadModalProps {
  lead: Lead;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (data: ConvertLeadData) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Convertir en client",
    subtitle: "Le lead sera converti en client et pourra être associé à des projets et documents.",
    leadInfo: "Informations du lead",
    createProject: "Créer un projet",
    createProjectDesc: "Créer automatiquement un projet pour ce nouveau client",
    projectName: "Nom du projet",
    projectNamePlaceholder: "Ex: Aménagement cuisine",
    projectType: "Type de projet",
    projectBudget: "Budget estimé (MAD)",
    cancel: "Annuler",
    convert: "Convertir",
    converting: "Conversion en cours...",
    FABRICATION: "Fabrication",
    INSTALLATION: "Installation",
    BOTH: "Fabrication + Installation",
    success: "Lead converti avec succès",
  },
  en: {
    title: "Convert to client",
    subtitle: "The lead will be converted to a client and can be associated with projects and documents.",
    leadInfo: "Lead information",
    createProject: "Create project",
    createProjectDesc: "Automatically create a project for this new client",
    projectName: "Project name",
    projectNamePlaceholder: "E.g., Kitchen renovation",
    projectType: "Project type",
    projectBudget: "Estimated budget (MAD)",
    cancel: "Cancel",
    convert: "Convert",
    converting: "Converting...",
    FABRICATION: "Manufacturing",
    INSTALLATION: "Installation",
    BOTH: "Manufacturing + Installation",
    success: "Lead successfully converted",
  },
  es: {
    title: "Convertir a cliente",
    subtitle: "El prospecto será convertido a cliente y podrá asociarse con proyectos y documentos.",
    leadInfo: "Información del prospecto",
    createProject: "Crear proyecto",
    createProjectDesc: "Crear automáticamente un proyecto para este nuevo cliente",
    projectName: "Nombre del proyecto",
    projectNamePlaceholder: "Ej: Remodelación cocina",
    projectType: "Tipo de proyecto",
    projectBudget: "Presupuesto estimado (MAD)",
    cancel: "Cancelar",
    convert: "Convertir",
    converting: "Convirtiendo...",
    FABRICATION: "Fabricación",
    INSTALLATION: "Instalación",
    BOTH: "Fabricación + Instalación",
    success: "Prospecto convertido exitosamente",
  },
  ar: {
    title: "تحويل إلى عميل",
    subtitle: "سيتم تحويل العميل المحتمل إلى عميل ويمكن ربطه بالمشاريع والمستندات.",
    leadInfo: "معلومات العميل المحتمل",
    createProject: "إنشاء مشروع",
    createProjectDesc: "إنشاء مشروع تلقائياً لهذا العميل الجديد",
    projectName: "اسم المشروع",
    projectNamePlaceholder: "مثال: تجديد المطبخ",
    projectType: "نوع المشروع",
    projectBudget: "الميزانية المقدرة (درهم)",
    cancel: "إلغاء",
    convert: "تحويل",
    converting: "جاري التحويل...",
    FABRICATION: "تصنيع",
    INSTALLATION: "تركيب",
    BOTH: "تصنيع + تركيب",
    success: "تم تحويل العميل المحتمل بنجاح",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ConvertLeadModal({
  lead,
  locale,
  isOpen,
  onClose,
  onConvert,
}: ConvertLeadModalProps) {
  const t = translations[locale] || translations.fr;

  const [formData, setFormData] = useState<ConvertLeadData>({
    createProject: true,
    projectName: lead.company
      ? `Projet ${lead.company}`
      : `Projet ${lead.contactName}`,
    projectType: (lead.projectType as ConvertLeadData["projectType"]) || "FABRICATION",
    projectBudget: lead.estimatedBudget || undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onConvert(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-amber-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{t.title}</h3>
                <p className="text-xs text-amber-100">{lead.leadNumber}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {t.success}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Subtitle */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>

              {/* Lead Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t.leadInfo}
                </h4>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {lead.contactName}
                  </p>
                  {lead.company && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {lead.company}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    {lead.phone && <span>{lead.phone}</span>}
                    {lead.email && <span>{lead.email}</span>}
                  </div>
                </div>
              </div>

              {/* Create Project Toggle */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      createProject: !prev.createProject,
                    }))
                  }
                  className={cn(
                    "mt-0.5 w-10 h-6 rounded-full transition-colors relative",
                    formData.createProject
                      ? "bg-amber-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      formData.createProject ? "left-5" : "left-1"
                    )}
                  />
                </button>
                <div>
                  <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-amber-600" />
                    {t.createProject}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.createProjectDesc}
                  </p>
                </div>
              </div>

              {/* Project Fields */}
              {formData.createProject && (
                <div className="space-y-4 pl-13 border-l-2 border-amber-200 dark:border-amber-800 ml-5">
                  {/* Project Name */}
                  <div>
                    <label
                      htmlFor="projectName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.projectName}
                    </label>
                    <input
                      id="projectName"
                      type="text"
                      value={formData.projectName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          projectName: e.target.value,
                        }))
                      }
                      placeholder={t.projectNamePlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.projectType}
                    </label>
                    <div className="flex gap-2">
                      {(["FABRICATION", "INSTALLATION", "BOTH"] as const).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                projectType: type,
                              }))
                            }
                            className={cn(
                              "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              formData.projectType === type
                                ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            )}
                          >
                            {t[type]}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Project Budget */}
                  <div>
                    <label
                      htmlFor="projectBudget"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {t.projectBudget}
                    </label>
                    <input
                      id="projectBudget"
                      type="number"
                      min="0"
                      value={formData.projectBudget || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          projectBudget: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.converting}
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4" />
                      {t.convert}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default ConvertLeadModal;
