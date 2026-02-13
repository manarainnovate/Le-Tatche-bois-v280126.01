import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const documentItemSchema = z.object({
  id: z.string().optional(), // For existing items
  catalogItemId: z.string().optional(),
  reference: z.string().optional(),
  designation: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().default("pcs"),
  unitPriceHT: z.number().min(0),
  discountPercent: z.number().min(0).max(100).optional(),
  tvaRate: z.number().default(20),
});

const updateDocumentSchema = z.object({
  status: z.enum([
    "DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED",
    "CONFIRMED", "PARTIAL", "DELIVERED", "SIGNED",
    "PAID", "OVERDUE", "CANCELLED"
  ]).optional(),
  // Accept both simple date strings (YYYY-MM-DD) and ISO datetime strings
  validUntil: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryNotes: z.string().optional(),
  items: z.array(documentItemSchema).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional().nullable(),
  discountValue: z.number().optional().nullable(),
  depositPercent: z.number().min(0).max(100).optional().nullable(),
  deliveryTime: z.string().optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  conditions: z.string().optional(),
  paymentTerms: z.string().optional(),
  internalNotes: z.string().optional(),
  publicNotes: z.string().optional(),
  footerText: z.string().optional(),
  // PV specific
  workDescription: z.string().optional(),
  hasReserves: z.boolean().optional(),
  reserves: z.string().optional(),
  reserveDeadline: z.string().optional().nullable(),
  // Avoir specific
  avoirReason: z.string().optional(),
  // Reception specific
  receivedBy: z.string().optional(),
  receivedAt: z.string().optional().nullable(),
  // Signature
  signatureUrl: z.string().optional(),
  signedBy: z.string().optional(),
  signedAt: z.string().optional().nullable(),
});

// ═══════════════════════════════════════════════════════════
// Helper: Recalculate Totals
// ═══════════════════════════════════════════════════════════

