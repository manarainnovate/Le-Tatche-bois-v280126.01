import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  withAuth,
  handleApiError,
  getLocaleFromHeaders,
} from "@/lib/api-helpers";
import { z } from "zod";

// Partial update schema for PATCH
const partialProductSchema = z.object({
  stockQty: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
});

// Full update schema
const updateProductSchema = z.object({
  slug: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  categoryId: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  costPrice: z.number().positive().nullable().optional(),
  stockQty: z.number().int().min(0).optional(),
  lowStockQty: z.number().int().min(0).optional(),
  trackStock: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  weight: z.number().positive().nullable().optional(),
  length: z.number().positive().nullable().optional(),
  width: z.number().positive().nullable().optional(),
  height: z.number().positive().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().nullable().optional(),
  translations: z.array(z.object({
    locale: z.string(),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    shortDescription: z.string().nullable().optional(),
    features: z.array(z.string()).optional(),
  })).optional(),
});

// GET /api/products/[id] - Public get single (by id or slug)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const locale = getLocaleFromHeaders(req.headers);

    // Try to find by ID first, then by slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        translations: true,
        category: {
          include: {
            translations: { where: { locale } },
          },
        },
      },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    const translation =
      product.translations.find((t) => t.locale === locale) ??
      product.translations[0];

    const categoryTranslation = product.category?.translations?.[0];

    // Fetch related products (same category, excluding current)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        translations: {
          where: { locale },
        },
      },
      take: 4,
    });

    const localizedRelated = relatedProducts.map((p) => {
      const t = p.translations[0];
      return {
        id: p.id,
        slug: p.slug,
        name: t?.name ?? p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        stockQty: p.stockQty,
        trackStock: p.trackStock,
      };
    });

    return apiSuccess({
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      type: product.type,
      price: product.price,
      comparePrice: product.comparePrice,
      costPrice: product.costPrice,
      stockQty: product.stockQty,
      lowStockQty: product.lowStockQty,
      trackStock: product.trackStock,
      allowBackorder: product.allowBackorder,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isActive: product.isActive,
      weight: product.weight,
      length: product.length,
      width: product.width,
      height: product.height,
      images: product.images,
      thumbnail: product.thumbnail,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      viewCount: product.viewCount,
      soldCount: product.soldCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Localized fields
      name: translation?.name ?? product.slug,
      description: translation?.description ?? "",
      shortDescription: translation?.shortDescription ?? "",
      features: translation?.features ?? [],
      // All translations for admin
      translations: product.translations,
      // Category
      category: product.category ? {
        id: product.category.id,
        slug: product.category.slug,
        name: categoryTranslation?.name ?? product.category.slug,
      } : null,
      // Related products
      relatedProducts: localizedRelated,
    });
  } catch (error) {
    return handleApiError(error, "Product GET");
  }
}

// PUT /api/products/[id] - Admin full update
export const PUT = withAuth(
  async (req, { params }) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();
      const result = updateProductSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data = result.data;

      const existing = await prisma.product.findUnique({
        where: { id },
      });
      if (!existing) {
        return apiNotFound("Product not found");
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.product.findUnique({
          where: { slug: data.slug },
        });
        if (slugExists) {
          return apiError("Product with this slug already exists", 409);
        }
      }

      // Check SKU uniqueness if changed
      if (data.sku && data.sku !== existing.sku) {
        const skuExists = await prisma.product.findUnique({
          where: { sku: data.sku },
        });
        if (skuExists) {
          return apiError("Product with this SKU already exists", 409);
        }
      }

      // Verify category exists if changing
      if (data.categoryId && data.categoryId !== existing.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category) {
          return apiError("Category not found", 404);
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.sku !== undefined) updateData.sku = data.sku;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice;
      if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
      if (data.stockQty !== undefined) updateData.stockQty = data.stockQty;
      if (data.lowStockQty !== undefined) updateData.lowStockQty = data.lowStockQty;
      if (data.trackStock !== undefined) updateData.trackStock = data.trackStock;
      if (data.allowBackorder !== undefined) updateData.allowBackorder = data.allowBackorder;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.length !== undefined) updateData.length = data.length;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
      if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.isNew !== undefined) updateData.isNew = data.isNew;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;

      // Handle translations update
      if (data.translations && data.translations.length > 0) {
        await prisma.productTranslation.deleteMany({
          where: { productId: id },
        });

        updateData.translations = {
          create: data.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
            shortDescription: t.shortDescription,
            features: t.features ?? [],
          })),
        };
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          translations: true,
          category: true,
        },
      });

      return apiSuccess(product);
    } catch (error) {
      return handleApiError(error, "Product PUT");
    }
  },
  ["ADMIN", "MANAGER"]
);

// PATCH /api/products/[id] - Admin partial update (quick updates for stock)
export const PATCH = withAuth(
  async (req, { params }) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();
      const result = partialProductSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data = result.data;

      const existing = await prisma.product.findUnique({
        where: { id },
      });
      if (!existing) {
        return apiNotFound("Product not found");
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (data.stockQty !== undefined) updateData.stockQty = data.stockQty;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.isNew !== undefined) updateData.isNew = data.isNew;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          translations: true,
          category: true,
        },
      });

      return apiSuccess(product);
    } catch (error) {
      return handleApiError(error, "Product PATCH");
    }
  },
  ["ADMIN", "MANAGER"]
);

// DELETE /api/products/[id] - Admin delete
export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const existing = await prisma.product.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              cartItems: true,
              orderItems: true,
            },
          },
        },
      });

      if (!existing) {
        return apiNotFound("Product not found");
      }

      // Check if product is in any orders
      if (existing._count.orderItems > 0) {
        return apiError(
          "Cannot delete product with order history. Deactivate it instead.",
          400
        );
      }

      // Remove from carts first
      if (existing._count.cartItems > 0) {
        await prisma.cartItem.deleteMany({
          where: { productId: id },
        });
      }

      // Delete product (translations will cascade)
      await prisma.product.delete({ where: { id } });

      return apiSuccess({ message: "Product deleted successfully" });
    } catch (error) {
      return handleApiError(error, "Product DELETE");
    }
  },
  ["ADMIN"]
);
