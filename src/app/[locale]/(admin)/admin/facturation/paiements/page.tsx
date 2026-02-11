export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { PaiementsPageClient } from "./PaiementsPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Paiements List Page
// ═══════════════════════════════════════════════════════════

interface PaiementsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    method?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

export default async function PaiementsPage({
  params,
  searchParams,
}: PaiementsPageProps) {
  const { locale } = await params;
  const filters = await searchParams;

  const page = parseInt(filters.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search, mode: "insensitive" } },
      { document: { number: { contains: filters.search, mode: "insensitive" } } },
      { document: { clientName: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.method) {
    where.method = filters.method;
  }

  if (filters.clientId) {
    where.document = { ...where.document, clientId: filters.clientId };
  }

  if (filters.startDate) {
    where.date = { ...where.date, gte: new Date(filters.startDate) };
  }

  if (filters.endDate) {
    where.date = { ...where.date, lte: new Date(filters.endDate) };
  }

  // Get payments with pagination
  const [payments, total] = await Promise.all([
    prisma.cRMPayment.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            number: true,
            type: true,
            clientId: true,
            clientName: true,
            totalTTC: true,
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.cRMPayment.count({ where }),
  ]);

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );

  const [monthStats, quarterStats, allTimeStats] = await Promise.all([
    prisma.cRMPayment.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cRMPayment.aggregate({
      where: { date: { gte: startOfQuarter } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cRMPayment.aggregate({
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Get clients for filter dropdown
  const clients = await prisma.cRMClient.findMany({
    select: { id: true, fullName: true, clientNumber: true },
    orderBy: { fullName: "asc" },
  });

  // Transform data - filter out payments without documents
  const transformedPayments = payments
    .filter((payment) => payment.document !== null)
    .map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
      document: {
        ...payment.document!,
        totalTTC: Number(payment.document!.totalTTC),
      },
    }));

  const stats = {
    monthTotal: Number(monthStats._sum.amount || 0),
    monthCount: monthStats._count,
    quarterTotal: Number(quarterStats._sum.amount || 0),
    quarterCount: quarterStats._count,
    allTimeTotal: Number(allTimeStats._sum.amount || 0),
    allTimeCount: allTimeStats._count,
    averagePayment:
      allTimeStats._count > 0
        ? Number(allTimeStats._sum.amount || 0) / allTimeStats._count
        : 0,
  };

  return (
    <PaiementsPageClient
      payments={transformedPayments}
      stats={stats}
      clients={clients}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }}
      filters={filters}
      locale={locale}
    />
  );
}
