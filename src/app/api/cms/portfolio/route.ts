import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// CMS Portfolio API
// ═══════════════════════════════════════════════════════════

// GET - List portfolio projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const admin = searchParams.get("admin");

    const where: Record<string, unknown> = {};
    // Only filter by isActive for public requests (not admin)
    if (admin !== "true") {
      where.isActive = true;
    }
    if (categoryId) where.categoryId = categoryId;
    if (featured === "true") where.isFeatured = true;

    const projects = await prisma.portfolioProject.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },  // Featured/pinned first
        { order: "asc" },
        { createdAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        titleFr: true,
        titleEn: true,
        titleEs: true,
        titleAr: true,
        slug: true,
        coverImage: true,
        location: true,
        year: true,
        isActive: true,
        isFeatured: true,
        order: true,
        beforeImages: true,
        afterImages: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            slug: true,
            nameFr: true,
            nameEn: true,
            nameEs: true,
            nameAr: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error("❌ Portfolio GET error:", error);

    // If table doesn't exist, return empty array
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2021" || prismaError.code === "P2010") {
      return NextResponse.json({ projects: [] });
    }

    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST - Create portfolio project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log("📥 Received project data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.titleFr || !data.titleFr.trim()) {
      return NextResponse.json(
        { error: "Le titre en français est requis" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.titleFr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Check if slug exists, append random string if needed
    const existingSlug = await prisma.portfolioProject.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Get max order for positioning
    const maxOrder = await prisma.portfolioProject.aggregate({
      _max: { order: true },
    });

    // Prepare data for creation - explicitly define all fields
    const createData = {
      // Required
      titleFr: data.titleFr as string,
      slug: slug as string,
      order: (maxOrder._max?.order || 0) + 1,

      // Multilingual title
      titleEn: (data.titleEn as string) || null,
      titleEs: (data.titleEs as string) || null,
      titleAr: (data.titleAr as string) || null,

      // Multilingual description
      descriptionFr: (data.descriptionFr as string) || null,
      descriptionEn: (data.descriptionEn as string) || null,
      descriptionEs: (data.descriptionEs as string) || null,
      descriptionAr: (data.descriptionAr as string) || null,

      // BEFORE gallery
      beforeDescFr: (data.beforeDescFr as string) || null,
      beforeDescEn: (data.beforeDescEn as string) || null,
      beforeDescEs: (data.beforeDescEs as string) || null,
      beforeDescAr: (data.beforeDescAr as string) || null,
      beforeImages: (data.beforeImages as string[]) || [],

      // AFTER gallery
      afterDescFr: (data.afterDescFr as string) || null,
      afterDescEn: (data.afterDescEn as string) || null,
      afterDescEs: (data.afterDescEs as string) || null,
      afterDescAr: (data.afterDescAr as string) || null,
      afterImages: (data.afterImages as string[]) || [],

      // Project details
      location: (data.location as string) || null,
      year: data.year ? parseInt(String(data.year)) : null,
      duration: (data.duration as string) || null,
      client: (data.client as string) || null,

      // Images
      coverImage: (data.coverImage as string) || null,
      images: (data.images as string[]) || [],

      // Status
      isActive: (data.isActive as boolean) ?? true,
      isFeatured: (data.isFeatured as boolean) ?? false,

      // Category relation (optional)
      ...(data.categoryId
        ? {
            category: {
              connect: { id: data.categoryId as string },
            },
          }
        : {}),
    };

    console.log("📝 Creating project with slug:", slug);

    // Create the project
    const project = await prisma.portfolioProject.create({
      data: createData,
      include: {
        category: true,
      },
    });

    console.log("✅ Project created:", project.id, project.titleFr);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Error creating project:", error);

    const prismaError = error as { message?: string; code?: string };
    console.error("Error details:", prismaError.message);
    console.error("Error code:", prismaError.code);

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: prismaError.message,
        code: prismaError.code,
      },
      { status: 500 }
    );
  }
}
