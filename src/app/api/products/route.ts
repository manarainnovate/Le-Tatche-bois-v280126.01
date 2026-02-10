import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  withAuth,
  handleApiError,
  getLocaleFromHeaders,
  getPaginationParams,
  getSortParams,
  paginatedResponse,
  generateSlug,
} from "@/lib/api-helpers";
import { z } from "zod";

// Product creation schema
const createProductSchema = z.object({
  slug: z.string().min(1).optional(),
  sku: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  price: z.number().positive(),
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
  })).min(1),
});

// GET /api/products - Public list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = getLocaleFromHeaders(req.headers);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sort = getSortParams(
      searchParams,
      ["createdAt", "price"],
      "createdAt",
      "desc"
    );

    // Build filters
    const categoryId = searchParams.get("categoryId");
    const isFeatured = searchParams.get("isFeatured");
    const isActive = searchParams.get("isActive");
    const isNew = searchParams.get("isNew");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const where: Prisma.ProductWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== null && isFeatured !== undefined) where.isFeatured = isFeatured === "true";
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === "true";
    if (isNew !== null && isNew !== undefined) where.isNew = isNew === "true";

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search in translations
    if (search) {
      where.translations = {
        some: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { shortDescription: { contains: search, mode: "insensitive" } },
          ],
        },
      };
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    if (sort.field === "price") {
      orderBy = { price: sort.order };
    } else {
      orderBy = { createdAt: sort.order };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          translations: {
            where: { locale },
          },
          category: {
            include: {
              translations: {
                where: { locale },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform to include localized data
    const localizedProducts = products.map((product) => {
      const translation = product.translations[0];
      const categoryTranslation = product.category?.translations?.[0];

      return {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        type: product.type,
        price: product.price,
        comparePrice: product.comparePrice,
        stockQty: product.stockQty,
        lowStockQty: product.lowStockQty,
        trackStock: product.trackStock,
        allowBackorder: product.allowBackorder,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isActive: product.isActive,
        weight: product.weight,
        images: product.images,
        thumbnail: product.thumbnail,
        viewCount: product.viewCount,
        soldCount: product.soldCount,
        createdAt: product.createdAt,
        // Localized fields
        name: translation?.name ?? product.slug,
        description: translation?.description ?? "",
        shortDescription: translation?.shortDescription ?? "",
        features: translation?.features ?? [],
        // Category
        category: product.category ? {
          id: product.category.id,
          slug: product.category.slug,
          name: categoryTranslation?.name ?? product.category.slug,
        } : null,
      };
    });

    return apiSuccess(paginatedResponse(localizedProducts, total, { page, limit, skip }));
  } catch (error) {
    return handleApiError(error, "Products GET");
  }
}

// POST /api/products - Admin create
export const POST = withAuth(
  async (req) => {
    try {
      const body: unknown = await req.json();
      const result = createProductSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data = result.data;

      // Generate slug if not provided
      const slug = data.slug ?? generateSlug(data.translations[0]?.name ?? "product");

      // Check slug uniqueness
      const existingSlug = await prisma.product.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        return apiError("Product with this slug already exists", 409);
      }

      // Check SKU uniqueness
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        return apiError("Product with this SKU already exists", 409);
      }

      // Verify category exists if provided
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category) {
          return apiError("Category not found", 404);
        }
      }

      const product = await prisma.product.create({
        data: {
          slug,
          sku: data.sku,
          categoryId: data.categoryId,
          price: data.price,
          comparePrice: data.comparePrice,
          costPrice: data.costPrice,
          stockQty: data.stockQty ?? 0,
          lowStockQty: data.lowStockQty ?? 5,
          trackStock: data.trackStock ?? true,
          allowBackorder: data.allowBackorder ?? false,
          weight: data.weight,
          length: data.length,
          width: data.width,
          height: data.height,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          isNew: data.isNew ?? false,
          images: data.images ?? [],
          thumbnail: data.thumbnail,
          translations: {
            create: data.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              description: t.description,
              shortDescription: t.shortDescription,
              features: t.features ?? [],
            })),
          },
        },
        include: {
          translations: true,
          category: true,
        },
      });

      return apiSuccess(product, 201);
    } catch (error) {
      return handleApiError(error, "Products POST");
    }
  },
  ["ADMIN", "MANAGER"]
);
