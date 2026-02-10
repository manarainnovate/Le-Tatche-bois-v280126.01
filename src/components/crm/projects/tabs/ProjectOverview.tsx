"use client";

import {
  Building2,
  MapPin,
  Calendar,
  Wallet,
  User,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatusBadge } from "../ProjectStatusBadge";
import { ProjectTypeBadge } from "../ProjectTypeBadge";
import { ProjectPriorityBadge } from "../ProjectPriorityBadge";
import type { ProjectData } from "../ProjectTabs";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ProjectOverviewProps {
  project: ProjectData;
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  projectInfo: string;
  client: string;
  location: string;
  dates: string;
  startDate: string;
  expectedEnd: string;
  actualEnd: string;
  budget: string;
  estimated: string;
  materials: string;
  labor: string;
  actual: string;
  margin: string;
  specifications: string;
  assignedTo: string;
  recentActivities: string;
  noActivities: string;
  notSpecified: string;
}

const translations: Record<string, Translations> = {
  fr: {
    projectInfo: "Informations du projet",
    client: "Client",
    location: "Localisation",
    dates: "Dates",
    startDate: "Début",
    expectedEnd: "Fin prévue",
    actualEnd: "Fin réelle",
    budget: "Budget",
    estimated: "Estimé",
    materials: "Matériaux",
    labor: "Main d'oeuvre",
    actual: "Réel",
    margin: "Marge",
    specifications: "Spécifications",
    assignedTo: "Assigné à",
    recentActivities: "Activités récentes",
    noActivities: "Aucune activité récente",
    notSpecified: "Non spécifié",
  },
  en: {
    projectInfo: "Project Information",
    client: "Client",
    location: "Location",
    dates: "Dates",
    startDate: "Start",
    expectedEnd: "Expected End",
    actualEnd: "Actual End",
    budget: "Budget",
    estimated: "Estimated",
    materials: "Materials",
    labor: "Labor",
    actual: "Actual",
    margin: "Margin",
    specifications: "Specifications",
    assignedTo: "Assigned To",
    recentActivities: "Recent Activities",
    noActivities: "No recent activities",
    notSpecified: "Not specified",
  },
  es: {
    projectInfo: "Información del proyecto",
    client: "Cliente",
    location: "Ubicación",
    dates: "Fechas",
    startDate: "Inicio",
    expectedEnd: "Fin esperado",
    actualEnd: "Fin real",
    budget: "Presupuesto",
    estimated: "Estimado",
    materials: "Materiales",
    labor: "Mano de obra",
    actual: "Real",
    margin: "Margen",
    specifications: "Especificaciones",
    assignedTo: "Asignado a",
    recentActivities: "Actividades recientes",
    noActivities: "Sin actividades recientes",
    notSpecified: "No especificado",
  },
  ar: {
    projectInfo: "معلومات المشروع",
    client: "العميل",
    location: "الموقع",
    dates: "التواريخ",
    startDate: "البداية",
    expectedEnd: "النهاية المتوقعة",
    actualEnd: "النهاية الفعلية",
    budget: "الميزانية",
    estimated: "المقدرة",
    materials: "المواد",
    labor: "اليد العاملة",
    actual: "الفعلية",
    margin: "الهامش",
    specifications: "المواصفات",
    assignedTo: "مسند إلى",
    recentActivities: "الأنشطة الأخيرة",
    noActivities: "لا توجد أنشطة حديثة",
    notSpecified: "غير محدد",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectOverview({ project, locale }: ProjectOverviewProps) {
  const t = translations[locale] || translations.fr;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t.notSpecified;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Project Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.projectInfo}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <ProjectStatusBadge status={project.status as any} locale={locale} />
              <ProjectTypeBadge type={project.type as any} locale={locale} />
              <ProjectPriorityBadge priority={project.priority as any} locale={locale} />
            </div>

            {/* Description */}
            {project.description && (
              <div className="text-gray-600 dark:text-gray-400">
                {project.description}
              </div>
            )}
          </div>
        </div>

        {/* Client Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t.client}</h3>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-900 dark:text-white">
              {project.client.fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {project.client.clientNumber}
            </div>
            {project.client.email && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {project.client.email}
              </div>
            )}
            {project.client.phone && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {project.client.phone}
              </div>
            )}
          </div>
        </div>

        {/* Location Card */}
        {(project.siteAddress || project.siteCity) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t.location}
              </h3>
            </div>

            <div className="space-y-1 text-gray-600 dark:text-gray-400">
              {project.siteAddress && <div>{project.siteAddress}</div>}
              {(project.siteCity || project.sitePostalCode) && (
                <div>
                  {project.sitePostalCode} {project.siteCity}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specifications */}
        {project.specifications && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.specifications}
            </h3>
            <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {project.specifications}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Dates Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t.dates}</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t.startDate}
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {formatDate(project.startDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t.expectedEnd}
              </div>
              <div
                className={cn(
                  "text-sm",
                  project.expectedEndDate &&
                    new Date(project.expectedEndDate) < new Date() &&
                    project.status !== "COMPLETED" &&
                    project.status !== "RECEIVED" &&
                    project.status !== "CLOSED"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                )}
              >
                {formatDate(project.expectedEndDate)}
                {project.expectedEndDate &&
                  new Date(project.expectedEndDate) < new Date() &&
                  project.status !== "COMPLETED" &&
                  project.status !== "RECEIVED" &&
                  project.status !== "CLOSED" && (
                    <Clock className="inline h-4 w-4 ml-1" />
                  )}
              </div>
            </div>
            {project.actualEndDate && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t.actualEnd}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatDate(project.actualEndDate)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{t.budget}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.estimated}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(project.estimatedBudget)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.materials}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatCurrency(project.materialCost)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.labor}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatCurrency(project.laborCost)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t.actual}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(project.actualCost)}
                </span>
              </div>
            </div>
            {project.margin !== null && project.margin !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {t.margin}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    Number(project.margin) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatCurrency(project.margin)} ({formatPercent(project.marginPercent)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Assigned To */}
        {project.assignedTo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t.assignedTo}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {project.assignedTo.name}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {project.activities && project.activities.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.recentActivities}
            </h3>

            <div className="space-y-3">
              {project.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectOverview;
