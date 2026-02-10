"use client";

import { cn } from "@/lib/utils";
import { Flag, AlertTriangle, Minus, ArrowDown } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type Priority = "low" | "medium" | "high" | "urgent";

interface ProjectPriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  locale?: string;
}

// ═══════════════════════════════════════════════════════════
// Priority Configuration
// ═══════════════════════════════════════════════════════════

const priorityConfig: Record<
  Priority,
  { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  low: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: ArrowDown,
  },
  medium: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: Minus,
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    icon: Flag,
  },
  urgent: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: AlertTriangle,
  },
};

const priorityLabels: Record<string, Record<Priority, string>> = {
  fr: {
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgente",
  },
  en: {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  },
  es: {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  },
  ar: {
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    urgent: "عاجلة",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ProjectPriorityBadge({
  priority,
  size = "md",
  showIcon = true,
  locale = "fr",
}: ProjectPriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const labels = priorityLabels[locale] || priorityLabels.fr;
  const label = labels[priority] || priority;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

export default ProjectPriorityBadge;
