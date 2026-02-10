import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createTaskSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});

const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  order: z.number().optional(),
});

const reorderTasksSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects/[id]/tasks - Get project tasks
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

    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
      orderBy: { order: "asc" },
    });

    // Group by status
    const grouped = {
      pending: tasks.filter((t) => t.status === "pending"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      completed: tasks.filter((t) => t.status === "completed"),
      cancelled: tasks.filter((t) => t.status === "cancelled"),
    };

    return apiSuccess({ tasks, grouped });
  } catch (error) {
    return handleApiError(error, "Project Tasks GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/projects/[id]/tasks - Create task
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createTaskSchema.safeParse(body);
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
    const maxOrder = await prisma.task.aggregate({
      where: { projectId: id },
      _max: { order: true },
    });

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId: id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignedToId: data.assignedToId || undefined,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    return apiSuccess(task, 201);
  } catch (error) {
    return handleApiError(error, "Project Tasks POST");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/projects/[id]/tasks - Update task
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check for reorder request
    if (body.tasks) {
      const validation = reorderTasksSchema.safeParse(body);
      if (!validation.success) {
        return apiError("Données invalides", 400);
      }

      // Update order for all tasks
      await prisma.$transaction(
        validation.data.tasks.map((t) =>
          prisma.task.update({
            where: { id: t.id },
            data: { order: t.order },
          })
        )
      );

      return apiSuccess({ message: "Ordre mis à jour" });
    }

    // Single task update
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if task exists
    const existingTask = await prisma.task.findFirst({
      where: { id: data.id, projectId: id },
    });

    if (!existingTask) {
      return apiError("Tâche non trouvée", 404);
    }

    // Prepare update
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "completed") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;
    if (data.order !== undefined) updateData.order = data.order;

    const task = await prisma.task.update({
      where: { id: data.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    return apiSuccess(task);
  } catch (error) {
    return handleApiError(error, "Project Tasks PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/projects/[id]/tasks - Delete task
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return apiError("ID de tâche requis", 400);
    }

    // Check if task exists
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId: id },
    });

    if (!task) {
      return apiError("Tâche non trouvée", 404);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return apiSuccess({ message: "Tâche supprimée" });
  } catch (error) {
    return handleApiError(error, "Project Tasks DELETE");
  }
}
