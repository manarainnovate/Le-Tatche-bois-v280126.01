"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// SKELETON BASE COMPONENT
// ═══════════════════════════════════════════════════════════

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

function Skeleton({ className, width, height, rounded = "md" }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        // Shimmer gradient animation
        "bg-gradient-to-r from-wood-light/30 via-wood-light/50 to-wood-light/30",
        "bg-[length:200%_100%] animate-shimmer",
        roundedClasses[rounded],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

Skeleton.displayName = "Skeleton";

// ═══════════════════════════════════════════════════════════
// SKELETON TEXT COMPONENT
// ═══════════════════════════════════════════════════════════

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            // Last line is 75% width for natural paragraph look
            index === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

SkeletonText.displayName = "SkeletonText";

// ═══════════════════════════════════════════════════════════
// SKELETON IMAGE COMPONENT
// ═══════════════════════════════════════════════════════════

export interface SkeletonImageProps {
  aspectRatio?: "square" | "video" | "portrait";
  showIcon?: boolean;
  className?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

function SkeletonImage({
  aspectRatio = "square",
  showIcon = true,
  className,
}: SkeletonImageProps) {
  return (
    <div
      className={cn(
        "relative bg-wood-light/20 flex items-center justify-center",
        aspectRatioClasses[aspectRatio],
        className
      )}
      aria-hidden="true"
    >
      {showIcon && (
        <ImageIcon className="w-12 h-12 text-wood-light/50" />
      )}
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer"
      />
    </div>
  );
}

SkeletonImage.displayName = "SkeletonImage";

// ═══════════════════════════════════════════════════════════
// SKELETON CARD COMPONENT
// ═══════════════════════════════════════════════════════════

export interface SkeletonCardProps {
  showFooter?: boolean;
  className?: string;
}

function SkeletonCard({ showFooter = false, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-wood-light/50 overflow-hidden shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <SkeletonImage aspectRatio="square" />

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="h-3 w-1/4" />

        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Description */}
        <SkeletonText lines={2} />

        {/* Price */}
        <Skeleton className="h-6 w-1/3" />
      </div>

      {/* Optional footer with button placeholder */}
      {showFooter && (
        <div className="px-4 pb-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

SkeletonCard.displayName = "SkeletonCard";

// ═══════════════════════════════════════════════════════════
// SKELETON TABLE COMPONENT
// ═══════════════════════════════════════════════════════════

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

// Varying column widths for natural look
const columnWidths = ["w-24", "w-32", "w-40", "w-28", "w-36", "w-20"];

function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "border border-wood-light rounded-lg overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Header row */}
      {showHeader && (
        <div className="flex bg-wood-light/20 border-b border-wood-light">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`header-${colIndex}`}
              className="flex-1 h-12 px-4 flex items-center"
            >
              <Skeleton
                className={cn("h-4", columnWidths[colIndex % columnWidths.length])}
              />
            </div>
          ))}
        </div>
      )}

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={cn(
            "flex border-b border-wood-light/50 last:border-0",
            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="flex-1 h-14 px-4 flex items-center"
            >
              <Skeleton
                className={cn(
                  "h-4",
                  columnWidths[(colIndex + rowIndex) % columnWidths.length]
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

SkeletonTable.displayName = "SkeletonTable";

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export { Skeleton, SkeletonText, SkeletonCard, SkeletonImage, SkeletonTable };
