"use client";

import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  Users,
  Package,
  Settings,
  Calendar,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Icon Map
// ═══════════════════════════════════════════════════════════

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  Users,
  Package,
  Settings,
  Calendar,
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Variant Styles
// ═══════════════════════════════════════════════════════════

const variantStyles = {
  default: {
    icon: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
  },
  success: {
    icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  danger: {
    icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  info: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
};

// ═══════════════════════════════════════════════════════════
// StatsCard Component
// ═══════════════════════════════════════════════════════════

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const Icon = iconMap[icon] || ShoppingCart;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800",
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-3", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Stats Card Skeleton
// ═══════════════════════════════════════════════════════════

export function StatsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-3 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
