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
import { updateCategorySchema, type UpdateCategoryInput } from "@/lib/validations";

// GET /api/categories/[id] - Public get single
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const locale = getLocaleFromHeaders(req.headers);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
        children: {
          include: {
            translations: { where: { locale } },
          },
        },
        parent: {
          include: {
            translations: { where: { locale } },
          },
        },
      },
    });

    if (!category) {
      return apiNotFound("Category not found");
    }

    const translation =
      category.translations.find((t) => t.locale === locale) ??
      category.translations[0];

    return apiSuccess({
      ...category,
      name: translation?.name ?? category.slug,
      description: translation?.description ?? "",
    });
  } catch (error) {
    return handleApiError(error, "Category GET");
  }
}

// PUT /api/categories/[id] - Admin update
export const PUT = withAuth(
  async (req, { params }) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();
      const result = updateCategorySchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data: UpdateCategoryInput = result.data;

      const existing = await prisma.category.findUnique({
        where: { id },
      });
      if (!existing) {
        return apiNotFound("Category not found");
      }

      // Check slug uniqueness if changed
      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.category.findUnique({
          where: { slug: data.slug },
        });
        if (slugExists) {
          return apiError("Category with this slug already exists", 409);
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.image !== undefined) updateData.image = data.image;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
      if (data.parentId !== undefined) updateData.parentId = data.parentId;

      // Handle translations update
      if (data.translations && data.translations.length > 0) {
        // Delete old translations and create new ones
        await prisma.categoryTranslation.deleteMany({
          where: { categoryId: id },
        });

        updateData.translations = {
          create: data.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        };
      }

      const category = await prisma.category.update({
        where: { id },
        data: updateData,
        include: { translations: true },
      });

      return apiSuccess(category);
    } catch (error) {
      return handleApiError(error, "Category PUT");
    }
  },
  ["ADMIN", "MANAGER"]
);

// DELETE /api/categories/[id] - Admin delete
export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const existing = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });

      if (!existing) {
        return apiNotFound("Category not found");
      }

      // Check if category has items
      const totalItems =
        existing._count.products +
        existing._count.children;

      if (totalItems > 0) {
        return apiError(
          "Cannot delete category with associated items or subcategories. Reassign them first.",
          400
        );
      }

      await prisma.category.delete({ where: { id } });

      return apiSuccess({ message: "Category deleted successfully" });
    } catch (error) {
      return handleApiError(error, "Category DELETE");
    }
  },
  ["ADMIN"]
);
