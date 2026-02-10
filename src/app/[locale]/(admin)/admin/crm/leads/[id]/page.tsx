import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "./LeadDetailClient";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { leadNumber: true, fullName: true },
  });

  if (!lead) {
    return { title: "Lead non trouvé | CRM" };
  }

  return {
    title: `${lead.leadNumber} - ${lead.fullName} | CRM - Le Tatche Bois`,
  };
}

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();

  // Fetch lead with all related data
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      appointments: {
        orderBy: { startDate: "asc" },
        where: {
          startDate: { gte: new Date() },
        },
        take: 5,
      },
      convertedToClient: {
        select: {
          id: true,
          clientNumber: true,
          fullName: true,
        },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // Fetch users for assignment
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER", "COMMERCIAL"] },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <LeadDetailClient
      lead={JSON.parse(JSON.stringify(lead))}
      users={users}
      locale={locale}
    />
  );
}
