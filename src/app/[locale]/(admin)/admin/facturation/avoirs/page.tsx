export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AvoirsPageClient } from "./AvoirsPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Avoirs (Credit Notes) List Page
// ═══════════════════════════════════════════════════════════

interface AvoirsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
    clientId?: string;
    factureId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function AvoirsPage({ params, searchParams }: AvoirsPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  const page = parseInt(search.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = {
    type: "AVOIR",
  };

  if (search.status) {
    where.status = search.status;
  }
  if (search.clientId) {
    where.clientId = search.clientId;
  }
  if (search.factureId) {
    where.parentId = search.factureId;
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
  const [documents, total, clients, factures] = await Promise.all([
    prisma.cRMDocument.findMany({
      where,
      include: {
        client: {
          select: { id: true, fullName: true, clientNumber: true },
        },
        project: {
          select: { id: true, name: true, projectNumber: true },
        },
        parent: {
          select: { id: true, number: true, type: true },
        },
        _count: {
          select: { items: true },
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
    // Factures for filter
    prisma.cRMDocument.findMany({
      where: {
        type: "FACTURE",
        status: { in: ["PAID", "PARTIAL"] },
      },
      select: { id: true, number: true, clientName: true },
      orderBy: { createdAt: "desc" },
      take: 100,
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
    paidAmount: Number(doc.paidAmount),
    balance: Number(doc.balance),
  }));

  // Stats
  const stats = await prisma.cRMDocument.groupBy({
    by: ["status"],
    where: { type: "AVOIR" },
    _count: true,
    _sum: { totalTTC: true },
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
      <AvoirsPageClient
        documents={transformedDocuments}
        clients={clients}
        factures={factures}
        locale={locale}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalCount={total}
        filters={{
          status: search.status || "",
          clientId: search.clientId || "",
          factureId: search.factureId || "",
          search: search.search || "",
          dateFrom: search.dateFrom || "",
          dateTo: search.dateTo || "",
        }}
        stats={stats.map((s) => ({
          status: s.status,
          count: s._count,
          total: s._sum.totalTTC ? Number(s._sum.totalTTC) : 0,
        }))}
      />
    </Suspense>
  );
}
