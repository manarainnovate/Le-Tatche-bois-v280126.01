import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  withAuth,
  handleApiError,
  getLocaleFromHeaders,
  getPaginationParams,
  paginatedResponse,
  generateSlug,
} from "@/lib/api-helpers";
import { createCategorySchema, type CreateCategoryInput } from "@/lib/validations";

// GET /api/categories - Public list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = getLocaleFromHeaders(req.headers);
    const parentId = searchParams.get("parentId");
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const { page, limit, skip } = getPaginationParams(searchParams);

    const where: Record<string, unknown> = {};
    if (parentId) where.parentId = parentId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (isFeatured !== null) where.isFeatured = isFeatured === "true";

    // Check if requesting all translations (for admin)
    const allTranslations = searchParams.get("allTranslations") === "true";

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          translations: allTranslations
            ? true // Include all translations for admin
            : {
                where: { locale },
              },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { order: "asc" },
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    // If requesting all translations, return raw categories with translations array
    if (allTranslations) {
      return apiSuccess(paginatedResponse(categories, total, { page, limit, skip }));
    }

    // Transform to include localized data
    const localizedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      image: cat.image,
      order: cat.order,
      isActive: cat.isActive,
      isFeatured: cat.isFeatured,
      parentId: cat.parentId,
      name: cat.translations[0]?.name ?? cat.slug,
      description: cat.translations[0]?.description ?? "",
      productCount: cat._count.products,
    }));

    return apiSuccess(paginatedResponse(localizedCategories, total, { page, limit, skip }));
  } catch (error) {
    return handleApiError(error, "Categories GET");
  }
}

// POST /api/categories - Admin create
export const POST = withAuth(
  async (req) => {
    try {
      const body: unknown = await req.json();
      const result = createCategorySchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data: CreateCategoryInput = result.data;

      // Generate slug if not provided
      const slug = data.slug ?? generateSlug(data.translations[0]?.name ?? "category");

      // Check slug uniqueness
      const existing = await prisma.category.findUnique({
        where: { slug },
      });
      if (existing) {
        return apiError("Category with this slug already exists", 409);
      }

      const category = await prisma.category.create({
        data: {
          slug,
          order: data.order ?? 0,
          image: data.image,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          parentId: data.parentId,
          translations: {
            create: data.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
              description: t.description,
            })),
          },
        },
        include: { translations: true },
      });

      return apiSuccess(category, 201);
    } catch (error) {
      return handleApiError(error, "Categories POST");
    }
  },
  ["ADMIN", "MANAGER"]
);
