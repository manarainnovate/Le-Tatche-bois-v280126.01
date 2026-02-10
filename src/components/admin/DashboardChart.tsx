"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

interface SalesChartProps {
  data: { date: string; amount: number }[];
  locale?: string;
}

interface OrdersChartProps {
  data: { name: string; value: number; color: string }[];
}

interface RevenueChartProps {
  data: { month: string; revenue: number; orders: number }[];
}

// ═══════════════════════════════════════════════════════════
// Chart Container
// ═══════════════════════════════════════════════════════════

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Sales Line Chart
// ═══════════════════════════════════════════════════════════

export function SalesChart({ data, locale = "fr" }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            className="text-gray-500"
          />
          <YAxis
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            className="text-gray-500"
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
            labelFormatter={(label) => formatDate(String(label))}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#d97706"
            strokeWidth={2}
            dot={{ fill: "#d97706", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#d97706" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Orders Pie Chart
// ═══════════════════════════════════════════════════════════

export function OrdersChart({ data }: OrdersChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const numValue = Number(value ?? 0);
              return [
                `${numValue} (${((numValue / total) * 100).toFixed(1)}%)`,
                String(name),
              ];
            }}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Revenue Bar Chart
// ═══════════════════════════════════════════════════════════

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-gray-500" />
          <YAxis
            yAxisId="left"
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            className="text-gray-500"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            className="text-gray-500"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" name="Revenue (MAD)" fill="#d97706" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Chart Skeleton
// ═══════════════════════════════════════════════════════════

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      style={{ height }}
    >
      <div className="mb-4 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-6 flex h-48 items-end justify-around gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-8 rounded-t bg-gray-200 dark:bg-gray-700"
            style={{ height: `${Math.random() * 100 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}
