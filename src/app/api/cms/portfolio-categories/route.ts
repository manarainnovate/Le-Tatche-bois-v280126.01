import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Portfolio Categories API
// ═══════════════════════════════════════════════════════════

const categorySchema = z.object({
  slug: z.string().min(1),
  nameFr: z.string().min(1),
  nameEn: z.string().nullable().optional(),
  nameEs: z.string().nullable().optional(),
  nameAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().default(true),
});

// GET - List categories
export async function GET() {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Portfolio Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if slug exists
    const existing = await prisma.portfolioCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    // Get max order
    const maxOrder = await prisma.portfolioCategory.aggregate({
      _max: { order: true },
    });

    const category = await prisma.portfolioCategory.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Portfolio Categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
