export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ClientDetailClient } from "./ClientDetailClient";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.cRMClient.findUnique({
    where: { id },
    select: { clientNumber: true, fullName: true },
  });

  if (!client) {
    return { title: "Client non trouvé | CRM" };
  }

  return {
    title: `${client.clientNumber} - ${client.fullName} | CRM - Le Tatche Bois`,
  };
}

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; tab?: string }>;
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { edit, tab } = await searchParams;
  const locale = await getLocale();

  // Fetch client with all related data
  const client = await prisma.cRMClient.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          projectNumber: true,
          name: true,
          status: true,
          type: true,
          estimatedBudget: true,
          actualCost: true,
          startDate: true,
          expectedEndDate: true,
          actualEndDate: true,
          createdAt: true,
        },
      },
      documents: {
        orderBy: { date: "desc" },
        include: {
          project: {
            select: { id: true, projectNumber: true, name: true },
          },
          _count: {
            select: { items: true, payments: true },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Fetch payments separately (through documents)
  const payments = await prisma.cRMPayment.findMany({
    where: {
      document: {
        clientId: id,
      },
    },
    include: {
      document: {
        select: {
          id: true,
          number: true,
          type: true,
          totalTTC: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return (
    <ClientDetailClient
      client={JSON.parse(JSON.stringify(client))}
      payments={JSON.parse(JSON.stringify(payments))}
      locale={locale}
      initialTab={tab || "info"}
      initialEdit={edit === "true"}
    />
  );
}
