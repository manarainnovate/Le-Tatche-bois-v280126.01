import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const convertSchema = z.object({
  targetType: z.enum(["BON_COMMANDE", "BON_LIVRAISON", "PV_RECEPTION", "FACTURE", "AVOIR"]),
  // For partial conversion (e.g., partial delivery)
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().positive(),
  })).optional(),
  // Additional fields for conversion
  deliveryDate: z.string().datetime().optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryNotes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  // Avoir specific
  avoirReason: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// Helper: Validate Conversion Path
// ═══════════════════════════════════════════════════════════

const allowedConversions: Record<string, string[]> = {
  DEVIS: ["BON_COMMANDE"],
  BON_COMMANDE: ["BON_LIVRAISON", "FACTURE"],
  BON_LIVRAISON: ["PV_RECEPTION", "FACTURE"],
  PV_RECEPTION: ["FACTURE"],
  FACTURE: ["AVOIR"],
};

// ═══════════════════════════════════════════════════════════
// Helper: Generate Document Number
// ═══════════════════════════════════════════════════════════

const documentPrefixes: Record<string, string> = {
  DEVIS: "D",
  BON_COMMANDE: "BC",
  BON_LIVRAISON: "BL",
  PV_RECEPTION: "PV",
  FACTURE: "F",
  AVOIR: "A",
};

