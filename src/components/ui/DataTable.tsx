"use client";

import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { SkeletonTable } from "./Skeleton";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: keyof T | "actions" | "select";
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Selection
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  // Sorting
  sortKey?: keyof T | null;
  sortDirection?: SortDirection;
  onSort?: (key: keyof T, direction: SortDirection) => void;

  className?: string;
}

// ═══════════════════════════════════════════════════════════
// ALIGNMENT CLASSES
// ═══════════════════════════════════════════════════════════

const alignmentClasses = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

// ═══════════════════════════════════════════════════════════
// SORT ICON COMPONENT
// ═══════════════════════════════════════════════════════════

interface SortIconProps {
  direction: SortDirection;
  active: boolean;
}

function SortIcon({ direction, active }: SortIconProps) {
  if (!active || direction === null) {
    return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
  }

  if (direction === "asc") {
    return <ArrowUp className="w-4 h-4 text-wood-primary" />;
  }

  return <ArrowDown className="w-4 h-4 text-wood-primary" />;
}

// ═══════════════════════════════════════════════════════════
// DATA TABLE COMPONENT
// ═══════════════════════════════════════════════════════════

function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  emptyIcon,

  // Selection
  selectable = false,
  selectedIds = [],
  onSelectionChange,

  // Sorting
  sortKey = null,
  sortDirection = null,
  onSort,

  className,
}: DataTableProps<T>) {
  // Compute selection state
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  // Handle select all
  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row) => row.id));
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string | number) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Handle sort click
  const handleSort = (key: keyof T) => {
    if (!onSort) return;

    let newDirection: SortDirection;

    if (sortKey !== key) {
      // New column, start with ascending
      newDirection = "asc";
    } else if (sortDirection === "asc") {
      newDirection = "desc";
    } else if (sortDirection === "desc") {
      newDirection = null;
    } else {
      newDirection = "asc";
    }

    onSort(key, newDirection);
  };

  // Check if row is selected
  const isRowSelected = (id: string | number) => selectedIds.includes(id);

  // Get cell value
  const getCellValue = (row: T, key: keyof T | "actions" | "select"): unknown => {
    if (key === "actions" || key === "select") return null;
    return row[key];
  };

  // Format cell value for display
  const formatCellValue = (value: unknown): string => {
    if (value == null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return "";
  };

  // Calculate visible columns count for skeleton
  const visibleColumnsCount = columns.length + (selectable ? 1 : 0);

  // Loading state
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <SkeletonTable
          rows={5}
          columns={visibleColumnsCount}
          showHeader
        />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "border border-wood-light rounded-lg overflow-hidden bg-white",
          className
        )}
      >
        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
          {emptyIcon || <Inbox className="w-12 h-12 mb-4 text-gray-300" />}
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border border-wood-light rounded-lg",
        className
      )}
    >
      <table className="w-full min-w-full">
        {/* Header */}
        <thead className="bg-wood-light/30 sticky top-0 z-10">
          <tr>
            {/* Selection checkbox column */}
            {selectable && (
              <th
                className="w-12 px-4 py-3 text-start"
                scope="col"
              >
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}

            {/* Data columns */}
            {columns.map((column) => {
              const isSortable =
                column.sortable && column.key !== "actions" && column.key !== "select";
              const isCurrentSort = sortKey === column.key;

              return (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-wood-dark",
                    alignmentClasses[column.align || "left"],
                    column.width,
                    isSortable && "cursor-pointer select-none hover:bg-wood-light/50 transition-colors"
                  )}
                  onClick={isSortable ? () => handleSort(column.key as keyof T) : undefined}
                  aria-sort={
                    isCurrentSort && sortDirection
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      column.align === "right" && "justify-end",
                      column.align === "center" && "justify-center"
                    )}
                  >
                    <span>{column.header}</span>
                    {isSortable && (
                      <SortIcon
                        direction={isCurrentSort ? sortDirection : null}
                        active={isCurrentSort}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white divide-y divide-wood-light">
          {data.map((row, rowIndex) => {
            const selected = isRowSelected(row.id);

            return (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors",
                  "hover:bg-wood-light/10",
                  selected && "bg-wood-light/20",
                  rowIndex % 2 === 1 && !selected && "bg-gray-50/50"
                )}
              >
                {/* Selection checkbox */}
                {selectable && (
                  <td className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selected}
                      onChange={() => handleRowSelect(row.id)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}

                {/* Data cells */}
                {columns.map((column) => {
                  const value = getCellValue(row, column.key);
                  const isActionsColumn = column.key === "actions";
                  const isSelectColumn = column.key === "select";

                  // Skip select column if we're handling it separately
                  if (isSelectColumn && selectable) return null;

                  return (
                    <td
                      key={String(column.key)}
                      className={cn(
                        "px-4 py-3 text-sm",
                        !isActionsColumn && "text-gray-700",
                        alignmentClasses[column.align || "left"],
                        column.width
                      )}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : formatCellValue(value)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = "DataTable";

export { DataTable };
