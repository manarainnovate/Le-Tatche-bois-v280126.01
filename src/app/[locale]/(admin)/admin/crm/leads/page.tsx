export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LeadsPageClient } from "./LeadsPageClient";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Leads | CRM - Le Tatche Bois",
};

// ═══════════════════════════════════════════════════════════
// Server Component
// ═══════════════════════════════════════════════════════════

export default async function LeadsPage() {
  const locale = await getLocale();

  // Fetch leads
  const leads = await prisma.lead.findMany({
    include: {
      assignedTo: {
        select: { id: true, name: true },
      },
      _count: {
        select: { activities: true, appointments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch users for assignment filter
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Get stats
  const stats = await prisma.lead.groupBy({
    by: ["status"],
    _count: { id: true },
    _sum: { budgetMax: true },
  });

  const statsMap = stats.reduce(
    (acc, s) => {
      acc[s.status] = {
        count: s._count.id,
        budget: Number(s._sum.budgetMax) || 0,
      };
      return acc;
    },
    {} as Record<string, { count: number; budget: number }>
  );

  return (
    <Suspense fallback={<LeadsPageSkeleton />}>
      <LeadsPageClient
        initialLeads={JSON.parse(JSON.stringify(leads))}
        users={users}
        stats={statsMap}
        locale={locale}
      />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// Loading Skeleton
// ═══════════════════════════════════════════════════════════

function LeadsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Kanban skeleton */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
