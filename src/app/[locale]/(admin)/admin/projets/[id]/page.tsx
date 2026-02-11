export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectDetailClient } from "./ProjectDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Project Detail Page
// ═══════════════════════════════════════════════════════════

interface ProjectDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { locale, id } = await params;

  // Fetch project with all related data
  const [project, users] = await Promise.all([
    prisma.cRMProject.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            clientNumber: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true },
            },
          },
          orderBy: { order: "asc" },
        },
        journal: {
          orderBy: { date: "desc" },
        },
        media: {
          orderBy: { createdAt: "desc" },
        },
        checklist: {
          orderBy: { order: "asc" },
        },
        documents: {
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            totalHT: true,
            totalTTC: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
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

  // Transform data for client component
  const transformedProject = {
    id: project.id,
    projectNumber: project.projectNumber,
    name: project.name,
    description: project.description,
    status: project.status,
    type: project.type,
    priority: project.priority,
    client: project.client,
    siteAddress: project.siteAddress,
    siteCity: project.siteCity,
    sitePostalCode: project.sitePostalCode,
    startDate: project.startDate?.toISOString() || null,
    expectedEndDate: project.expectedEndDate?.toISOString() || null,
    actualEndDate: project.actualEndDate?.toISOString() || null,
    estimatedBudget: project.estimatedBudget ? Number(project.estimatedBudget) : null,
    materialCost: project.materialCost ? Number(project.materialCost) : null,
    laborCost: project.laborCost ? Number(project.laborCost) : null,
    actualCost: project.actualCost ? Number(project.actualCost) : null,
    margin: project.margin ? Number(project.margin) : null,
    marginPercent: project.marginPercent ? Number(project.marginPercent) : null,
    specifications: project.specifications,
    assignedTo: project.assignedTo,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      completedAt: task.completedAt?.toISOString() || null,
      order: task.order,
      assignedTo: task.assignedTo,
    })),
    journal: project.journal.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString(),
      title: entry.title,
      content: entry.content,
    })),
    media: project.media.map((m) => ({
      id: m.id,
      url: m.url,
      filename: m.filename,
      type: m.type,
      tag: m.tag,
      description: m.description,
      createdAt: m.createdAt.toISOString(),
    })),
    checklist: project.checklist.map((item) => ({
      id: item.id,
      item: item.item,
      checked: item.checked,
      checkedAt: item.checkedAt?.toISOString() || null,
      notes: item.notes,
      order: item.order,
    })),
    documents: project.documents.map((doc) => ({
      id: doc.id,
      documentNumber: doc.number,
      type: doc.type,
      status: doc.status,
      totalHT: Number(doc.totalHT),
      totalTTC: Number(doc.totalTTC),
      createdAt: doc.createdAt.toISOString(),
    })),
    activities: project.activities?.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt.toISOString(),
    })),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      }
    >
      <ProjectDetailClient
        project={transformedProject}
        users={users}
        locale={locale}
      />
    </Suspense>
  );
}
