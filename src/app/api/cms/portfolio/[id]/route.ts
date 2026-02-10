import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Portfolio Project API
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  titleFr: z.string().min(1).optional(),
  titleEn: z.string().nullable().optional(),
  titleEs: z.string().nullable().optional(),
  titleAr: z.string().nullable().optional(),
  descriptionFr: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionEs: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  beforeDescFr: z.string().nullable().optional(),
  beforeDescEn: z.string().nullable().optional(),
  beforeDescEs: z.string().nullable().optional(),
  beforeDescAr: z.string().nullable().optional(),
  afterDescFr: z.string().nullable().optional(),
  afterDescEn: z.string().nullable().optional(),
  afterDescEs: z.string().nullable().optional(),
  afterDescAr: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  location: z.string().nullable().optional(),
  client: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  duration: z.string().nullable().optional(),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  beforeImages: z.array(z.string()).optional(),
  afterImages: z.array(z.string()).optional(),
  slug: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// GET - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.portfolioProject.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            nameFr: true,
            nameEn: true,
            icon: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT - Update project
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

    // Convert empty categoryId to null to avoid foreign key violation
    const data = { ...validation.data };
    if (data.categoryId === "") {
      data.categoryId = undefined;
    }

    const project = await prisma.portfolioProject.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            nameFr: true,
            nameEn: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Portfolio PUT error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.portfolioProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
