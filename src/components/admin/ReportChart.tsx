"use client";

import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Simple Chart Components (No external dependency)
// ═══════════════════════════════════════════════════════════

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function SimpleBarChart({
  data,
  maxValue,
  height = 200,
  showLabels = true,
  formatValue = (v) => String(v),
  className,
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative w-full flex-1">
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-t transition-all",
                  item.color ?? "bg-amber-500"
                )}
                style={{ height: `${Math.max(percentage, 2)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100">
                  {formatValue(item.value)}
                </div>
              </div>
            </div>
            {showLabels && (
              <span className="text-xs text-gray-500 truncate max-w-full">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Line Chart
// ═══════════════════════════════════════════════════════════

interface LineChartProps {
  data: { label: string; value: number }[];
  compareData?: { label: string; value: number }[];
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function SimpleLineChart({
  data,
  compareData,
  height = 200,
  className,
}: LineChartProps) {
  if (data.length === 0) return null;

  const allValues = [...data.map((d) => d.value), ...(compareData?.map((d) => d.value) ?? [])];
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;

  // Calculate points
  const getY = (value: number) => height - ((value - min) / range) * (height - 20) - 10;
  const width = Math.max((data.length - 1) * 60, 100);

  // Create path
  const createPath = (points: { label: string; value: number }[]) => {
    return points
      .map((point, i) => {
        const x = (i / Math.max(points.length - 1, 1)) * width;
        const y = getY(point.value);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg width={width + 40} height={height} className="min-w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={20}
            y1={height - ratio * (height - 20) - 10}
            x2={width + 20}
            y2={height - ratio * (height - 20) - 10}
            stroke="currentColor"
            strokeOpacity={0.1}
            className="text-gray-400"
          />
        ))}

        {/* Compare line */}
        {compareData && (
          <path
            d={createPath(compareData)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="text-gray-300"
            transform="translate(20, 0)"
          />
        )}

        {/* Main line */}
        <path
          d={createPath(data)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-amber-500"
          transform="translate(20, 0)"
        />

        {/* Points */}
        {data.map((point, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * width + 20;
          const y = getY(point.value);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={4}
                fill="currentColor"
                className="text-amber-500"
              />
              {/* Label */}
              <text
                x={x}
                y={height - 2}
                textAnchor="middle"
                className="fill-gray-500 text-[10px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Pie Chart
// ═══════════════════════════════════════════════════════════

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export function SimplePieChart({
  data,
  size = 160,
  showLegend = true,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 10;
  const center = size / 2;

  // Calculate slices
  let currentAngle = -90; // Start from top
  const slices = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: ((item.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Chart */}
      <svg width={size} height={size}>
        {slices.map((slice, i) => (
          <path
            key={i}
            d={slice.path}
            fill={slice.color}
            stroke="white"
            strokeWidth={2}
            className="transition-opacity hover:opacity-80"
          />
        ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {slice.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {slice.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
