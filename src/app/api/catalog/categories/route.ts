import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const createCategorySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  slug: z.string().min(1, "Slug requis"),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/categories - List categories
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get("flat") === "true";
    const activeOnly = searchParams.get("active") !== "false";

    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;

    if (flat) {
      // Return flat list
      const categories = await prisma.catalogCategory.findMany({
        where,
        include: {
          _count: {
            select: { items: true, children: true },
          },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });

      return apiSuccess(categories);
    }

    // Return tree structure (root categories with children)
    const categories = await prisma.catalogCategory.findMany({
      where: {
        ...where,
        parentId: null,
      },
      include: {
        children: {
          where: activeOnly ? { isActive: true } : {},
          include: {
            children: {
              where: activeOnly ? { isActive: true } : {},
              include: {
                _count: { select: { items: true } },
              },
              orderBy: [{ order: "asc" }, { name: "asc" }],
            },
            _count: { select: { items: true } },
          },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        },
        _count: {
          select: { items: true, children: true },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error, "Categories GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/catalog/categories - Create category
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if slug is unique
    const existingSlug = await prisma.catalogCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return apiError("Ce slug existe déjà", 400);
    }

    // If parent is specified, verify it exists
    if (data.parentId) {
      const parent = await prisma.catalogCategory.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        return apiError("Catégorie parente non trouvée", 404);
      }
    }

    // Get max order for sibling categories
    const maxOrder = await prisma.catalogCategory.aggregate({
      where: { parentId: data.parentId || null },
      _max: { order: true },
    });

    const category = await prisma.catalogCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        parentId: data.parentId || null,
        order: data.order ?? (maxOrder._max.order || 0) + 1,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: { select: { items: true, children: true } },
      },
    });

    return apiSuccess(category, 201);
  } catch (error) {
    return handleApiError(error, "Categories POST");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/catalog/categories - Update category
// ═══════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const { id, ...data } = validation.data;

    // Check if category exists
    const existing = await prisma.catalogCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Catégorie non trouvée", 404);
    }

    // If changing slug, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.catalogCategory.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        return apiError("Ce slug existe déjà", 400);
      }
    }

    // Prevent circular parent reference
    if (data.parentId === id) {
      return apiError("Une catégorie ne peut pas être son propre parent", 400);
    }

    const category = await prisma.catalogCategory.update({
      where: { id },
      data,
      include: {
        _count: { select: { items: true, children: true } },
      },
    });

    return apiSuccess(category);
  } catch (error) {
    return handleApiError(error, "Categories PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/catalog/categories - Delete category
// ═══════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("ID requis", 400);
    }

    // Check if category exists
    const category = await prisma.catalogCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true, children: true } },
      },
    });

    if (!category) {
      return apiError("Catégorie non trouvée", 404);
    }

    // Check if has children or items
    if (category._count.children > 0) {
      return apiError("Impossible de supprimer: catégorie contient des sous-catégories", 400);
    }

    if (category._count.items > 0) {
      return apiError("Impossible de supprimer: catégorie contient des articles", 400);
    }

    await prisma.catalogCategory.delete({
      where: { id },
    });

    return apiSuccess({ message: "Catégorie supprimée" });
  } catch (error) {
    return handleApiError(error, "Categories DELETE");
  }
}
