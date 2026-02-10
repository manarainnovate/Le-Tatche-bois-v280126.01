import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Portfolio Category API
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  nameFr: z.string().min(1).optional(),
  nameEn: z.string().nullable().optional(),
  nameEs: z.string().nullable().optional(),
  nameAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.portfolioCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Portfolio Category GET error:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await prisma.portfolioCategory.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const category = await prisma.portfolioCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Portfolio Category PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has projects
    const category = await prisma.portfolioCategory.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });

    if (category && category._count.projects > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with projects" },
        { status: 400 }
      );
    }

    await prisma.portfolioCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio Category DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
