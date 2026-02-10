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
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadCard, Lead } from "./LeadCard";
import { LeadStatusBadge } from "./LeadStatusBadge";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type LeadStatus =
  | "NOUVEAU"
  | "CONTACTE"
  | "QUALIFIE"
  | "PROPOSITION"
  | "NEGOCIATION"
  | "GAGNE"
  | "PERDU";

interface KanbanColumn {
  id: LeadStatus;
  leads: Lead[];
}

interface LeadKanbanProps {
  initialLeads: Lead[];
  locale: string;
  onLeadClick?: (lead: Lead) => void;
  onLeadStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onAddLead?: (status: LeadStatus) => void;
}

// ═══════════════════════════════════════════════════════════
// Column Order
// ═══════════════════════════════════════════════════════════

const COLUMN_ORDER: LeadStatus[] = [
  "NOUVEAU",
  "CONTACTE",
  "QUALIFIE",
  "PROPOSITION",
  "NEGOCIATION",
  "GAGNE",
  "PERDU",
];

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    addLead: "Ajouter un lead",
    leads: "leads",
    emptyColumn: "Aucun lead",
    dragHint: "Glissez les leads pour changer leur statut",
  },
  en: {
    addLead: "Add lead",
    leads: "leads",
    emptyColumn: "No leads",
    dragHint: "Drag leads to change their status",
  },
  es: {
    addLead: "Agregar prospecto",
    leads: "prospectos",
    emptyColumn: "Sin prospectos",
    dragHint: "Arrastre los prospectos para cambiar su estado",
  },
  ar: {
    addLead: "إضافة عميل محتمل",
    leads: "عملاء محتملون",
    emptyColumn: "لا يوجد عملاء محتملون",
    dragHint: "اسحب العملاء المحتملين لتغيير حالتهم",
  },
};

// ═══════════════════════════════════════════════════════════
// Droppable Column Component
// ═══════════════════════════════════════════════════════════

interface ColumnProps {
  id: LeadStatus;
  leads: Lead[];
  locale: string;
  onLeadClick?: (lead: Lead) => void;
  onAddLead?: () => void;
}

function Column({ id, leads, locale, onLeadClick, onAddLead }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const t = translations[locale] || translations.fr;

  // Calculate total estimated budget
  const totalBudget = leads.reduce(
    (sum, lead) => sum + (lead.estimatedBudget || 0),
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
        "flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl min-w-[280px] max-w-[320px] flex-shrink-0"
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LeadStatusBadge status={id} locale={locale} size="sm" />
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
              {leads.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onAddLead}
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
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500 py-8">
              {t.emptyColumn}
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                locale={locale}
                onClick={() => onLeadClick?.(lead)}
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

export function LeadKanban({
  initialLeads,
  locale,
  onLeadClick,
  onLeadStatusChange,
  onAddLead,
}: LeadKanbanProps) {
  const t = translations[locale] || translations.fr;

  // Group leads by status
  const [columns, setColumns] = useState<Record<LeadStatus, Lead[]>>(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      NOUVEAU: [],
      CONTACTE: [],
      QUALIFIE: [],
      PROPOSITION: [],
      NEGOCIATION: [],
      GAGNE: [],
      PERDU: [],
    };

    initialLeads.forEach((lead) => {
      const status = lead.status as LeadStatus;
      if (grouped[status]) {
        grouped[status].push(lead);
      }
    });

    return grouped;
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

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
    (id: string): LeadStatus | null => {
      // Check if id is a column id
      if (COLUMN_ORDER.includes(id as LeadStatus)) {
        return id as LeadStatus;
      }

      // Find which column contains the lead
      for (const status of COLUMN_ORDER) {
        if (columns[status].some((lead) => lead.id === id)) {
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

      // Find the lead being dragged
      for (const status of COLUMN_ORDER) {
        const lead = columns[status].find((l) => l.id === active.id);
        if (lead) {
          setActiveLead(lead);
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
        const activeLeads = [...prev[activeColumn]];
        const overLeads = [...prev[overColumn]];

        const activeIndex = activeLeads.findIndex((l) => l.id === active.id);
        const [movedLead] = activeLeads.splice(activeIndex, 1);

        if (movedLead) {
          // Update lead status
          movedLead.status = overColumn;
          overLeads.push(movedLead);
        }

        return {
          ...prev,
          [activeColumn]: activeLeads,
          [overColumn]: overLeads,
        };
      });
    },
    [findColumn]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveLead(null);

      if (!over) return;

      const activeColumn = findColumn(active.id as string);
      const overColumn = findColumn(over.id as string);

      if (!activeColumn || !overColumn) return;

      // If dropped in a different column, call the status change handler
      if (activeColumn !== overColumn && onLeadStatusChange) {
        try {
          await onLeadStatusChange(active.id as string, overColumn);
        } catch {
          // Revert on error
          setColumns((prev) => {
            const sourceLeads = [...prev[overColumn]];
            const targetLeads = [...prev[activeColumn]];

            const index = sourceLeads.findIndex((l) => l.id === active.id);
            if (index !== -1) {
              const [lead] = sourceLeads.splice(index, 1);
              if (lead) {
                lead.status = activeColumn;
                targetLeads.push(lead);
              }
            }

            return {
              ...prev,
              [overColumn]: sourceLeads,
              [activeColumn]: targetLeads,
            };
          });
        }
      }

      // Handle reordering within same column
      if (activeColumn === overColumn && active.id !== over.id) {
        setColumns((prev) => {
          const leads = [...prev[activeColumn]];
          const oldIndex = leads.findIndex((l) => l.id === active.id);
          const newIndex = leads.findIndex((l) => l.id === over.id);

          return {
            ...prev,
            [activeColumn]: arrayMove(leads, oldIndex, newIndex),
          };
        });
      }
    },
    [findColumn, onLeadStatusChange]
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
            leads={columns[status]}
            locale={locale}
            onLeadClick={onLeadClick}
            onAddLead={() => onAddLead?.(status)}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeLead ? (
          <div className="transform rotate-3">
            <LeadCard lead={activeLead} locale={locale} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default LeadKanban;
