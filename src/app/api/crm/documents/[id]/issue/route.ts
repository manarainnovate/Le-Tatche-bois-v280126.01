import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber, mapDocumentType } from "@/lib/crm/generate-document-number";
import { auditDocumentIssuance } from "@/lib/crm/audit";
import { auth } from "@/lib/auth";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════
// P0-3: Document Numbering Hardening - Issue Endpoint
// ═══════════════════════════════════════════════════════════
// Flow:
// 1. Document created as DRAFT with temporary number (DRAFT-xxx)
// 2. User edits draft as needed
// 3. When ready, call /issue to:
//    - Assign official sequential number
//    - Lock document (no more edits)
//    - Generate and archive PDF
//    - Create audit trail
// ═══════════════════════════════════════════════════════════

const issueDocumentSchema = z.object({
  generatePdf: z.boolean().default(true),
  sendEmail: z.boolean().default(false),
  recipientEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/issue
// Issue a draft document with official number
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Get current user (FIX 2 - Track who issued the document)
    const session = await auth();
    const userId = session?.user?.email ? await getUserIdByEmail(session.user.email) : undefined;

    // Validate input
    const validation = issueDocumentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get document
    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    // Check if already issued
    if (document.isLocked) {
      return apiError("Ce document a déjà été émis et ne peut pas être modifié", 400);
    }

    if (!document.isDraft) {
      return apiError("Ce document a déjà un numéro officiel", 400);
    }

    // Validate document has required fields for issuance
    if (document.items.length === 0) {
      return apiError("Le document doit avoir au moins une ligne d'article", 400);
    }

    if (!document.clientId) {
      return apiError("Le document doit avoir un client", 400);
    }

    // Generate official document number using thread-safe atomic operation
    const docType = mapDocumentType(document.type);
    const officialNumber = await generateOfficialNumber(docType, document.type);

    // Store the old draft number for reference
    const draftNumber = document.number;

    // Calculate document hash for integrity
    const documentContent = JSON.stringify({
      type: document.type,
      clientId: document.clientId,
      items: document.items.map((item) => ({
        designation: item.designation,
        quantity: String(item.quantity),
        unitPriceHT: String(item.unitPriceHT),
        tvaRate: String(item.tvaRate),
      })),
      totalTTC: String(document.totalTTC),
    });
    const contentHash = crypto
      .createHash("sha256")
      .update(documentContent)
      .digest("hex");

    // Update document with official number and lock it (FIX 2 - Include issuedById)
    const issuedDocument = await prisma.$transaction(async (tx) => {
      // Update the document
      const updated = await tx.cRMDocument.update({
        where: { id },
        data: {
          number: officialNumber,
          draftNumber: draftNumber, // Keep reference to old draft number
          isDraft: false,
          isLocked: true,
          issuedAt: new Date(),
          issuedById: userId, // FIX 2: Track who issued the document
          archivedPdfHash: contentHash,
          // Update status based on document type
          status: getIssuedStatus(document.type, document.status),
        },
        include: {
          client: {
            select: { id: true, fullName: true, clientNumber: true },
          },
          items: {
            orderBy: { order: "asc" },
          },
        },
      });

      return updated;
    });

    // Create audit log for issuance (critical event)
    await auditDocumentIssuance(
      issuedDocument.id,
      issuedDocument.number,
      issuedDocument.type,
      Number(issuedDocument.totalTTC),
      undefined, // PDF URL would be set after generation
    );

    // TODO: Generate PDF and archive it (would be handled by PDF generation service)
    // const pdfUrl = await generateAndArchivePdf(issuedDocument);

    return apiSuccess({
      ...issuedDocument,
      totalHT: Number(issuedDocument.totalHT),
      netHT: Number(issuedDocument.netHT),
      totalTVA: Number(issuedDocument.totalTVA),
      totalTTC: Number(issuedDocument.totalTTC),
      issuance: {
        previousNumber: draftNumber,
        officialNumber: officialNumber,
        issuedAt: issuedDocument.issuedAt,
        contentHash: contentHash,
        isLocked: true,
      },
    });
  } catch (error) {
    return handleApiError(error, "Document Issue POST");
  }
}

// ═══════════════════════════════════════════════════════════
// Helper: Generate Official Number with Thread Safety
// ═══════════════════════════════════════════════════════════

async function generateOfficialNumber(
  docType: string,
  originalType: string
): Promise<string> {
  // Use the existing generateB2BNumber which uses transactions
  // This ensures atomic incrementing of sequence numbers
  const type = docType as import("@/lib/crm/generate-document-number").CRMDocType;
  return generateB2BNumber(type);
}

// ═══════════════════════════════════════════════════════════
// Helper: Get Issued Status Based on Document Type
// ═══════════════════════════════════════════════════════════

function getIssuedStatus(
  type: string,
  currentStatus: string
): "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED" {
  // If status is already set beyond DRAFT, keep it
  if (currentStatus !== "DRAFT") {
    return currentStatus as "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED";
  }

  // Default issued status based on document type
  switch (type) {
    case "DEVIS":
      return "SENT";
    case "BON_COMMANDE":
      return "CONFIRMED";
    case "BON_LIVRAISON":
      return "DELIVERED";
    case "PV_RECEPTION":
      return "SIGNED";
    case "FACTURE":
    case "FACTURE_ACOMPTE":
      return "SENT";
    case "AVOIR":
      return "SENT";
    default:
      return "SENT";
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id]/issue
// Check issuance status of a document
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Helper: Get User ID by Email (FIX 2)
// ═══════════════════════════════════════════════════════════

async function getUserIdByEmail(email: string): Promise<string | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      select: {
        id: true,
        number: true,
        draftNumber: true,
        type: true,
        status: true,
        isDraft: true,
        isLocked: true,
        issuedAt: true,
        issuedById: true, // FIX 2: Include issuedById
        archivedPdfUrl: true,
        archivedPdfHash: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    return apiSuccess({
      id: document.id,
      currentNumber: document.number,
      draftNumber: document.draftNumber,
      type: document.type,
      status: document.status,
      issuanceStatus: {
        isDraft: document.isDraft,
        isIssued: !document.isDraft,
        isLocked: document.isLocked,
        issuedAt: document.issuedAt,
        issuedById: document.issuedById, // FIX 2: Include issuedById
        canEdit: document.isDraft && !document.isLocked,
        canIssue: document.isDraft && !document.isLocked,
      },
      archive: {
        hasArchivedPdf: !!document.archivedPdfUrl,
        pdfUrl: document.archivedPdfUrl,
        contentHash: document.archivedPdfHash,
        archivedAt: document.archivedAt,
      },
      timestamps: {
        created: document.createdAt,
        updated: document.updatedAt,
        issued: document.issuedAt,
      },
    });
  } catch (error) {
    return handleApiError(error, "Document Issue GET");
  }
}
