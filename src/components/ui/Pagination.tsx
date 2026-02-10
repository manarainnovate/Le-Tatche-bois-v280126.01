"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface PaginationColors {
  color?: string;        // inactive page numbers
  activeColor?: string;  // active page text
  activeBg?: string;     // active page background
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;

  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showInfo?: boolean;
  showFirstLast?: boolean;

  siblingCount?: number;

  colors?: PaginationColors;

  className?: string;
}

type PageItem = number | "ellipsis";

// ═══════════════════════════════════════════════════════════
// PAGE NUMBER GENERATION LOGIC
// ═══════════════════════════════════════════════════════════

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  // Total slots = first + last + current + 2*siblings + 2*ellipsis
  const totalPageNumbers = siblingCount * 2 + 5;

  // If total pages is less than what we want to show, show all pages
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: PageItem[] = [];

  // Always add first page
  pages.push(1);

  // Left ellipsis
  if (showLeftEllipsis) {
    pages.push("ellipsis");
  } else if (leftSiblingIndex > 1) {
    // Add page 2 if we're not showing ellipsis but need it
    pages.push(2);
  }

  // Add sibling pages and current page
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // Right ellipsis
  if (showRightEllipsis) {
    pages.push("ellipsis");
  } else if (rightSiblingIndex < totalPages) {
    // Add second to last page if we're not showing ellipsis
    if (rightSiblingIndex < totalPages - 1) {
      pages.push(totalPages - 1);
    }
  }

  // Always add last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

// ═══════════════════════════════════════════════════════════
// PAGINATION BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════

interface PaginationButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  colors?: PaginationColors;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}

function PaginationButton({
  onClick,
  disabled = false,
  active = false,
  children,
  colors,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
}: PaginationButtonProps) {
  const style: React.CSSProperties = {};
  if (active && colors?.activeBg) style.backgroundColor = colors.activeBg;
  if (active && colors?.activeColor) style.color = colors.activeColor;
  if (!active && !disabled && colors?.color) style.color = colors.color;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      aria-disabled={disabled}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-md",
        "text-sm font-medium transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary focus-visible:ring-offset-2",
        // Default state (only use Tailwind classes if no custom color)
        !active && !disabled && !colors?.color && "text-gray-600",
        !active && !disabled && "hover:bg-wood-light/50",
        // Active state (only use Tailwind classes if no custom colors)
        active && !colors?.activeBg && "bg-wood-primary",
        active && !colors?.activeColor && "text-white",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={style}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGINATION ELLIPSIS
// ═══════════════════════════════════════════════════════════

function PaginationEllipsis() {
  return (
    <span
      className={cn(
        "w-9 h-9 flex items-center justify-center",
        "text-gray-400 cursor-default select-none"
      )}
      aria-hidden="true"
    >
      ...
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGINATION COMPONENT
// ═══════════════════════════════════════════════════════════

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = false,
  showInfo = false,
  showFirstLast = false,
  siblingCount = 1,
  colors,
  className,
}: PaginationProps) {
  const [isRtl, setIsRtl] = React.useState(false);

  // Detect RTL
  React.useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // Calculate page numbers
  const pageNumbers = React.useMemo(
    () => getPageNumbers(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  // Calculate info text values
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Navigation handlers
  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages);

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange?.(Number(e.target.value));
  };

  // Don't render if no pages
  if (totalPages <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 flex-wrap",
        className
      )}
    >
      {/* Info text */}
      {showInfo && (
        <span className="text-sm text-gray-600 order-1">
          Showing{" "}
          <span className="font-medium text-wood-dark">{startItem}</span>-
          <span className="font-medium text-wood-dark">{endItem}</span> of{" "}
          <span className="font-medium text-wood-dark">{totalItems}</span>
        </span>
      )}

      {/* Page navigation */}
      <nav
        className={cn("flex items-center gap-1 order-2", isRtl && "flex-row-reverse")}
        aria-label="Pagination"
        role="navigation"
      >
        {/* First page button */}
        {showFirstLast && (
          <PaginationButton
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            colors={colors}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </PaginationButton>
        )}

        {/* Previous button */}
        <PaginationButton
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          colors={colors}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>

        {/* Page numbers */}
        <div className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : (
              <PaginationButton
                key={page}
                onClick={() => onPageChange(page)}
                active={page === currentPage}
                colors={colors}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </PaginationButton>
            )
          )}
        </div>

        {/* Next button */}
        <PaginationButton
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          colors={colors}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>

        {/* Last page button */}
        {showFirstLast && (
          <PaginationButton
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
            colors={colors}
            aria-label="Go to last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </PaginationButton>
        )}
      </nav>

      {/* Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center gap-2 order-3">
          <label
            htmlFor="page-size-select"
            className="text-sm text-gray-600 whitespace-nowrap"
          >
            Rows per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className={cn(
              "h-9 px-2 rounded-md border border-wood-light",
              "bg-white text-sm text-wood-dark",
              "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 focus:border-wood-primary",
              "transition-colors duration-200"
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

Pagination.displayName = "Pagination";

export { Pagination };
