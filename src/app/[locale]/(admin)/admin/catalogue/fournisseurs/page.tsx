export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SuppliersPageClient } from "./SuppliersPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Suppliers List Page
// ═══════════════════════════════════════════════════════════

interface SuppliersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function SuppliersPage({
  params,
  searchParams,
}: SuppliersPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // Build where clause
  const where: any = {};
  if (search.search) {
    where.OR = [
      { name: { contains: search.search, mode: "insensitive" } },
      { code: { contains: search.search, mode: "insensitive" } },
      { contactName: { contains: search.search, mode: "insensitive" } },
      { city: { contains: search.search, mode: "insensitive" } },
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      }
    >
      <SuppliersPageClient
        suppliers={suppliers}
        locale={locale}
        searchQuery={search.search || ""}
      />
    </Suspense>
  );
}
