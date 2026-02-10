import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DevisPageClient } from "./DevisPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Devis B2B List Page
// ═══════════════════════════════════════════════════════════

interface DevisPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
    clientId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function DevisPage({ params, searchParams }: DevisPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  const page = parseInt(search.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {
    type: "DEVIS",
  };

  if (search.status) {
    where.status = search.status;
  }
  if (search.clientId) {
    where.clientId = search.clientId;
  }
  if (search.search) {
    where.OR = [
      { number: { contains: search.search, mode: "insensitive" } },
      { clientName: { contains: search.search, mode: "insensitive" } },
    ];
  }
  if (search.dateFrom || search.dateTo) {
    where.date = {};
    if (search.dateFrom) {
      (where.date as Record<string, unknown>).gte = new Date(search.dateFrom);
    }
    if (search.dateTo) {
      (where.date as Record<string, unknown>).lte = new Date(search.dateTo);
    }
  }

  // Fetch documents
  const [documents, total, clients] = await Promise.all([
    prisma.cRMDocument.findMany({
      where,
      include: {
        client: {
          select: { id: true, fullName: true, clientNumber: true },
        },
        project: {
          select: { id: true, name: true, projectNumber: true },
        },
        _count: {
          select: { items: true, children: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.cRMDocument.count({ where }),
    // Clients for filter
    prisma.cRMClient.findMany({
      select: { id: true, fullName: true, clientNumber: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  // Transform documents
  const transformedDocuments = documents.map((doc) => ({
    ...doc,
    totalHT: Number(doc.totalHT),
    discountAmount: Number(doc.discountAmount),
    netHT: Number(doc.netHT),
    totalTVA: Number(doc.totalTVA),
    totalTTC: Number(doc.totalTTC),
    depositPercent: doc.depositPercent ? Number(doc.depositPercent) : null,
    depositAmount: doc.depositAmount ? Number(doc.depositAmount) : null,
  }));

  // Stats
  const stats = await prisma.cRMDocument.groupBy({
    by: ["status"],
    where: { type: "DEVIS" },
    _count: true,
    _sum: { totalTTC: true },
  });

  // Calculate conversion rate
  const acceptedCount = stats.find((s) => s.status === "ACCEPTED")?._count || 0;
  const totalDevis = stats.reduce((acc, s) => acc + (s._count || 0), 0);
  const conversionRate = totalDevis > 0 ? Math.round((acceptedCount / totalDevis) * 100) : 0;

  // Get expiring devis count
  const expiringCount = await prisma.cRMDocument.count({
    where: {
      type: "DEVIS",
      status: { in: ["DRAFT", "SENT"] },
      validUntil: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
    },
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
      <DevisPageClient
        documents={transformedDocuments}
        clients={clients}
        locale={locale}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalCount={total}
        filters={{
          status: search.status || "",
          clientId: search.clientId || "",
          search: search.search || "",
          dateFrom: search.dateFrom || "",
          dateTo: search.dateTo || "",
        }}
        stats={stats.map((s) => ({
          status: s.status,
          count: s._count,
          total: s._sum.totalTTC ? Number(s._sum.totalTTC) : 0,
        }))}
        conversionRate={conversionRate}
        expiringCount={expiringCount}
      />
    </Suspense>
  );
}
