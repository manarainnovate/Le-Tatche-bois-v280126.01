import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createMediaSchema = z.object({
  url: z.string().url("URL invalide"),
  filename: z.string().min(1, "Nom de fichier requis"),
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "PLAN"]).default("IMAGE"),
  tag: z.enum(["BEFORE", "DURING", "AFTER", "PLAN", "SIGNATURE", "CONTRACT", "OTHER"]).default("OTHER"),
  description: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/projects/[id]/media - Get project media
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const type = searchParams.get("type");

    // Check if project exists
    const project = await prisma.cRMProject.findUnique({
      where: { id },
    });

    if (!project) {
      return apiError("Projet non trouvé", 404);
    }

    const where: Record<string, unknown> = { projectId: id };
    if (tag) where.tag = tag;
    if (type) where.type = type;

    const media = await prisma.projectMedia.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Group by tag
    const grouped = media.reduce((acc, m) => {
      if (!acc[m.tag]) acc[m.tag] = [];
      acc[m.tag].push(m);
      return acc;
    }, {} as Record<string, typeof media>);

    return apiSuccess({ media, grouped });
  } catch (error) {
    return handleApiError(error, "Project Media GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/projects/[id]/media - Add media
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createMediaSchema.safeParse(body);
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

    // Create media entry
    const media = await prisma.projectMedia.create({
      data: {
        projectId: id,
        url: data.url,
        filename: data.filename,
        type: data.type,
        tag: data.tag,
        description: data.description,
      },
    });

    return apiSuccess(media, 201);
  } catch (error) {
    return handleApiError(error, "Project Media POST");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/projects/[id]/media - Delete media
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return apiError("ID de média requis", 400);
    }

    // Check if media exists
    const media = await prisma.projectMedia.findFirst({
      where: { id: mediaId, projectId: id },
    });

    if (!media) {
      return apiError("Média non trouvé", 404);
    }

    await prisma.projectMedia.delete({
      where: { id: mediaId },
    });

    return apiSuccess({ message: "Média supprimé" });
  } catch (error) {
    return handleApiError(error, "Project Media DELETE");
  }
}
