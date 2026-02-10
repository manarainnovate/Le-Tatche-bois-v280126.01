import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createChecklistSchema = z.object({
  item: z.string().min(1, "Item requis"),
});

const updateChecklistSchema = z.object({
  id: z.string().min(1),
  checked: z.boolean().optional(),
  notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects/[id]/checklist - Get project checklist
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const project = await prisma.cRMProject.findUnique({
      where: { id },
    });

    if (!project) {
      return apiError("Projet non trouvé", 404);
    }

    const checklist = await prisma.projectChecklist.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    // Calculate completion
    const total = checklist.length;
    const completed = checklist.filter((c) => c.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return apiSuccess({
      checklist,
      stats: { total, completed, percentage },
    });
  } catch (error) {
    return handleApiError(error, "Project Checklist GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/projects/[id]/checklist - Add checklist item
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createChecklistSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if project exists
    const project = await prisma.cRMProject.findUnique({
      where: { id },
    });

    if (!project) {
      return apiError("Projet non trouvé", 404);
    }

    // Get max order
    const maxOrder = await prisma.projectChecklist.aggregate({
      where: { projectId: id },
      _max: { order: true },
    });

    // Create checklist item
    const item = await prisma.projectChecklist.create({
      data: {
        projectId: id,
        item: data.item,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    return apiSuccess(item, 201);
  } catch (error) {
    return handleApiError(error, "Project Checklist POST");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/projects/[id]/checklist - Update checklist item
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateChecklistSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if item exists
    const existingItem = await prisma.projectChecklist.findFirst({
      where: { id: data.id, projectId: id },
    });

    if (!existingItem) {
      return apiError("Item non trouvé", 404);
    }

    // Prepare update
    const updateData: Record<string, unknown> = {};
    if (data.checked !== undefined) {
      updateData.checked = data.checked;
      updateData.checkedAt = data.checked ? new Date() : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    const item = await prisma.projectChecklist.update({
      where: { id: data.id },
      data: updateData,
    });

    return apiSuccess(item);
  } catch (error) {
    return handleApiError(error, "Project Checklist PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/projects/[id]/checklist - Delete checklist item
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return apiError("ID d'item requis", 400);
    }

    // Check if item exists
    const item = await prisma.projectChecklist.findFirst({
      where: { id: itemId, projectId: id },
    });

    if (!item) {
      return apiError("Item non trouvé", 404);
    }

    await prisma.projectChecklist.delete({
      where: { id: itemId },
    });

    return apiSuccess({ message: "Item supprimé" });
  } catch (error) {
    return handleApiError(error, "Project Checklist DELETE");
  }
}
