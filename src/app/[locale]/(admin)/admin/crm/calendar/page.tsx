export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CalendarPageClient } from "./CalendarPageClient";

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Calendrier | CRM - Le Tatche Bois",
};

// ═══════════════════════════════════════════════════════════
// Server Component
// ═══════════════════════════════════════════════════════════

export default async function CalendarPage() {
  const locale = await getLocale();

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  // Fetch appointments for current and next month
  const appointments = await prisma.appointment.findMany({
    where: {
      startDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      lead: {
        select: {
          id: true,
          leadNumber: true,
          fullName: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Fetch related data for clients, projects, and users
  const clientIds = appointments.map((a) => a.clientId).filter(Boolean) as string[];
  const projectIds = appointments.map((a) => a.projectId).filter(Boolean) as string[];
  const userIds = appointments.map((a) => a.assignedToId).filter(Boolean) as string[];

  const [relatedClients, relatedProjects, relatedUsers] = await Promise.all([
    clientIds.length > 0 ? prisma.cRMClient.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, clientNumber: true, fullName: true },
    }) : [],
    projectIds.length > 0 ? prisma.cRMProject.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, projectNumber: true, name: true },
    }) : [],
    userIds.length > 0 ? prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    }) : [],
  ]);

  const clientMap = new Map(relatedClients.map((c) => [c.id, c]));
  const projectMap = new Map(relatedProjects.map((p) => [p.id, p]));
  const userMap = new Map(relatedUsers.map((u) => [u.id, u]));

  // Transform appointments to match component interface
  const transformedAppointments = appointments.map((apt) => ({
    ...apt,
    lead: apt.lead ? { ...apt.lead, contactName: apt.lead.fullName } : null,
    client: apt.clientId ? { ...clientMap.get(apt.clientId), name: clientMap.get(apt.clientId)?.fullName } : null,
    project: apt.projectId ? projectMap.get(apt.projectId) : null,
    assignedTo: apt.assignedToId ? userMap.get(apt.assignedToId) : null,
  }));

  // Fetch leads and clients for the form
  const leadsData = await prisma.lead.findMany({
    where: {
      status: { notIn: ["WON", "LOST"] },
    },
    select: {
      id: true,
      leadNumber: true,
      fullName: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const leads = leadsData.map((l) => ({
    id: l.id,
    leadNumber: l.leadNumber,
    contactName: l.fullName,
  }));

  const clientsData = await prisma.cRMClient.findMany({
    select: {
      id: true,
      clientNumber: true,
      fullName: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const clients = clientsData.map((c) => ({
    id: c.id,
    clientNumber: c.clientNumber,
    name: c.fullName,
  }));

  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarPageClient
        initialAppointments={JSON.parse(JSON.stringify(transformedAppointments))}
        leads={leads}
        clients={clients}
        locale={locale}
      />
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// Loading Skeleton
// ═══════════════════════════════════════════════════════════

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Calendar skeleton */}
      <div className="flex gap-6">
        <div className="flex-1 h-[600px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="w-80 h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