async function generateDocumentNumber(type: string): Promise<string> {
  const prefix = documentPrefixes[type] || "DOC";
  const year = new Date().getFullYear();

  const sequence = await prisma.documentSequence.upsert({
    where: {
      type_year: { type, year },
    },
    create: {
      type,
      prefix,
      year,
      lastNumber: 1,
    },
    update: {
      lastNumber: { increment: 1 },
    },
  });

  return `${prefix}-${year}-${String(sequence.lastNumber).padStart(6, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/convert - Convert document
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = convertSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get source document with items
    const source = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!source) {
      return apiError("Document non trouvé", 404);
    }

    // Validate conversion path
    const allowed = allowedConversions[source.type];
    if (!allowed || !allowed.includes(data.targetType)) {
      return apiError(
        `Impossible de convertir ${source.type} en ${data.targetType}`,
        400
      );
    }

    // Check source status for conversion
    const requiredStatuses: Record<string, string[]> = {
      DEVIS: ["ACCEPTED"],
      BON_COMMANDE: ["CONFIRMED", "PARTIAL"],
      BON_LIVRAISON: ["DELIVERED", "PARTIAL"],
      PV_RECEPTION: ["SIGNED"],
      FACTURE: ["PAID", "PARTIAL", "OVERDUE"],
    };

    const required = requiredStatuses[source.type];
    if (required && !required.includes(source.status)) {
      return apiError(
        `Le document doit être ${required.join(" ou ")} pour être converti`,
        400
      );
    }

    // Determine items to include (we'll process quantities during lineResults calculation)
    let itemsToConvert = source.items;
    let quantityOverrides: Map<string, number> | null = null;
    if (data.items) {
      quantityOverrides = new Map(data.items.map((i) => [i.itemId, i.quantity]));
      itemsToConvert = source.items.filter((item) => quantityOverrides!.has(item.id));
    }

    // Generate new document number
    const number = await generateDocumentNumber(data.targetType);

    // Build reference fields
    const refs: Record<string, string | null | undefined> = {};
    switch (source.type) {
      case "DEVIS":
        refs.devisRef = source.number;
        break;
      case "BON_COMMANDE":
        refs.devisRef = source.devisRef;
        refs.bcRef = source.number;
        break;
      case "BON_LIVRAISON":
        refs.devisRef = source.devisRef;
        refs.bcRef = source.bcRef;
        refs.blRef = source.number;
        break;
      case "PV_RECEPTION":
        refs.devisRef = source.devisRef;
        refs.bcRef = source.bcRef;
        refs.blRef = source.blRef;
        refs.pvRef = source.number;
        break;
      case "FACTURE":
        refs.factureRef = source.number;
        break;
    }

    // Recalculate totals for new items
    const lineResults = itemsToConvert.map((item) => {
      // Use quantity override if provided, otherwise use original
      const quantity = quantityOverrides?.get(item.id) ?? Number(item.quantity);
      const unitPriceHT = Number(item.unitPriceHT);
      const discountPercent = item.discountPercent ? Number(item.discountPercent) : 0;
      const tvaRate = Number(item.tvaRate);

      const lineTotal = quantity * unitPriceHT;
      const lineDiscount = lineTotal * (discountPercent / 100);
      const lineNetHT = lineTotal - lineDiscount;
      const lineTVA = lineNetHT * (tvaRate / 100);

      return {
        ...item,
        quantity,
        unitPriceHT,
        discountPercent,
        discountAmount: lineDiscount,
        tvaRate,
        totalHT: lineNetHT,
        totalTVA: lineTVA,
        totalTTC: lineNetHT + lineTVA,
      };
    });

    const totalHT = lineResults.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTVA = lineResults.reduce((sum, item) => sum + item.totalTVA, 0);
    const totalTTC = totalHT + totalTVA;

    // Create new document
    const newDocument = await prisma.cRMDocument.create({
      data: {
        type: data.targetType,
        number,
        parentId: source.id,
        ...refs,
        clientId: source.clientId,
        projectId: source.projectId,
        date: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : source.dueDate,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : source.deliveryDate,
        // Client snapshot
        clientName: source.clientName,
        clientAddress: source.clientAddress,
        clientCity: source.clientCity,
        clientIce: source.clientIce,
        clientPhone: source.clientPhone,
        clientEmail: source.clientEmail,
        // Delivery
        deliveryAddress: data.deliveryAddress || source.deliveryAddress,
        deliveryCity: data.deliveryCity || source.deliveryCity,
        deliveryNotes: data.deliveryNotes || source.deliveryNotes,
        // Totals
        totalHT,
        discountType: source.discountType,
        discountValue: source.discountValue,
        discountAmount: 0, // Applied at line level for conversions
        netHT: totalHT,
        tvaDetails: [], // Will be calculated
        totalTVA,
        totalTTC,
        balance: totalTTC,
        // Carry over conditions
        deliveryTime: source.deliveryTime,
        includes: source.includes,
        excludes: source.excludes,
        conditions: source.conditions,
        paymentTerms: source.paymentTerms,
        // Avoir specific
        avoirReason: data.avoirReason,
        // Items
        items: {
          create: lineResults.map((item, index) => ({
            catalogItemId: item.catalogItemId,
            reference: item.reference,
            designation: item.designation,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPriceHT: item.unitPriceHT,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            tvaRate: item.tvaRate,
            totalHT: item.totalHT,
            totalTVA: item.totalTVA,
            totalTTC: item.totalTTC,
            // For BL - track ordered vs delivered
            orderedQty: data.targetType === "BON_LIVRAISON" ? Number(item.quantity) : null,
            deliveredQty: data.targetType === "BON_LIVRAISON" ? item.quantity : null,
            order: index,
          })),
        },
      },
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

    // Update source document status if fully converted
    if (!data.items) {
      // Full conversion - update status
      type DocumentStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "SIGNED" | "PAID" | "OVERDUE" | "CANCELLED";
      let newStatus: DocumentStatus | null = null;
      switch (source.type) {
        case "DEVIS":
          // Already ACCEPTED, no status change needed
          break;
        case "BON_COMMANDE":
          newStatus = data.targetType === "BON_LIVRAISON" ? "DELIVERED" : null;
          break;
        case "BON_LIVRAISON":
          newStatus = "DELIVERED";
          break;
      }

      if (newStatus) {
        await prisma.cRMDocument.update({
          where: { id: source.id },
          data: { status: newStatus },
        });
      }
    } else {
      // Partial conversion - mark as partial
      await prisma.cRMDocument.update({
        where: { id: source.id },
        data: { status: "PARTIAL" },
      });
    }

    return apiSuccess(
      {
        ...newDocument,
        totalHT: Number(newDocument.totalHT),
        netHT: Number(newDocument.netHT),
        totalTVA: Number(newDocument.totalTVA),
        totalTTC: Number(newDocument.totalTTC),
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Document Convert POST");
  }
}
