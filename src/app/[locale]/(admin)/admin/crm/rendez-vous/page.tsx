export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CalendarPageClient } from "./CalendarPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Appointments Calendar Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function AppointmentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // Get current month/year or from query params
  const now = new Date();
  const year = parseInt(search.year || String(now.getFullYear()), 10);
  const month = parseInt(search.month || String(now.getMonth() + 1), 10);

  // Calculate date range for the month
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // Expand to include days from previous/next month visible in calendar
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  // Fetch appointments for the visible range
  const appointments = await prisma.appointment.findMany({
    where: {
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      lead: {
        select: { id: true, fullName: true, phone: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Fetch users for assignment
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER"] },
      isActive: true,
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  // Fetch leads for linking
  const leads = await prisma.lead.findMany({
    where: {
      status: { notIn: ["WON", "LOST"] },
    },
    select: { id: true, fullName: true, phone: true, city: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Transform appointments
  const transformedAppointments = appointments.map((apt) => ({
    ...apt,
    startDate: apt.startDate.toISOString(),
    endDate: apt.endDate?.toISOString() || null,
    reminderAt: apt.reminderAt?.toISOString() || null,
  }));

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      }
    >
      <CalendarPageClient
        appointments={transformedAppointments}
        users={users}
        leads={leads}
        locale={locale}
        currentYear={year}
        currentMonth={month}
      />
    </Suspense>
  );
}
