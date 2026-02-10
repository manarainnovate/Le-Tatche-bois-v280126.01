"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface KanbanColumn<T> {
  id: string;
  title: string;
  color: string;
  items: T[];
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  onDragEnd: (itemId: string, sourceColumnId: string, targetColumnId: string) => void | Promise<void>;
  renderCard: (item: T, isDragging: boolean) => React.ReactNode;
  getItemId: (item: T) => string;
  emptyText?: string;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Kanban Board Component
// ═══════════════════════════════════════════════════════════

export function KanbanBoard<T>({
  columns,
  onDragEnd,
  renderCard,
  getItemId,
  emptyText = "No items",
  className,
}: KanbanBoardProps<T>) {
  const [draggedItem, setDraggedItem] = useState<{ id: string; columnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, columnId: string) => {
    setDraggedItem({ id: itemId, columnId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();
      setDragOverColumn(null);

      if (draggedItem && draggedItem.columnId !== targetColumnId) {
        void onDragEnd(draggedItem.id, draggedItem.columnId, targetColumnId);
      }

      setDraggedItem(null);
    },
    [draggedItem, onDragEnd]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverColumn(null);
  }, []);

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            "flex min-w-[300px] flex-shrink-0 flex-col rounded-xl border bg-gray-50 dark:bg-gray-900/50",
            dragOverColumn === column.id
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-gray-200 dark:border-gray-700"
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {column.items.length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="flex flex-1 flex-col gap-2 p-3">
            {column.items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-gray-400">
                {emptyText}
              </div>
            ) : (
              column.items.map((item) => {
                const itemId = getItemId(item);
                const isDragging = draggedItem?.id === itemId;

                return (
                  <div
                    key={itemId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, itemId, column.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-grab transition-all active:cursor-grabbing",
                      isDragging && "opacity-50"
                    )}
                  >
                    {renderCard(item, isDragging)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
