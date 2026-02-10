"use client";

import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_CONFIG,
  type ProjectStatus,
  type SupportedLocale,
} from "@/lib/status-config";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ProjectStatusBadgeProps {
  status: ProjectStatus | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  locale?: string;
}

// ═══════════════════════════════════════════════════════════
// Dot Colors
// ═══════════════════════════════════════════════════════════

const dotColors: Record<string, string> = {
  slate: "bg-slate-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  green: "bg-green-500",
  gray: "bg-gray-500",
  red: "bg-red-500",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectStatusBadge({
  status,
  size = "md",
  showDot = true,
  locale = "fr",
}: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status as ProjectStatus];

  // Fallback if status not found
  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium",
          "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm"
        )}
      >
        {showDot && <span className="rounded-full bg-gray-500 h-2 w-2" />}
        {status}
      </span>
    );
  }

  const label = config.labels[locale as SupportedLocale] || config.labels.fr;
  const dotColor = dotColors[config.color] || "bg-gray-500";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bgColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      {showDot && <span className={cn("rounded-full", dotColor, dotSizes[size])} />}
      {label}
    </span>
  );
}

export default ProjectStatusBadge;
