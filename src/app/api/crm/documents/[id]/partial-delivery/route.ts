import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";
import { createAuditLog } from "@/lib/crm/audit";

// ═══════════════════════════════════════════════════════════
// P0-2: Partial Delivery (Multi-BL per BC)
// ═══════════════════════════════════════════════════════════
// Flow: BC → Multiple BL (partial deliveries) until fully delivered
// Tracks: orderedQty, deliveredQty, totalDeliveredQty, remainingQty
// ═══════════════════════════════════════════════════════════

const partialDeliveryItemSchema = z.object({
  bcItemId: z.string().min(1),
  deliverQty: z.number().positive(),
});

const partialDeliverySchema = z.object({
  items: z.array(partialDeliveryItemSchema).min(1),
  deliveryDate: z.string().datetime().optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryNotes: z.string().optional(),
  receivedBy: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents/[id]/partial-delivery
// Create a partial delivery (BL) from a BC
// ═══════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = partialDeliverySchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get source BC with all items and existing deliveries
    const bc = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          orderBy: { order: "asc" },
          include: {
            deliveries: {
              include: {
                document: {
                  select: {
                    id: true,
                    number: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        children: {
          where: { type: "BON_LIVRAISON" },
          select: { id: true, number: true, status: true },
        },
      },
    });

    if (!bc) {
      return apiError("Bon de commande non trouvé", 404);
    }

    // Validate it's a BC
    if (bc.type !== "BON_COMMANDE") {
      return apiError("La livraison partielle ne peut être créée qu'à partir d'un bon de commande", 400);
    }

    // Validate BC status
    if (!["CONFIRMED", "PARTIAL"].includes(bc.status)) {
      return apiError("Le bon de commande doit être confirmé pour créer une livraison", 400);
    }

    // Build a map of BC items with their current delivery status
    const bcItemsMap = new Map(
      bc.items.map((item) => {
        const orderedQty = Number(item.quantity);
        const totalDelivered = item.deliveries.reduce(
          (sum, delivery) => sum + Number(delivery.deliveredQty || 0),
          0
        );
        const remainingQty = orderedQty - totalDelivered;

        return [
          item.id,
          {
            item,
            orderedQty,
            totalDelivered,
            remainingQty,
          },
        ];
      })
    );

    // Validate requested delivery quantities
    const itemsToDeliver: {
      bcItem: typeof bc.items[0];
      deliverQty: number;
      orderedQty: number;
      previouslyDelivered: number;
      newTotalDelivered: number;
      remainingAfter: number;
    }[] = [];

    for (const requestedItem of data.items) {
      const bcItemData = bcItemsMap.get(requestedItem.bcItemId);

      if (!bcItemData) {
        return apiError(`Article BC non trouvé: ${requestedItem.bcItemId}`, 400);
      }

      if (requestedItem.deliverQty > bcItemData.remainingQty) {
        return apiError(
          `Quantité à livrer (${requestedItem.deliverQty}) dépasse la quantité restante (${bcItemData.remainingQty}) pour l'article: ${bcItemData.item.designation}`,
          400
        );
      }

      itemsToDeliver.push({
        bcItem: bcItemData.item,
        deliverQty: requestedItem.deliverQty,
        orderedQty: bcItemData.orderedQty,
        previouslyDelivered: bcItemData.totalDelivered,
        newTotalDelivered: bcItemData.totalDelivered + requestedItem.deliverQty,
        remainingAfter: bcItemData.remainingQty - requestedItem.deliverQty,
      });
    }

    // Calculate totals for this delivery
    const deliveryItems = itemsToDeliver.map((item, index) => {
      const unitPriceHT = Number(item.bcItem.unitPriceHT);
      const discountPercent = item.bcItem.discountPercent ? Number(item.bcItem.discountPercent) : 0;
      const tvaRate = Number(item.bcItem.tvaRate);

      const lineTotal = item.deliverQty * unitPriceHT;
      const lineDiscount = lineTotal * (discountPercent / 100);
      const lineNetHT = lineTotal - lineDiscount;
      const lineTVA = lineNetHT * (tvaRate / 100);
      const lineTTC = lineNetHT + lineTVA;

      return {
        sourceBCItemId: item.bcItem.id,
        catalogItemId: item.bcItem.catalogItemId,
        reference: item.bcItem.reference,
        designation: item.bcItem.designation,
        description: item.bcItem.description,
        quantity: item.deliverQty,
        unit: item.bcItem.unit,
        unitPriceHT,
        discountPercent,
        discountAmount: Math.round(lineDiscount * 100) / 100,
        tvaRate,
        totalHT: Math.round(lineNetHT * 100) / 100,
        totalTVA: Math.round(lineTVA * 100) / 100,
        totalTTC: Math.round(lineTTC * 100) / 100,
        // Delivery tracking
        orderedQty: item.orderedQty,
        deliveredQty: item.deliverQty,
        totalDeliveredQty: item.newTotalDelivered,
        remainingQty: item.remainingAfter,
        order: index,
      };
    });

    const totalHT = deliveryItems.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTVA = deliveryItems.reduce((sum, item) => sum + item.totalTVA, 0);
    const totalTTC = totalHT + totalTVA;

    // Calculate VAT breakdown
    const tvaByRate = new Map<number, { base: number; amount: number }>();
    deliveryItems.forEach((item) => {
      const existing = tvaByRate.get(item.tvaRate) || { base: 0, amount: 0 };
      tvaByRate.set(item.tvaRate, {
        base: existing.base + item.totalHT,
        amount: existing.amount + item.totalTVA,
      });
    });

    const tvaDetails = Array.from(tvaByRate.entries()).map(([rate, data]) => ({
      rate,
      base: Math.round(data.base * 100) / 100,
      amount: Math.round(data.amount * 100) / 100,
    }));

    // Check if this delivery completes the BC
    const allItemsFullyDelivered = Array.from(bcItemsMap.values()).every((bcItemData) => {
      const requestedDelivery = itemsToDeliver.find(
        (d) => d.bcItem.id === bcItemData.item.id
      );
      if (requestedDelivery) {
        return requestedDelivery.remainingAfter === 0;
      }
      return bcItemData.remainingQty === 0;
    });

    // Generate BL number
    const blNumber = await generateB2BNumber("BL");

    // Create BL document
    const bl = await prisma.cRMDocument.create({
      data: {
        type: "BON_LIVRAISON",
        number: blNumber,
        parentId: bc.id,
        clientId: bc.clientId,
        projectId: bc.projectId,
        devisRef: bc.devisRef,
        bcRef: bc.number,
        date: new Date(),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : new Date(),
        status: "DELIVERED",
        // Client snapshot
        clientName: bc.clientName,
        clientAddress: bc.clientAddress,
        clientCity: bc.clientCity,
        clientIce: bc.clientIce,
        clientPhone: bc.clientPhone,
        clientEmail: bc.clientEmail,
        // Delivery address
        deliveryAddress: data.deliveryAddress || bc.deliveryAddress,
        deliveryCity: data.deliveryCity || bc.deliveryCity,
        deliveryNotes: data.deliveryNotes || bc.deliveryNotes,
        // Receiver
        receivedBy: data.receivedBy,
        receivedAt: new Date(),
        // Totals
        totalHT: Math.round(totalHT * 100) / 100,
        discountAmount: 0,
        netHT: Math.round(totalHT * 100) / 100,
        tvaDetails,
        totalTVA: Math.round(totalTVA * 100) / 100,
        totalTTC: Math.round(totalTTC * 100) / 100,
        balance: Math.round(totalTTC * 100) / 100,
        // Terms
        conditions: bc.conditions,
        // Items
        items: {
          create: deliveryItems.map((item) => ({
            sourceBCItemId: item.sourceBCItemId,
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
            orderedQty: item.orderedQty,
            deliveredQty: item.deliveredQty,
            totalDeliveredQty: item.totalDeliveredQty,
            remainingQty: item.remainingQty,
            order: item.order,
          })),
        },
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

    // Update BC status
    const newBCStatus = allItemsFullyDelivered ? "DELIVERED" : "PARTIAL";
    await prisma.cRMDocument.update({
      where: { id: bc.id },
      data: { status: newBCStatus },
    });

    // Create delivery log
    await prisma.bCDeliveryLog.create({
      data: {
        bcId: bc.id,
        bcNumber: bc.number,
        blId: bl.id,
        blNumber: bl.number,
        deliveryDate: new Date(),
        itemCount: deliveryItems.length,
        isPartial: !allItemsFullyDelivered,
        isFinal: allItemsFullyDelivered,
        deliveredValue: totalTTC,
        notes: data.deliveryNotes,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "create",
      entity: "CRMDocument",
      entityId: bl.id,
      description: `Bon de livraison ${allItemsFullyDelivered ? "final" : "partiel"} créé depuis BC ${bc.number}`,
      documentNumber: bl.number,
      documentType: "BON_LIVRAISON",
      documentAmount: totalTTC,
      category: "document",
    });

    // Calculate delivery status summary
    const deliveryStatus = Array.from(bcItemsMap.values()).map((bcItemData) => {
      const deliveryInfo = itemsToDeliver.find(
        (d) => d.bcItem.id === bcItemData.item.id
      );
      return {
        itemId: bcItemData.item.id,
        designation: bcItemData.item.designation,
        orderedQty: bcItemData.orderedQty,
        previouslyDelivered: bcItemData.totalDelivered,
        deliveredInThisBL: deliveryInfo?.deliverQty || 0,
        totalDelivered: deliveryInfo?.newTotalDelivered || bcItemData.totalDelivered,
        remaining: deliveryInfo?.remainingAfter || bcItemData.remainingQty,
        isComplete: (deliveryInfo?.remainingAfter || bcItemData.remainingQty) === 0,
      };
    });

    return apiSuccess(
      {
        bl: {
          ...bl,
          totalHT: Number(bl.totalHT),
          netHT: Number(bl.netHT),
          totalTVA: Number(bl.totalTVA),
          totalTTC: Number(bl.totalTTC),
        },
        sourceBC: {
          id: bc.id,
          number: bc.number,
          newStatus: newBCStatus,
          isFullyDelivered: allItemsFullyDelivered,
        },
        deliveryStatus,
        existingDeliveries: bc.children.length + 1,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Partial Delivery POST");
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id]/partial-delivery
// Get delivery status for a BC (all BLs and remaining quantities)
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get BC with all items and deliveries
    const bc = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            deliveries: {
              include: {
                document: {
                  select: {
                    id: true,
                    number: true,
                    status: true,
                    date: true,
                    receivedBy: true,
                    receivedAt: true,
                  },
                },
              },
            },
          },
        },
        children: {
          where: { type: "BON_LIVRAISON" },
          select: {
            id: true,
            number: true,
            status: true,
            date: true,
            totalTTC: true,
            receivedBy: true,
            receivedAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!bc) {
      return apiError("Bon de commande non trouvé", 404);
    }

    if (bc.type !== "BON_COMMANDE") {
      return apiError("Ce n'est pas un bon de commande", 400);
    }

    // Build delivery status for each item
    const itemsStatus = bc.items.map((item) => {
      const orderedQty = Number(item.quantity);
      const deliveryHistory = item.deliveries.map((delivery) => ({
        blId: delivery.document?.id,
        blNumber: delivery.document?.number,
        blStatus: delivery.document?.status,
        deliveredQty: Number(delivery.deliveredQty || 0),
        date: delivery.document?.date,
        receivedBy: delivery.document?.receivedBy,
      }));

      const totalDelivered = deliveryHistory.reduce(
        (sum, d) => sum + d.deliveredQty,
        0
      );
      const remainingQty = orderedQty - totalDelivered;
      const percentDelivered = Math.round((totalDelivered / orderedQty) * 100);

      return {
        itemId: item.id,
        reference: item.reference,
        designation: item.designation,
        unit: item.unit,
        orderedQty,
        totalDelivered,
        remainingQty,
        percentDelivered,
        isComplete: remainingQty === 0,
        deliveryHistory,
      };
    });

    // Calculate overall BC delivery status
    const totalOrderedValue = Number(bc.totalTTC);
    const totalDeliveredValue = bc.children.reduce(
      (sum, bl) => sum + Number(bl.totalTTC),
      0
    );
    const remainingValue = totalOrderedValue - totalDeliveredValue;
    const allComplete = itemsStatus.every((item) => item.isComplete);

    const deliveryLogs = await prisma.bCDeliveryLog.findMany({
      where: { bcId: bc.id },
      orderBy: { deliveryDate: "asc" },
    });

    return apiSuccess({
      bc: {
        id: bc.id,
        number: bc.number,
        status: bc.status,
        totalTTC: totalOrderedValue,
      },
      summary: {
        totalItems: bc.items.length,
        itemsFullyDelivered: itemsStatus.filter((i) => i.isComplete).length,
        itemsPartiallyDelivered: itemsStatus.filter(
          (i) => !i.isComplete && i.totalDelivered > 0
        ).length,
        itemsNotDelivered: itemsStatus.filter((i) => i.totalDelivered === 0).length,
        deliveriesCount: bc.children.length,
        totalOrderedValue,
        totalDeliveredValue,
        remainingValue,
        percentDelivered: Math.round((totalDeliveredValue / totalOrderedValue) * 100),
        isFullyDelivered: allComplete,
      },
      items: itemsStatus,
      deliveries: bc.children.map((bl) => ({
        id: bl.id,
        number: bl.number,
        status: bl.status,
        date: bl.date,
        totalTTC: Number(bl.totalTTC),
        receivedBy: bl.receivedBy,
        receivedAt: bl.receivedAt,
      })),
      deliveryLogs,
    });
  } catch (error) {
    return handleApiError(error, "Partial Delivery GET");
  }
}
