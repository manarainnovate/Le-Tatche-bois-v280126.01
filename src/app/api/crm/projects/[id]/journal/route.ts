import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createJournalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Contenu requis"),
  date: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects/[id]/journal - Get project journal
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

    const entries = await prisma.projectJournal.findMany({
      where: { projectId: id },
      orderBy: { date: "desc" },
    });

    return apiSuccess(entries);
  } catch (error) {
    return handleApiError(error, "Project Journal GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/projects/[id]/journal - Create journal entry
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createJournalSchema.safeParse(body);
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

    // Create journal entry
    const entry = await prisma.projectJournal.create({
      data: {
        projectId: id,
        title: data.title,
        content: data.content,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return apiSuccess(entry, 201);
  } catch (error) {
    return handleApiError(error, "Project Journal POST");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/projects/[id]/journal - Delete journal entry
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return apiError("ID d'entrée requis", 400);
    }

    // Check if entry exists
    const entry = await prisma.projectJournal.findFirst({
      where: { id: entryId, projectId: id },
    });

    if (!entry) {
      return apiError("Entrée non trouvée", 404);
    }

    await prisma.projectJournal.delete({
      where: { id: entryId },
    });

    return apiSuccess({ message: "Entrée supprimée" });
  } catch (error) {
    return handleApiError(error, "Project Journal DELETE");
  }
}
