import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["FABRICATION", "INSTALLATION", "BOTH"]).optional(),
  status: z.enum([
    "STUDY",
    "MEASUREMENTS",
    "QUOTE",
    "PENDING",
    "PRODUCTION",
    "READY",
    "DELIVERY",
    "INSTALLATION",
    "COMPLETED",
    "RECEIVED",
    "CLOSED",
    "CANCELLED",
  ]).optional(),
  siteAddress: z.string().optional(),
  siteCity: z.string().optional(),
  startDate: z.string().optional(),
  expectedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  specifications: z.string().optional(),
  materials: z.any().optional(),
  estimatedBudget: z.number().optional(),
  materialCost: z.number().optional(),
  laborCost: z.number().optional(),
  actualCost: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedToId: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects/[id] - Get project details
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.cRMProject.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            clientNumber: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        documents: {
          orderBy: { date: "desc" },
          select: {
            id: true,
            number: true,
            type: true,
            status: true,
            date: true,
            totalTTC: true,
          },
        },
        tasks: {
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
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!project) {
      return apiError("Projet non trouvé", 404);
    }

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error, "Project GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/projects/[id] - Update project
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if project exists
    const existingProject = await prisma.cRMProject.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return apiError("Projet non trouvé", 404);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.siteAddress !== undefined) updateData.siteAddress = data.siteAddress;
    if (data.siteCity !== undefined) updateData.siteCity = data.siteCity;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.expectedEndDate !== undefined) updateData.expectedEndDate = new Date(data.expectedEndDate);
    if (data.actualEndDate !== undefined) updateData.actualEndDate = new Date(data.actualEndDate);
    if (data.specifications !== undefined) updateData.specifications = data.specifications;
    if (data.materials !== undefined) updateData.materials = data.materials;
    if (data.estimatedBudget !== undefined) updateData.estimatedBudget = data.estimatedBudget;
    if (data.materialCost !== undefined) updateData.materialCost = data.materialCost;
    if (data.laborCost !== undefined) updateData.laborCost = data.laborCost;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;

    // Calculate margin if costs are provided
    if (data.actualCost !== undefined && existingProject.estimatedBudget) {
      const budget = Number(existingProject.estimatedBudget);
      const cost = data.actualCost;
      updateData.margin = budget - cost;
      updateData.marginPercent = budget > 0 ? ((budget - cost) / budget) * 100 : 0;
    }

    // Update project
    const project = await prisma.cRMProject.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            clientNumber: true,
            fullName: true,
          },
        },
      },
    });

    // Create activity for status change
    if (data.status && data.status !== existingProject.status) {
      await prisma.activity.create({
        data: {
          projectId: id,
          type: "STATUS_CHANGE",
          title: `Statut changé: ${existingProject.status} → ${data.status}`,
          description: `Statut du projet mis à jour`,
        },
      });
    }

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error, "Project PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/projects/[id] - Delete project
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const project = await prisma.cRMProject.findUnique({
      where: { id },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!project) {
      return apiError("Projet non trouvé", 404);
    }

    // Block deletion if has documents
    if (project._count.documents > 0) {
      return apiError("Impossible de supprimer un projet avec des documents", 400);
    }

    // Delete project (cascades to tasks, journal, media, checklist)
    await prisma.cRMProject.delete({
      where: { id },
    });

    return apiSuccess({ message: "Projet supprimé" });
  } catch (error) {
    return handleApiError(error, "Project DELETE");
  }
}
