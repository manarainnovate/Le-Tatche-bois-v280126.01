"use client";

import { useState } from "react";
import {
  Info,
  ListTodo,
  BookOpen,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectOverview } from "./tabs/ProjectOverview";
import { ProjectTasks } from "./tabs/ProjectTasks";
import { ProjectJournal } from "./tabs/ProjectJournal";
import { ProjectDocuments } from "./tabs/ProjectDocuments";
import { ProjectGallery } from "./tabs/ProjectGallery";
import { ProjectChecklist } from "./tabs/ProjectChecklist";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ProjectData {
  id: string;
  projectNumber: string;
  name: string;
  description?: string | null;
  status: string;
  type: string;
  priority: string;
  client: {
    id: string;
    clientNumber: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
  };
  siteAddress?: string | null;
  siteCity?: string | null;
  sitePostalCode?: string | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  estimatedBudget?: number | null;
  materialCost?: number | null;
  laborCost?: number | null;
  actualCost?: number | null;
  margin?: number | null;
  marginPercent?: number | null;
  specifications?: string | null;
  assignedTo?: {
    id: string;
    name: string | null;
  } | null;
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority: string;
    status: string;
    dueDate?: string | null;
    completedAt?: string | null;
    order: number;
    assignedTo?: { id: string; name: string | null } | null;
  }>;
  journal: Array<{
    id: string;
    date: string;
    title?: string | null;
    content: string;
  }>;
  media: Array<{
    id: string;
    url: string;
    filename: string;
    type: string;
    tag: string;
    description?: string | null;
    createdAt: string;
  }>;
  checklist: Array<{
    id: string;
    item: string;
    checked: boolean;
    checkedAt?: string | null;
    notes?: string | null;
    order: number;
  }>;
  documents: Array<{
    id: string;
    documentNumber: string;
    type: string;
    status: string;
    totalHT: number;
    totalTTC: number;
    createdAt: string;
  }>;
  activities?: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectTabsProps {
  project: ProjectData;
  locale: string;
  users?: Array<{ id: string; name: string | null }>;
}

type TabId = "overview" | "tasks" | "journal" | "documents" | "gallery" | "checklist";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  overview: string;
  tasks: string;
  journal: string;
  documents: string;
  gallery: string;
  checklist: string;
}

const translations: Record<string, Translations> = {
  fr: {
    overview: "Aperçu",
    tasks: "Tâches",
    journal: "Journal",
    documents: "Documents",
    gallery: "Galerie",
    checklist: "Checklist",
  },
  en: {
    overview: "Overview",
    tasks: "Tasks",
    journal: "Journal",
    documents: "Documents",
    gallery: "Gallery",
    checklist: "Checklist",
  },
  es: {
    overview: "Resumen",
    tasks: "Tareas",
    journal: "Diario",
    documents: "Documentos",
    gallery: "Galería",
    checklist: "Lista de verificación",
  },
  ar: {
    overview: "نظرة عامة",
    tasks: "المهام",
    journal: "اليومية",
    documents: "الوثائق",
    gallery: "المعرض",
    checklist: "قائمة التحقق",
  },
};

// ═══════════════════════════════════════════════════════════
// Tabs Configuration
// ═══════════════════════════════════════════════════════════

const tabs: Array<{ id: TabId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", icon: Info },
  { id: "tasks", icon: ListTodo },
  { id: "journal", icon: BookOpen },
  { id: "documents", icon: FileText },
  { id: "gallery", icon: ImageIcon },
  { id: "checklist", icon: ClipboardCheck },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectTabs({ project, locale, users = [] }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const t = translations[locale] || translations.fr;

  // Calculate counts for badges
  const taskCount = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "completed").length;
  const journalCount = project.journal.length;
  const documentCount = project.documents.length;
  const mediaCount = project.media.length;
  const checklistTotal = project.checklist.length;
  const checklistCompleted = project.checklist.filter((c) => c.checked).length;

  const getBadgeContent = (tabId: TabId): string | null => {
    switch (tabId) {
      case "tasks":
        return taskCount > 0 ? `${completedTasks}/${taskCount}` : null;
      case "journal":
        return journalCount > 0 ? String(journalCount) : null;
      case "documents":
        return documentCount > 0 ? String(documentCount) : null;
      case "gallery":
        return mediaCount > 0 ? String(mediaCount) : null;
      case "checklist":
        return checklistTotal > 0 ? `${checklistCompleted}/${checklistTotal}` : null;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map(({ id, icon: Icon }) => {
            const badge = getBadgeContent(id);
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {t[id]}
                {badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-full",
                      isActive
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <ProjectOverview project={project} locale={locale} />
        )}
        {activeTab === "tasks" && (
          <ProjectTasks
            projectId={project.id}
            tasks={project.tasks}
            locale={locale}
            users={users}
          />
        )}
        {activeTab === "journal" && (
          <ProjectJournal
            projectId={project.id}
            entries={project.journal}
            locale={locale}
          />
        )}
        {activeTab === "documents" && (
          <ProjectDocuments
            projectId={project.id}
            documents={project.documents}
            locale={locale}
          />
        )}
        {activeTab === "gallery" && (
          <ProjectGallery
            projectId={project.id}
            media={project.media}
            locale={locale}
          />
        )}
        {activeTab === "checklist" && (
          <ProjectChecklist
            projectId={project.id}
            items={project.checklist}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectTabs;
