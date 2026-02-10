"use client";

import { cn } from "@/lib/utils";
import {
  User,
  FolderKanban,
  FileText,
  CreditCard,
  Paperclip,
  Clock,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type ClientTab = "info" | "projects" | "documents" | "payments" | "files" | "activities";

interface ClientTabsProps {
  activeTab: ClientTab;
  onTabChange: (tab: ClientTab) => void;
  locale: string;
  counts?: {
    projects?: number;
    documents?: number;
    payments?: number;
    files?: number;
    activities?: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<ClientTab, string>> = {
  fr: {
    info: "Informations",
    projects: "Projets",
    documents: "Documents",
    payments: "Paiements",
    files: "Fichiers",
    activities: "Activités",
  },
  en: {
    info: "Information",
    projects: "Projects",
    documents: "Documents",
    payments: "Payments",
    files: "Files",
    activities: "Activities",
  },
  es: {
    info: "Información",
    projects: "Proyectos",
    documents: "Documentos",
    payments: "Pagos",
    files: "Archivos",
    activities: "Actividades",
  },
  ar: {
    info: "المعلومات",
    projects: "المشاريع",
    documents: "المستندات",
    payments: "المدفوعات",
    files: "الملفات",
    activities: "الأنشطة",
  },
};

// ═══════════════════════════════════════════════════════════
// Tab Configuration
// ═══════════════════════════════════════════════════════════

const tabs: { id: ClientTab; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "info", icon: User },
  { id: "projects", icon: FolderKanban },
  { id: "documents", icon: FileText },
  { id: "payments", icon: CreditCard },
  { id: "files", icon: Paperclip },
  { id: "activities", icon: Clock },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ClientTabs({
  activeTab,
  onTabChange,
  locale,
  counts = {},
}: ClientTabsProps) {
  const t = translations[locale] || translations.fr;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-1 overflow-x-auto pb-px" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.id as keyof typeof counts];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t[tab.id]}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    isActive
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default ClientTabs;
