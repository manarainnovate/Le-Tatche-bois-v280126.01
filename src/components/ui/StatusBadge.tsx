"use client";

import { cn } from "@/lib/utils";
import {
  getStatusConfig,
  getStatusLabel,
  type SupportedLocale,
  type CRMDocumentType,
} from "@/lib/status-config";

// ═══════════════════════════════════════════════════════════
// StatusBadge Component
// Unified status badge for Lead, Project, and Document statuses
// Supports document type-specific styling when docType is provided
// ═══════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: string;
  type: "lead" | "project" | "document";
  docType?: CRMDocumentType; // For document-type-specific status configs
  locale?: SupportedLocale;
  size?: "sm" | "md" | "lg";
  showBorder?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  type,
  docType,
  locale = "fr",
  size = "md",
  showBorder = false,
  className,
}: StatusBadgeProps) {
  const config = getStatusConfig(status, type, docType);
  const label = getStatusLabel(status, type, locale, docType);

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm",
          className
        )}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.textColor,
        showBorder && `border ${config.borderColor}`,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        className
      )}
    >
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Specialized Status Badges
// ═══════════════════════════════════════════════════════════

interface LeadStatusBadgeProps extends Omit<StatusBadgeProps, "type"> {}

export function LeadStatusBadge(props: LeadStatusBadgeProps) {
  return <StatusBadge {...props} type="lead" />;
}

interface ProjectStatusBadgeProps extends Omit<StatusBadgeProps, "type"> {}

export function ProjectStatusBadge(props: ProjectStatusBadgeProps) {
  return <StatusBadge {...props} type="project" />;
}

interface DocumentStatusBadgeProps extends Omit<StatusBadgeProps, "type"> {
  docType?: CRMDocumentType;
}

export function DocumentStatusBadge({ docType, ...props }: DocumentStatusBadgeProps) {
  return <StatusBadge {...props} type="document" docType={docType} />;
}

// ═══════════════════════════════════════════════════════════
// StatusDot - Small colored dot for compact views
// ═══════════════════════════════════════════════════════════

interface StatusDotProps {
  status: string;
  type: "lead" | "project" | "document";
  docType?: CRMDocumentType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusDot({ status, type, docType, size = "md", className }: StatusDotProps) {
  const config = getStatusConfig(status, type, docType);

  const dotColors: Record<string, string> = {
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    red: "bg-red-500",
    slate: "bg-slate-500",
    violet: "bg-violet-500",
    yellow: "bg-yellow-500",
    teal: "bg-teal-500",
    gray: "bg-gray-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };

  const dotColor = config ? dotColors[config.color] || "bg-gray-500" : "bg-gray-500";

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        dotColor,
        size === "sm" && "h-2 w-2",
        size === "md" && "h-2.5 w-2.5",
        size === "lg" && "h-3 w-3",
        className
      )}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// StatusWithDot - Status badge with leading dot
// ═══════════════════════════════════════════════════════════

interface StatusWithDotProps extends StatusBadgeProps {
  dotSize?: "sm" | "md" | "lg";
}

export function StatusWithDot({
  status,
  type,
  docType,
  locale = "fr",
  dotSize = "sm",
  className,
}: StatusWithDotProps) {
  const label = getStatusLabel(status, type, locale, docType);
  const config = getStatusConfig(status, type, docType);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        config?.textColor || "text-gray-700 dark:text-gray-300",
        className
      )}
    >
      <StatusDot status={status} type={type} docType={docType} size={dotSize} />
      <span>{label}</span>
    </span>
  );
}
