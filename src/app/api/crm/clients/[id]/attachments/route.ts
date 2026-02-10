import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createAttachmentSchema = z.object({
  filename: z.string().min(1, "Nom de fichier requis"),
  url: z.string().url("URL invalide"),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  tag: z.string().optional(), // CIN, RC, plan, photo, contrat
  description: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/clients/[id]/attachments - Get client attachments
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    const attachments = await prisma.attachment.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(attachments);
  } catch (error) {
    return handleApiError(error, "Client Attachments GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/clients/[id]/attachments - Create attachment
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = createAttachmentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Create attachment
    const attachment = await prisma.attachment.create({
      data: {
        clientId: id,
        filename: data.filename,
        url: data.url,
        mimeType: data.mimeType,
        size: data.size,
        tag: data.tag,
        description: data.description,
      },
    });

    return apiSuccess(attachment, 201);
  } catch (error) {
    return handleApiError(error, "Client Attachments POST");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/clients/[id]/attachments - Delete attachment
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return apiError("ID de pièce jointe requis", 400);
    }

    // Check if client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Check if attachment exists and belongs to client
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        clientId: id,
      },
    });

    if (!attachment) {
      return apiError("Pièce jointe non trouvée", 404);
    }

    // Delete attachment
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return apiSuccess({ message: "Pièce jointe supprimée" });
  } catch (error) {
    return handleApiError(error, "Client Attachments DELETE");
  }
}
