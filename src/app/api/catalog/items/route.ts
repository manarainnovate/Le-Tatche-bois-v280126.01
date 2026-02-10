import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createItemSchema = z.object({
  sku: z.string().optional(), // Auto-generated if not provided
  type: z.enum(["PRODUCT", "SERVICE"]).default("PRODUCT"),
  categoryId: z.string().optional(),
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  unit: z.enum(["PCS", "M2", "ML", "M3", "KG", "L", "H", "FORFAIT", "DAY"]).default("PCS"),
  purchasePrice: z.number().optional(),
  sellingPriceHT: z.number().min(0, "Prix HT requis"),
  tvaRate: z.number().default(20),
  maxDiscount: z.number().optional(),
  trackStock: z.boolean().default(false),
  stockQty: z.number().default(0),
  stockMin: z.number().optional(),
  stockMax: z.number().optional(),
  stockLocation: z.string().optional(),
  supplierId: z.string().optional(),
  images: z.array(z.string()).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.any().optional(),
  isBundle: z.boolean().default(false),
  bundleItems: z.any().optional(),
  isActive: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// Helper: Generate SKU
// ═══════════════════════════════════════════════════════════

async function generateSKU(type: string): Promise<string> {
  const prefix = type === "PRODUCT" ? "LTB-PRD" : "LTB-SRV";

  // Find max SKU for this type
  const lastItem = await prisma.catalogItem.findFirst({
    where: {
      sku: { startsWith: prefix },
    },
    orderBy: { sku: "desc" },
    select: { sku: true },
  });

  let nextNumber = 1;
  if (lastItem?.sku) {
    const match = lastItem.sku.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/items - List items
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const supplierId = searchParams.get("supplierId");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock") === "true";
    const activeOnly = searchParams.get("active") !== "false";

    // Build where clause
    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Low stock filter
    if (lowStock) {
      where.trackStock = true;
      // This requires raw query for stockQty <= stockMin
      // For simplicity, we'll filter in memory
    }

    const [items, total] = await Promise.all([
      prisma.catalogItem.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          supplier: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { stockMovements: true },
          },
        },
        orderBy: [{ name: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.catalogItem.count({ where }),
    ]);

    // Transform items
    const transformedItems = items.map((item) => ({
      ...item,
      purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
      sellingPriceHT: Number(item.sellingPriceHT),
      tvaRate: Number(item.tvaRate),
      maxDiscount: item.maxDiscount ? Number(item.maxDiscount) : null,
      stockQty: Number(item.stockQty),
      stockMin: item.stockMin ? Number(item.stockMin) : null,
      stockMax: item.stockMax ? Number(item.stockMax) : null,
      // Calculate selling price TTC
      sellingPriceTTC: Number(item.sellingPriceHT) * (1 + Number(item.tvaRate) / 100),
      // Low stock alert
      isLowStock: item.trackStock && item.stockMin && Number(item.stockQty) <= Number(item.stockMin),
    }));

    // Filter low stock if requested
    const finalItems = lowStock
      ? transformedItems.filter((item) => item.isLowStock)
      : transformedItems;

    return apiSuccess({
      items: finalItems,
      pagination: {
        page,
        limit,
        total: lowStock ? finalItems.length : total,
        totalPages: Math.ceil((lowStock ? finalItems.length : total) / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Catalog Items GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/catalog/items - Create item
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createItemSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Generate SKU if not provided
    let sku = data.sku;
    if (!sku) {
      sku = await generateSKU(data.type);
    } else {
      // Check if SKU is unique
      const existingSku = await prisma.catalogItem.findUnique({
        where: { sku },
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

    const item = await prisma.catalogItem.create({
      data: {
        sku,
        type: data.type,
        categoryId: data.categoryId || null,
        name: data.name,
        description: data.description,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPriceHT: data.sellingPriceHT,
        tvaRate: data.tvaRate,
        maxDiscount: data.maxDiscount,
        trackStock: data.trackStock,
        stockQty: data.stockQty,
        stockMin: data.stockMin,
        stockMax: data.stockMax,
        stockLocation: data.stockLocation,
        supplierId: data.supplierId || null,
        images: data.images || [],
        hasVariants: data.hasVariants,
        variants: data.variants,
        isBundle: data.isBundle,
        bundleItems: data.bundleItems,
        isActive: data.isActive,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        supplier: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return apiSuccess(
      {
        ...item,
        purchasePrice: item.purchasePrice ? Number(item.purchasePrice) : null,
        sellingPriceHT: Number(item.sellingPriceHT),
        tvaRate: Number(item.tvaRate),
        stockQty: Number(item.stockQty),
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Catalog Items POST");
  }
}
