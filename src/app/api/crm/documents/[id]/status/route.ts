import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// Valid Status Transitions
// ═══════════════════════════════════════════════════════════

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["CONFIRMED", "SENT", "CANCELLED"],
  CONFIRMED: ["SENT", "DELIVERED", "PARTIAL", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "DELIVERED", "SIGNED", "PARTIAL", "PAID", "CANCELLED"],
  VIEWED: ["ACCEPTED", "REJECTED", "PAID", "PARTIAL", "CANCELLED"],
  ACCEPTED: ["CONFIRMED", "CANCELLED"], // Devis accepted → can create BC
  REJECTED: [], // Terminal state
  PARTIAL: ["DELIVERED", "PAID", "CANCELLED"], // Partial delivery/payment
  DELIVERED: ["SIGNED", "CANCELLED"], // BL delivered
  SIGNED: [], // Terminal state (PV signed)
  PAID: [], // Terminal state
  OVERDUE: ["PAID", "PARTIAL", "CANCELLED"],
  CANCELLED: [], // Terminal state
};

// ═══════════════════════════════════════════════════════════
// Document Type Prefixes
// ═══════════════════════════════════════════════════════════

function getDocTypePrefix(type: string): string {
  const prefixes: Record<string, string> = {
    FACTURE: "FA",
    FACTURE_ACOMPTE: "FA-AC",
    DEVIS: "DV",
    BON_COMMANDE: "BC",
    BON_LIVRAISON: "BL",
    PV_RECEPTION: "PV",
    AVOIR: "AV",
  };
  return prefixes[type] || "DOC";
}

// ═══════════════════════════════════════════════════════════
// Generate Sequential Document Number
// ═══════════════════════════════════════════════════════════

async function generateSequentialNumber(type: string): Promise<string> {
  const prefix = getDocTypePrefix(type);
  const year = new Date().getFullYear();

  // Count existing documents of this type with official numbers (not drafts)
  const count = await prisma.cRMDocument.count({
    where: {
      type: type as any,
      NOT: { number: { startsWith: "DRAFT-" } },
      number: { startsWith: `${prefix}-${year}` },
    },
  });

  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/documents/[id]/status - Update document status
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return apiError("Status requis", 400);
    }

    // Get current document
    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        items: true,
        client: true,
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    // Check valid transition
    const currentStatus = document.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(status)) {
      return apiError(
        `Transition invalide : ${currentStatus} → ${status}. Transitions possibles : ${allowed.join(", ") || "aucune"}`,
        400
      );
    }

    // Validate before confirming
    if (status === "CONFIRMED") {
      const errors: string[] = [];

      if (!document.clientId) {
        errors.push("Client requis");
      }
      if (!document.items || document.items.length === 0) {
        errors.push("Au moins un article requis");
      }
      if (!document.date) {
        errors.push("Date requise");
      }

      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation échouée",
            details: errors,
          },
          { status: 422 }
        );
      }
    }

    // Validate cancellation reason
    if (status === "CANCELLED" && currentStatus !== "DRAFT") {
      if (!reason || reason.trim() === "") {
        return apiError("Motif d'annulation requis", 400);
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on transition
    if (status === "CONFIRMED") {
      updateData.confirmedAt = new Date();

      // Generate sequential number if document has draft number
      if (document.number?.startsWith("DRAFT-")) {
        const officialNumber = await generateSequentialNumber(document.type);
        updateData.number = officialNumber;
        updateData.isDraft = false;
        updateData.isLocked = true;
        updateData.issuedAt = new Date();
      }
    }

    if (status === "SENT") {
      updateData.sentAt = new Date();
    }

    if (status === "PAID") {
      updateData.paidAt = new Date();
      // Update balance to 0
      updateData.balance = 0;
    }

    if (status === "CANCELLED") {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = reason || null;
    }

    // Update document
    const updated = await prisma.cRMDocument.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        project: true,
        items: {
          include: {
            catalogItem: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Transform numeric fields
    const transformed = {
      ...updated,
      totalHT: Number(updated.totalHT),
      discountValue: updated.discountValue ? Number(updated.discountValue) : null,
      discountAmount: Number(updated.discountAmount),
      netHT: Number(updated.netHT),
      totalTVA: Number(updated.totalTVA),
      totalTTC: Number(updated.totalTTC),
      depositPercent: updated.depositPercent ? Number(updated.depositPercent) : null,
      depositAmount: updated.depositAmount ? Number(updated.depositAmount) : null,
      paidAmount: Number(updated.paidAmount),
      balance: Number(updated.balance),
      items: updated.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPriceHT: Number(item.unitPriceHT),
        discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
        discountAmount: Number(item.discountAmount),
        tvaRate: Number(item.tvaRate),
        totalHT: Number(item.totalHT),
        totalTVA: Number(item.totalTVA),
        totalTTC: Number(item.totalTTC),
      })),
    };

    return apiSuccess(transformed);
  } catch (error) {
    return handleApiError(error, "Status update");
  }
}
