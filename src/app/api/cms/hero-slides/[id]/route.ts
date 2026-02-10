import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Hero Slides API - Single Slide
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  targetPage: z.string().min(1).optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  imageUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  videoPoster: z.string().nullable().optional(),
  titleFr: z.string().min(1).optional(),
  titleEn: z.string().nullable().optional(),
  titleEs: z.string().nullable().optional(),
  titleAr: z.string().nullable().optional(),
  subtitleFr: z.string().nullable().optional(),
  subtitleEn: z.string().nullable().optional(),
  subtitleEs: z.string().nullable().optional(),
  subtitleAr: z.string().nullable().optional(),
  ctaTextFr: z.string().nullable().optional(),
  ctaTextEn: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  cta2TextFr: z.string().nullable().optional(),
  cta2TextEn: z.string().nullable().optional(),
  cta2Url: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single slide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const slide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Hero Slide GET error:", error);
    return NextResponse.json({ error: "Failed to fetch slide" }, { status: 500 });
  }
}

// PUT - Update slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Map field names for compatibility
    if (body.pageSlug && !body.targetPage) {
      body.targetPage = body.pageSlug;
      delete body.pageSlug;
    }
    if (body.ctaLabelFr && !body.ctaTextFr) {
      body.ctaTextFr = body.ctaLabelFr;
      delete body.ctaLabelFr;
    }
    if (body.ctaLabelEn && !body.ctaTextEn) {
      body.ctaTextEn = body.ctaLabelEn;
      delete body.ctaLabelEn;
    }
    if (body.ctaLink && !body.ctaUrl) {
      body.ctaUrl = body.ctaLink;
      delete body.ctaLink;
    }

    // Remove fields that don't exist
    delete body.ctaLabelEs;
    delete body.ctaLabelAr;

    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Hero Slide PUT error:", error);
    return NextResponse.json({ error: "Failed to update slide" }, { status: 500 });
  }
}

// DELETE - Delete slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hero Slide DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete slide" }, { status: 500 });
  }
}
