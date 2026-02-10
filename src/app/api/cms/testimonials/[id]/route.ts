import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Testimonials API - Single Testimonial
// Schema fields: clientName, clientRole, company, avatar, contentFr, contentEn, rating, projectId, order, isActive, isFeatured
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  clientName: z.string().min(1).optional(),
  clientRole: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  contentFr: z.string().min(1).optional(),
  contentEn: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  projectId: z.string().optional(),
  order: z.number().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Map to frontend field names
    const mapped = {
      ...testimonial,
      authorName: testimonial.clientName,
      authorRole: testimonial.clientRole,
      authorCompany: testimonial.company,
      authorImage: testimonial.avatar,
    };

    return NextResponse.json({ testimonial: mapped });
  } catch (error) {
    console.error("Testimonial GET error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonial" }, { status: 500 });
  }
}

// PUT - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Map frontend field names to schema field names
    const mappedBody: Record<string, unknown> = {};

    if (body.authorName !== undefined || body.clientName !== undefined) {
      mappedBody.clientName = body.authorName ?? body.clientName;
    }
    if (body.authorRole !== undefined || body.clientRole !== undefined) {
      mappedBody.clientRole = body.authorRole ?? body.clientRole;
    }
    if (body.authorCompany !== undefined || body.company !== undefined) {
      mappedBody.company = body.authorCompany ?? body.company;
    }
    if (body.authorImage !== undefined || body.avatar !== undefined) {
      mappedBody.avatar = body.authorImage ?? body.avatar;
    }
    if (body.contentFr !== undefined) mappedBody.contentFr = body.contentFr;
    if (body.contentEn !== undefined) mappedBody.contentEn = body.contentEn;
    if (body.rating !== undefined) mappedBody.rating = body.rating;
    if (body.projectId !== undefined) mappedBody.projectId = body.projectId;
    if (body.order !== undefined) mappedBody.order = body.order;
    if (body.isFeatured !== undefined) mappedBody.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) mappedBody.isActive = body.isActive;

    const validation = updateSchema.safeParse(mappedBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Testimonial PUT error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
