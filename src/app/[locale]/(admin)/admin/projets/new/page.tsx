import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/crm/projects";

// ═══════════════════════════════════════════════════════════
// Server Component - New Project Page
// ═══════════════════════════════════════════════════════════

interface NewProjectPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewProjectPage({
  params,
  searchParams,
}: NewProjectPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // Fetch clients and users
  const [clients, users] = await Promise.all([
    prisma.cRMClient.findMany({
      select: {
        id: true,
        clientNumber: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Initial data with pre-selected client if provided
  const initialData = search.clientId
    ? { clientId: search.clientId }
    : undefined;

  return (
    <Suspense
      fallback={
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      }
    >
      <ProjectForm
        locale={locale}
        clients={clients}
        users={users}
        initialData={initialData}
      />
    </Suspense>
  );
}
