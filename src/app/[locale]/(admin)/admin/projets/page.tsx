export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProjectsPageClient } from "./ProjectsPageClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Projects List Page
// ═══════════════════════════════════════════════════════════

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    view?: string;
    status?: string;
    clientId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  const page = parseInt(search.page || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (search.status) where.status = search.status;
  if (search.clientId) where.clientId = search.clientId;
  if (search.search) {
    where.OR = [
      { name: { contains: search.search, mode: "insensitive" } },
      { projectNumber: { contains: search.search, mode: "insensitive" } },
      { client: { name: { contains: search.search, mode: "insensitive" } } },
    ];
  }

  // Fetch projects with related data
  const [projects, total, clients] = await Promise.all([
    prisma.cRMProject.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            clientNumber: true,
            fullName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          where: { status: "completed" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.cRMProject.count({ where }),
    prisma.cRMClient.findMany({
      select: {
        id: true,
        clientNumber: true,
        fullName: true,
      },
      orderBy: { fullName: "asc" },
    }),
  ]);

  // Transform projects for client component
  const transformedProjects = projects.map((project) => ({
    id: project.id,
    projectNumber: project.projectNumber,
    name: project.name,
    description: project.description,
    status: project.status,
    type: project.type,
    priority: project.priority,
    clientId: project.clientId,
    client: project.client,
    siteCity: project.siteCity,
    startDate: project.startDate?.toISOString() || null,
    expectedEndDate: project.expectedEndDate?.toISOString() || null,
    estimatedBudget: project.estimatedBudget ? Number(project.estimatedBudget) : null,
    assignedTo: project.assignedTo,
    _count: project._count,
    tasksProgress: {
      total: project._count.tasks,
      completed: project.tasks.length,
    },
  }));

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      }
    >
      <ProjectsPageClient
        initialProjects={transformedProjects}
        clients={clients}
        locale={locale}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalCount={total}
        filters={{
          view: search.view || "kanban",
          status: search.status || "",
          clientId: search.clientId || "",
          search: search.search || "",
        }}
      />
    </Suspense>
  );
}
