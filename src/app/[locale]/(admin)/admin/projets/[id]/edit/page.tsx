import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/crm/projects";

// ═══════════════════════════════════════════════════════════
// Server Component - Edit Project Page
// ═══════════════════════════════════════════════════════════

interface EditProjectPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { locale, id } = await params;

  // Fetch project, clients, and users
  const [project, clients, users] = await Promise.all([
    prisma.cRMProject.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        name: true,
        description: true,
        type: true,
        status: true,
        priority: true,
        siteAddress: true,
        siteCity: true,
        sitePostalCode: true,
        startDate: true,
        expectedEndDate: true,
        estimatedBudget: true,
        materialCost: true,
        laborCost: true,
        specifications: true,
        assignedToId: true,
      },
    }),
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

  if (!project) {
    notFound();
  }

  // Transform project data for form
  const initialData = {
    id: project.id,
    clientId: project.clientId,
    name: project.name,
    description: project.description || undefined,
    type: project.type as "FABRICATION" | "INSTALLATION" | "BOTH",
    status: project.status,
    priority: project.priority,
    siteAddress: project.siteAddress || undefined,
    siteCity: project.siteCity || undefined,
    sitePostalCode: project.sitePostalCode || undefined,
    startDate: project.startDate?.toISOString().split("T")[0] || undefined,
    expectedEndDate: project.expectedEndDate?.toISOString().split("T")[0] || undefined,
    estimatedBudget: project.estimatedBudget ? Number(project.estimatedBudget) : undefined,
    materialCost: project.materialCost ? Number(project.materialCost) : undefined,
    laborCost: project.laborCost ? Number(project.laborCost) : undefined,
    specifications: project.specifications || undefined,
    assignedToId: project.assignedToId || undefined,
  };

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
