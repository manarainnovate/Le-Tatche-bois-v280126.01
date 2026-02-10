import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const stockMovementSchema = z.object({
  itemId: z.string().min(1, "Article requis"),
  type: z.enum(["in", "out", "adjustment", "return"]),
  quantity: z.number().min(0.01, "Quantité requise"),
  reference: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  unitCost: z.number().optional(),
});

const bulkAdjustmentSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      newQty: z.number().min(0),
      reason: z.string().optional(),
    })
  ),
  reference: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/stock - Get stock overview
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const lowStock = searchParams.get("lowStock") === "true";

    if (itemId) {
      // Get stock movements for specific item
      const [item, movements] = await Promise.all([
        prisma.catalogItem.findUnique({
          where: { id: itemId },
          select: {
            id: true,
            sku: true,
            name: true,
            stockQty: true,
            stockMin: true,
            stockMax: true,
            stockLocation: true,
            trackStock: true,
          },
        }),
        prisma.stockMovement.findMany({
          where: { itemId },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
      ]);

      if (!item) {
        return apiError("Article non trouvé", 404);
      }

      return apiSuccess({
        item: {
          ...item,
          stockQty: Number(item.stockQty),
          stockMin: item.stockMin ? Number(item.stockMin) : null,
          stockMax: item.stockMax ? Number(item.stockMax) : null,
        },
        movements: movements.map((m) => ({
          ...m,
          quantity: Number(m.quantity),
          previousQty: Number(m.previousQty),
          newQty: Number(m.newQty),
          unitCost: m.unitCost ? Number(m.unitCost) : null,
        })),
      });
    }

    // Get all tracked items with stock info
    const items = await prisma.catalogItem.findMany({
      where: {
        trackStock: true,
        isActive: true,
      },
      select: {
        id: true,
        sku: true,
        name: true,
        unit: true,
        stockQty: true,
        stockMin: true,
        stockMax: true,
        stockLocation: true,
        category: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform and filter
    const transformedItems = items.map((item) => ({
      ...item,
      stockQty: Number(item.stockQty),
      stockMin: item.stockMin ? Number(item.stockMin) : null,
      stockMax: item.stockMax ? Number(item.stockMax) : null,
      isLowStock: item.stockMin && Number(item.stockQty) <= Number(item.stockMin),
      isOverStock: item.stockMax && Number(item.stockQty) >= Number(item.stockMax),
    }));

    const finalItems = lowStock
      ? transformedItems.filter((item) => item.isLowStock)
      : transformedItems;

    // Statistics
    const stats = {
      totalItems: items.length,
      lowStockItems: transformedItems.filter((i) => i.isLowStock).length,
      overStockItems: transformedItems.filter((i) => i.isOverStock).length,
      totalValue: items.reduce((sum, item) => {
        // This would need purchase price for accurate value
        return sum + Number(item.stockQty);
      }, 0),
    };

    return apiSuccess({ items: finalItems, stats });
  } catch (error) {
    return handleApiError(error, "Stock GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/catalog/stock - Create stock movement
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for bulk adjustment
    if (body.items) {
      const validation = bulkAdjustmentSchema.safeParse(body);
      if (!validation.success) {
        return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
      }

      const data = validation.data;

      // Process each item
      const results = await prisma.$transaction(async (tx) => {
        const movements = [];

        for (const adjustment of data.items) {
          const item = await tx.catalogItem.findUnique({
            where: { id: adjustment.itemId },
            select: { id: true, stockQty: true, trackStock: true },
          });

          if (!item || !item.trackStock) continue;

          const previousQty = Number(item.stockQty);
          const newQty = adjustment.newQty;
          const diff = newQty - previousQty;

          if (diff === 0) continue;

          // Create movement
          const movement = await tx.stockMovement.create({
            data: {
              itemId: adjustment.itemId,
              type: "adjustment",
              quantity: Math.abs(diff),
              previousQty,
              newQty,
              reference: data.reference,
              reason: adjustment.reason || (diff > 0 ? "Ajustement positif" : "Ajustement négatif"),
            },
          });

          // Update stock
          await tx.catalogItem.update({
            where: { id: adjustment.itemId },
            data: { stockQty: newQty },
          });

          movements.push(movement);
        }

        return movements;
      });

      return apiSuccess({ message: `${results.length} mouvements créés`, movements: results }, 201);
    }

    // Single movement
    const validation = stockMovementSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Get current item
    const item = await prisma.catalogItem.findUnique({
      where: { id: data.itemId },
      select: { id: true, stockQty: true, trackStock: true },
    });

    if (!item) {
      return apiError("Article non trouvé", 404);
    }

    if (!item.trackStock) {
      return apiError("Le suivi de stock n'est pas activé pour cet article", 400);
    }

    const previousQty = Number(item.stockQty);
    let newQty: number;

    switch (data.type) {
      case "in":
      case "return":
        newQty = previousQty + data.quantity;
        break;
      case "out":
        newQty = previousQty - data.quantity;
        if (newQty < 0) {
          return apiError("Stock insuffisant", 400);
        }
        break;
      case "adjustment":
        // For adjustment, quantity is the absolute difference
        newQty = data.quantity;
        break;
      default:
        return apiError("Type de mouvement invalide", 400);
    }

    // Create movement and update stock
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          itemId: data.itemId,
          type: data.type,
          quantity: Math.abs(data.type === "adjustment" ? newQty - previousQty : data.quantity),
          previousQty,
          newQty,
          reference: data.reference,
          reason: data.reason,
          notes: data.notes,
          unitCost: data.unitCost,
        },
      }),
      prisma.catalogItem.update({
        where: { id: data.itemId },
        data: { stockQty: newQty },
      }),
    ]);

    return apiSuccess(
      {
        ...movement,
        quantity: Number(movement.quantity),
        previousQty: Number(movement.previousQty),
        newQty: Number(movement.newQty),
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Stock POST");
  }
}
