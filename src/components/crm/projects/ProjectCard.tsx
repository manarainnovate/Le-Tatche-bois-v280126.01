"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  MapPin,
  User,
  Briefcase,
  CheckCircle,
  Clock,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ProjectPriorityBadge } from "./ProjectPriorityBadge";
import { ProjectTypeBadge } from "./ProjectTypeBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  status: string;
  type: string;
  priority: string;
  clientId: string;
  client?: {
    id: string;
    fullName: string;
    clientNumber: string;
  };
  siteCity?: string | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  estimatedBudget?: number | null;
  assignedTo?: {
    id: string;
    name: string | null;
  } | null;
  _count?: {
    tasks: number;
    completedTasks?: number;
  };
  tasksProgress?: {
    total: number;
    completed: number;
  };
}

interface ProjectCardProps {
  project: Project;
  locale: string;
  onClick?: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    tasks: "tâches",
    noTasks: "Aucune tâche",
    dueDate: "Échéance",
    budget: "Budget",
  },
  en: {
    tasks: "tasks",
    noTasks: "No tasks",
    dueDate: "Due date",
    budget: "Budget",
  },
  es: {
    tasks: "tareas",
    noTasks: "Sin tareas",
    dueDate: "Vencimiento",
    budget: "Presupuesto",
  },
  ar: {
    tasks: "مهام",
    noTasks: "لا مهام",
    dueDate: "تاريخ الاستحقاق",
    budget: "الميزانية",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectCard({
  project,
  locale,
  onClick,
  isDragging = false,
  compact = false,
}: ProjectCardProps) {
  const t = translations[locale] || translations.fr;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate task progress
  const tasksTotal = project.tasksProgress?.total || project._count?.tasks || 0;
  const tasksCompleted = project.tasksProgress?.completed || 0;
  const taskProgress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  // Check if overdue
  const isOverdue = project.expectedEndDate && new Date(project.expectedEndDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer transition-all",
        "hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600",
        isDragging || isSortableDragging ? "opacity-50 shadow-lg" : "",
        isOverdue && project.status !== "COMPLETED" && project.status !== "RECEIVED" && project.status !== "CLOSED"
          ? "border-red-300 dark:border-red-600"
          : ""
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="p-0.5 -ml-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {project.projectNumber}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mt-1 line-clamp-2">
            {project.name}
          </h4>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <ProjectStatusBadge
          status={project.status as any}
          locale={locale}
          size="sm"
        />
        <ProjectTypeBadge
          type={project.type as any}
          locale={locale}
          size="sm"
          showIcon={false}
        />
        {project.priority !== "medium" && (
          <ProjectPriorityBadge
            priority={project.priority as any}
            locale={locale}
            size="sm"
          />
        )}
      </div>

      {/* Client */}
      {project.client && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{project.client.fullName}</span>
        </div>
      )}

      {!compact && (
        <>
          {/* Location */}
          {project.siteCity && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{project.siteCity}</span>
            </div>
          )}

          {/* Dates */}
          {project.expectedEndDate && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs mb-2",
                isOverdue && project.status !== "COMPLETED" && project.status !== "RECEIVED" && project.status !== "CLOSED"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatDate(project.expectedEndDate)}</span>
              {isOverdue && project.status !== "COMPLETED" && project.status !== "RECEIVED" && project.status !== "CLOSED" && (
                <Clock className="h-3 w-3 ml-1" />
              )}
            </div>
          )}

          {/* Tasks Progress */}
          {tasksTotal > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {tasksCompleted}/{tasksTotal} {t.tasks}
                </span>
                <span>{taskProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Budget */}
          {project.estimatedBudget && (
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {formatCurrency(project.estimatedBudget)}
            </div>
          )}
        </>
      )}

      {/* Assigned To */}
      {project.assignedTo && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <User className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{project.assignedTo.name}</span>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;
