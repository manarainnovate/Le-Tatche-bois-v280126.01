"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectCard, Project } from "./ProjectCard";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type ProjectStatus =
  | "STUDY"
  | "MEASURES"
  | "QUOTE"
  | "PENDING"
  | "PRODUCTION"
  | "READY"
  | "DELIVERY"
  | "INSTALLATION"
  | "COMPLETED"
  | "RECEIVED"
  | "CLOSED"
  | "CANCELLED";

interface ProjectKanbanProps {
  initialProjects: Project[];
  locale: string;
  onProjectClick?: (project: Project) => void;
  onProjectStatusChange?: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
  onAddProject?: (status: ProjectStatus) => void;
}

// ═══════════════════════════════════════════════════════════
// Active Columns (excluding CLOSED and CANCELLED for Kanban view)
// ═══════════════════════════════════════════════════════════

const COLUMN_ORDER: ProjectStatus[] = [
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
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    addProject: "Ajouter un projet",
    projects: "projets",
    emptyColumn: "Aucun projet",
    dragHint: "Glissez les projets pour changer leur statut",
  },
  en: {
    addProject: "Add project",
    projects: "projects",
    emptyColumn: "No projects",
    dragHint: "Drag projects to change their status",
  },
  es: {
    addProject: "Agregar proyecto",
    projects: "proyectos",
    emptyColumn: "Sin proyectos",
    dragHint: "Arrastre los proyectos para cambiar su estado",
  },
  ar: {
    addProject: "إضافة مشروع",
    projects: "مشاريع",
    emptyColumn: "لا يوجد مشاريع",
    dragHint: "اسحب المشاريع لتغيير حالتها",
  },
};

// ═══════════════════════════════════════════════════════════
// Droppable Column Component
// ═══════════════════════════════════════════════════════════

interface ColumnProps {
  id: ProjectStatus;
  projects: Project[];
  locale: string;
  onProjectClick?: (project: Project) => void;
  onAddProject?: () => void;
}

function Column({ id, projects, locale, onProjectClick, onAddProject }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const t = translations[locale] || translations.fr;

  // Calculate total budget
  const totalBudget = projects.reduce(
    (sum, project) => sum + (project.estimatedBudget || 0),
    0
  );

  const formatCurrency = (amount: number) => {
    if (amount === 0) return null;
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl min-w-[300px] max-w-[340px] flex-shrink-0"
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={id} locale={locale} size="sm" />
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
              {projects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onAddProject}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {totalBudget > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(totalBudget)}
          </div>
        )}
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]",
          isOver && "bg-amber-50 dark:bg-amber-900/10"
        )}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500 py-8">
              {t.emptyColumn}
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                onClick={() => onProjectClick?.(project)}
                compact
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Kanban Component
// ═══════════════════════════════════════════════════════════

export function ProjectKanban({
  initialProjects,
  locale,
  onProjectClick,
  onProjectStatusChange,
  onAddProject,
}: ProjectKanbanProps) {
  // Group projects by status
  const [columns, setColumns] = useState<Record<ProjectStatus, Project[]>>(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      STUDY: [],
      MEASURES: [],
      QUOTE: [],
      PENDING: [],
      PRODUCTION: [],
      READY: [],
      DELIVERY: [],
      INSTALLATION: [],
      COMPLETED: [],
      RECEIVED: [],
      CLOSED: [],
      CANCELLED: [],
    };

    initialProjects.forEach((project) => {
      const status = project.status as ProjectStatus;
      if (grouped[status]) {
        grouped[status].push(project);
      }
    });

    return grouped;
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback(
    (id: string): ProjectStatus | null => {
      // Check if id is a column id
      if (COLUMN_ORDER.includes(id as ProjectStatus)) {
        return id as ProjectStatus;
      }

      // Find which column contains the project
      for (const status of COLUMN_ORDER) {
        if (columns[status].some((project) => project.id === id)) {
          return status;
        }
      }
      return null;
    },
    [columns]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);

      // Find the project being dragged
      for (const status of COLUMN_ORDER) {
        const project = columns[status].find((p) => p.id === active.id);
        if (project) {
          setActiveProject(project);
          break;
        }
      }
    },
    [columns]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeColumn = findColumn(active.id as string);
      const overColumn = findColumn(over.id as string);

      if (!activeColumn || !overColumn || activeColumn === overColumn) {
        return;
      }

      setColumns((prev) => {
        const activeProjects = [...prev[activeColumn]];
        const overProjects = [...prev[overColumn]];

        const activeIndex = activeProjects.findIndex((p) => p.id === active.id);
        const [movedProject] = activeProjects.splice(activeIndex, 1);

        if (movedProject) {
          // Update project status
          movedProject.status = overColumn;
          overProjects.push(movedProject);
        }

        return {
          ...prev,
          [activeColumn]: activeProjects,
          [overColumn]: overProjects,
        };
      });
    },
    [findColumn]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveProject(null);

      if (!over) return;

      const activeColumn = findColumn(active.id as string);
      const overColumn = findColumn(over.id as string);

      if (!activeColumn || !overColumn) return;

      // If dropped in a different column, call the status change handler
      if (activeColumn !== overColumn && onProjectStatusChange) {
        try {
          await onProjectStatusChange(active.id as string, overColumn);
        } catch {
          // Revert on error
          setColumns((prev) => {
            const sourceProjects = [...prev[overColumn]];
            const targetProjects = [...prev[activeColumn]];

            const index = sourceProjects.findIndex((p) => p.id === active.id);
            if (index !== -1) {
              const [project] = sourceProjects.splice(index, 1);
              if (project) {
                project.status = activeColumn;
                targetProjects.push(project);
              }
            }

            return {
              ...prev,
              [overColumn]: sourceProjects,
              [activeColumn]: targetProjects,
            };
          });
        }
      }

      // Handle reordering within same column
      if (activeColumn === overColumn && active.id !== over.id) {
        setColumns((prev) => {
          const projects = [...prev[activeColumn]];
          const oldIndex = projects.findIndex((p) => p.id === active.id);
          const newIndex = projects.findIndex((p) => p.id === over.id);

          return {
            ...prev,
            [activeColumn]: arrayMove(projects, oldIndex, newIndex),
          };
        });
      }
    },
    [findColumn, onProjectStatusChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {COLUMN_ORDER.map((status) => (
          <Column
            key={status}
            id={status}
            projects={columns[status]}
            locale={locale}
            onProjectClick={onProjectClick}
            onAddProject={() => onAddProject?.(status)}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeProject ? (
          <div className="transform rotate-3">
            <ProjectCard project={activeProject} locale={locale} isDragging compact />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default ProjectKanban;
