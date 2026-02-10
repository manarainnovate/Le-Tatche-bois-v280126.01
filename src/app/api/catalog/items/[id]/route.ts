import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const updateItemSchema = z.object({
  sku: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE"]).optional(),
  categoryId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  unit: z.enum(["PCS", "M2", "ML", "M3", "KG", "L", "H", "FORFAIT", "DAY"]).optional(),
  purchasePrice: z.number().nullable().optional(),
  sellingPriceHT: z.number().min(0).optional(),
  tvaRate: z.number().optional(),
  maxDiscount: z.number().nullable().optional(),
  trackStock: z.boolean().optional(),
  stockQty: z.number().optional(),
  stockMin: z.number().nullable().optional(),
  stockMax: z.number().nullable().optional(),
  stockLocation: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  hasVariants: z.boolean().optional(),
  variants: z.any().nullable().optional(),
  isBundle: z.boolean().optional(),
  bundleItems: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/items/[id] - Get item details
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        supplier: {
          select: { id: true, name: true, code: true, phone: true, email: true },
        },
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        priceHistory: {
          orderBy: { changedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!item) {
      return apiError("Article non trouvé", 404);
    }

    // Transform numeric values
    const transformedItem = {
      ...item,
      purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
      sellingPriceHT: Number(item.sellingPriceHT),
      tvaRate: Number(item.tvaRate),
      maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
      stockQty: Number(item.stockQty),
      stockMin: item.stockMin ? Number(item.stockMin) : null,
      stockMax: item.stockMax ? Number(item.stockMax) : null,
      sellingPriceTTC: Number(item.sellingPriceHT) * (1 + Number(item.tvaRate) / 100),
      isLowStock: item.trackStock && item.stockMin && Number(item.stockQty) <= Number(item.stockMin),
      stockMovements: item.stockMovements.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        previousQty: Number(m.previousQty),
        newQty: Number(m.newQty),
        unitCost: m.unitCost ? Number(m.unitCost) : null,
      })),
      priceHistory: item.priceHistory.map((p) => ({
        ...p,
        oldPrice: Number(p.oldPrice),
        newPrice: Number(p.newPrice),
      })),
    };

    return apiSuccess(transformedItem);
  } catch (error) {
    return handleApiError(error, "Catalog Item GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/catalog/items/[id] - Update item
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateItemSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if item exists
    const existing = await prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Article non trouvé", 404);
    }

    // If changing SKU, check uniqueness
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.catalogItem.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        return apiError("Ce SKU existe déjà", 400);
      }
    }

    // Verify category if provided
    if (data.categoryId) {
      const category = await prisma.catalogCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return apiError("Catégorie non trouvée", 404);
      }
    }

    // Verify supplier if provided
    if (data.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });
      if (!supplier) {
        return apiError("Fournisseur non trouvé", 404);
      }
    }

    // Track price changes
    if (data.sellingPriceHT !== undefined && data.sellingPriceHT !== Number(existing.sellingPriceHT)) {
      await prisma.priceHistory.create({
        data: {
          itemId: id,
          oldPrice: existing.sellingPriceHT,
          newPrice: data.sellingPriceHT,
        },
      });
    }

    const item = await prisma.catalogItem.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return apiSuccess({
      ...item,
      purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
      sellingPriceHT: Number(item.sellingPriceHT),
      tvaRate: Number(item.tvaRate),
      stockQty: Number(item.stockQty),
    });
  } catch (error) {
    return handleApiError(error, "Catalog Item PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/catalog/items/[id] - Delete item
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if item exists
    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: {
        _count: {
          select: { documentItems: true },
        },
      },
    });

    if (!item) {
      return apiError("Article non trouvé", 404);
    }

    // Check if item is used in documents
    if (item._count.documentItems > 0) {
      // Soft delete - just deactivate
      await prisma.catalogItem.update({
        where: { id },
        data: { isActive: false },
      });
      return apiSuccess({ message: "Article désactivé (utilisé dans des documents)" });
    }

    // Hard delete
    await prisma.$transaction([
      prisma.priceHistory.deleteMany({ where: { itemId: id } }),
      prisma.stockMovement.deleteMany({ where: { itemId: id } }),
      prisma.catalogItem.delete({ where: { id } }),
    ]);

    return apiSuccess({ message: "Article supprimé" });
  } catch (error) {
    return handleApiError(error, "Catalog Item DELETE");
  }
}
