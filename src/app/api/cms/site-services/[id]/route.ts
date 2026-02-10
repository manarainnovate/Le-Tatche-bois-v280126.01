import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Site Services API - Single Service
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  titleFr: z.string().min(1).optional(),
  titleEn: z.string().nullable().optional(),
  titleEs: z.string().nullable().optional(),
  titleAr: z.string().nullable().optional(),
  shortDescFr: z.string().nullable().optional(),
  shortDescEn: z.string().nullable().optional(),
  shortDescEs: z.string().nullable().optional(),
  shortDescAr: z.string().nullable().optional(),
  fullDescFr: z.string().nullable().optional(),
  fullDescEn: z.string().nullable().optional(),
  fullDescEs: z.string().nullable().optional(),
  fullDescAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.siteService.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Site Service GET error:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// PUT - Update service
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
      const existing = await prisma.siteService.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const service = await prisma.siteService.update({
      where: { id },
      data,
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Site Service PUT error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.siteService.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site Service DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
