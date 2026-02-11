export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ClientsPageClient } from "./ClientsPageClient";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Clients | CRM - Le Tatche Bois",
};

// ═══════════════════════════════════════════════════════════
// Server Component
// ═══════════════════════════════════════════════════════════

export default async function ClientsPage() {
  const locale = await getLocale();

  // Fetch clients with aggregated data
  const clients = await prisma.cRMClient.findMany({
    include: {
      _count: {
        select: {
          projects: true,
          documents: true,
          activities: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get stats
  const stats = await prisma.cRMClient.aggregate({
    _count: { id: true },
    _sum: { totalInvoiced: true, totalPaid: true, balance: true },
  });

  const typeStats = await prisma.cRMClient.groupBy({
    by: ["clientType"],
    _count: { id: true },
  });

  const typeStatsMap = typeStats.reduce(
    (acc, s) => {
      acc[s.clientType] = s._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Suspense fallback={<ClientsPageSkeleton />}>
      <ClientsPageClient
        initialClients={JSON.parse(JSON.stringify(clients))}
        stats={{
          total: stats._count.id,
          totalRevenue: Number(stats._sum.totalInvoiced) || 0,
          totalPaid: Number(stats._sum.totalPaid) || 0,
          balance: Number(stats._sum.balance) || 0,
          byType: typeStatsMap,
        }}
        locale={locale}
      />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// Loading Skeleton
// ═══════════════════════════════════════════════════════════

function ClientsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  );
}