function recalculateTotals(
  items: { quantity: number; unitPriceHT: number; discountPercent?: number; tvaRate: number }[],
  discountType?: string | null,
  discountValue?: number | null,
  depositPercent?: number | null
) {
  // Calculate line totals
  const lineResults = items.map((item) => {
    const lineTotal = item.quantity * item.unitPriceHT;
    const lineDiscount = item.discountPercent
      ? lineTotal * (item.discountPercent / 100)
      : 0;
    const lineNetHT = lineTotal - lineDiscount;
    const lineTVA = lineNetHT * (item.tvaRate / 100);
    return {
      ...item,
      discountAmount: lineDiscount,
      totalHT: lineNetHT,
      totalTVA: lineTVA,
      totalTTC: lineNetHT + lineTVA,
    };
  });

  const totalHT = lineResults.reduce((sum, item) => sum + item.totalHT, 0);

  // Global discount
  let discountAmount = 0;
  if (discountType && discountValue) {
    discountAmount =
      discountType === "percentage"
        ? totalHT * (discountValue / 100)
        : discountValue;
  }

  const netHT = totalHT - discountAmount;

  // TVA by rate
  const tvaByRate = new Map<number, { base: number; amount: number }>();
  lineResults.forEach((item) => {
    const proportion = totalHT > 0 ? item.totalHT / totalHT : 0;
    const existing = tvaByRate.get(item.tvaRate) || { base: 0, amount: 0 };
    tvaByRate.set(item.tvaRate, {
      base: existing.base + (netHT * proportion),
      amount: existing.amount + (netHT * proportion * item.tvaRate / 100),
    });
  });

  const tvaDetails = Array.from(tvaByRate.entries()).map(([rate, data]) => ({
    rate,
    base: Math.round(data.base * 100) / 100,
    amount: Math.round(data.amount * 100) / 100,
  }));

  const totalTVA = tvaDetails.reduce((sum, tva) => sum + tva.amount, 0);
  const totalTTC = netHT + totalTVA;

  const depositAmount = depositPercent
    ? totalTTC * (depositPercent / 100)
    : null;

  return {
    lineResults,
    totalHT: Math.round(totalHT * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    netHT: Math.round(netHT * 100) / 100,
    tvaDetails,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
    depositAmount: depositAmount ? Math.round(depositAmount * 100) / 100 : null,
  };
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id] - Get document details
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            clientNumber: true,
            email: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
        items: {
          include: {
            catalogItem: {
              select: { id: true, sku: true, name: true },
            },
          },
          orderBy: { order: "asc" },
        },
        parent: {
          select: { id: true, type: true, number: true },
        },
        children: {
          select: { id: true, type: true, number: true, status: true },
        },
        payments: {
          select: {
            id: true,
            paymentNumber: true,
            amount: true,
            method: true,
            date: true,
            reference: true,
          },
          orderBy: { date: "desc" },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    // Transform numeric values
    const transformed = {
      ...document,
      totalHT: Number(document.totalHT),
      discountValue: document.discountValue ? Number(document.discountValue) : null,
      discountAmount: Number(document.discountAmount),
      netHT: Number(document.netHT),
      totalTVA: Number(document.totalTVA),
      totalTTC: Number(document.totalTTC),
      depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
      depositAmount: document.depositAmount ? Number(document.depositAmount) : null,
      paidAmount: Number(document.paidAmount),
      balance: Number(document.balance),
      items: document.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPriceHT: Number(item.unitPriceHT),
        discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
        discountAmount: Number(item.discountAmount),
        tvaRate: Number(item.tvaRate),
        totalHT: Number(item.totalHT),
        totalTVA: Number(item.totalTVA),
        totalTTC: Number(item.totalTTC),
        orderedQty: item.orderedQty ? Number(item.orderedQty) : null,
        deliveredQty: item.deliveredQty ? Number(item.deliveredQty) : null,
      })),
      payments: document.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };

    return apiSuccess(transformed);
  } catch (error) {
    return handleApiError(error, "Document GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/crm/documents/[id] - Update document
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateDocumentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if document exists and is editable
    const existing = await prisma.cRMDocument.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return apiError("Document non trouvé", 404);
    }

    // FIX 2: Check if document is locked (issued)
    if (existing.isLocked) {
      return apiError("Ce document a été émis et ne peut plus être modifié", 400);
    }

    // FIX 2: Check if document is no longer a draft
    if (!existing.isDraft && data.status !== "CANCELLED") {
      return apiError("Ce document a un numéro officiel et ne peut plus être modifié", 400);
    }

    // Check if document can be edited based on status
    const nonEditableStatuses = ["PAID", "SIGNED", "CANCELLED"];
    if (nonEditableStatuses.includes(existing.status) && data.status !== "CANCELLED") {
      return apiError("Ce document ne peut plus être modifié", 400);
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Status update
    if (data.status) {
      updateData.status = data.status;
    }

    // Dates
    if (data.validUntil !== undefined) {
      updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.deliveryDate !== undefined) {
      updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
    }

    // Delivery info
    if (data.deliveryAddress !== undefined) updateData.deliveryAddress = data.deliveryAddress;
    if (data.deliveryCity !== undefined) updateData.deliveryCity = data.deliveryCity;
    if (data.deliveryNotes !== undefined) updateData.deliveryNotes = data.deliveryNotes;

    // Conditions
    if (data.deliveryTime !== undefined) updateData.deliveryTime = data.deliveryTime;
    if (data.includes !== undefined) updateData.includes = data.includes;
    if (data.excludes !== undefined) updateData.excludes = data.excludes;
    if (data.conditions !== undefined) updateData.conditions = data.conditions;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;

    // Notes
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.publicNotes !== undefined) updateData.publicNotes = data.publicNotes;
    if (data.footerText !== undefined) updateData.footerText = data.footerText;

    // PV specific
    if (data.workDescription !== undefined) updateData.workDescription = data.workDescription;
    if (data.hasReserves !== undefined) updateData.hasReserves = data.hasReserves;
    if (data.reserves !== undefined) updateData.reserves = data.reserves;
    if (data.reserveDeadline !== undefined) {
      updateData.reserveDeadline = data.reserveDeadline ? new Date(data.reserveDeadline) : null;
    }

    // Avoir specific
    if (data.avoirReason !== undefined) updateData.avoirReason = data.avoirReason;

    // Reception
    if (data.receivedBy !== undefined) updateData.receivedBy = data.receivedBy;
    if (data.receivedAt !== undefined) {
      updateData.receivedAt = data.receivedAt ? new Date(data.receivedAt) : null;
    }

    // Signature
    if (data.signatureUrl !== undefined) updateData.signatureUrl = data.signatureUrl;
    if (data.signedBy !== undefined) updateData.signedBy = data.signedBy;
    if (data.signedAt !== undefined) {
      updateData.signedAt = data.signedAt ? new Date(data.signedAt) : null;
    }

    // Handle items update if provided
    if (data.items) {
      // Recalculate totals
      const calculated = recalculateTotals(
        data.items,
        data.discountType ?? existing.discountType,
        data.discountValue ?? (existing.discountValue ? Number(existing.discountValue) : null),
        data.depositPercent ?? (existing.depositPercent ? Number(existing.depositPercent) : null)
      );

      // Update discount values
      if (data.discountType !== undefined) updateData.discountType = data.discountType;
      if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
      if (data.depositPercent !== undefined) updateData.depositPercent = data.depositPercent;

      // Update totals
      updateData.totalHT = calculated.totalHT;
      updateData.discountAmount = calculated.discountAmount;
      updateData.netHT = calculated.netHT;
      updateData.tvaDetails = calculated.tvaDetails;
      updateData.totalTVA = calculated.totalTVA;
      updateData.totalTTC = calculated.totalTTC;
      updateData.depositAmount = calculated.depositAmount;
      updateData.balance = calculated.totalTTC - Number(existing.paidAmount);

      // Delete existing items and create new ones
      await prisma.cRMDocumentItem.deleteMany({
        where: { documentId: id },
      });

      // Create new items
      await prisma.cRMDocumentItem.createMany({
        data: data.items.map((item, index) => ({
          documentId: id,
          catalogItemId: item.catalogItemId || null,
          reference: item.reference || null,
          designation: item.designation,
          description: item.description || null,
          quantity: item.quantity,
          unit: item.unit,
          unitPriceHT: item.unitPriceHT,
          discountPercent: item.discountPercent || 0,
          discountAmount: calculated.lineResults[index]?.discountAmount || 0,
          tvaRate: item.tvaRate,
          totalHT: calculated.lineResults[index]?.totalHT || 0,
          totalTVA: calculated.lineResults[index]?.totalTVA || 0,
          totalTTC: calculated.lineResults[index]?.totalTTC || 0,
          order: index,
        })),
      });
    }

    // Update document
    const document = await prisma.cRMDocument.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: { id: true, fullName: true, clientNumber: true },
        },
        project: {
          select: { id: true, name: true, projectNumber: true },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return apiSuccess({
      ...document,
      totalHT: Number(document.totalHT),
      netHT: Number(document.netHT),
      totalTVA: Number(document.totalTVA),
      totalTTC: Number(document.totalTTC),
    });
  } catch (error) {
    return handleApiError(error, "Document PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/crm/documents/[id] - Delete document
// ═══════════════════════════════════════════════════════════

export async function DELETE(
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
        status: true,
        isLocked: true, // FIX 2
        isDraft: true,  // FIX 2
        children: true,
        payments: true,
      },
    });

    if (!document) {
      return apiError("Document non trouvé", 404);
    }

    // FIX 2: Check if document is locked (issued)
    if (document.isLocked) {
      return apiError("Ce document a été émis et ne peut pas être supprimé", 400);
    }

    // FIX 2: Check if document has been issued (has official number)
    if (!document.isDraft) {
      return apiError("Ce document a un numéro officiel et ne peut pas être supprimé", 400);
    }

    // Check if document can be deleted
    if (document.status !== "DRAFT") {
      return apiError("Seuls les brouillons peuvent être supprimés", 400);
    }

    if (document.children.length > 0) {
      return apiError("Ce document a des documents liés", 400);
    }

    if (document.payments.length > 0) {
      return apiError("Ce document a des paiements enregistrés", 400);
    }

    // Delete document (items will cascade)
    await prisma.cRMDocument.delete({
      where: { id },
    });

    return apiSuccess({ message: "Document supprimé" });
  } catch (error) {
    return handleApiError(error, "Document DELETE");
  }
}
