import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Testimonials API
// Schema fields: clientName, clientRole, company, avatar, contentFr, contentEn, rating, projectId, order, isActive, isFeatured
// ═══════════════════════════════════════════════════════════

const createSchema = z.object({
  clientName: z.string().min(1),
  clientRole: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  contentFr: z.string().min(1),
  contentEn: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  projectId: z.string().optional(),
  order: z.number().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET - List all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const active = searchParams.get("active");

    const testimonials = await prisma.testimonial.findMany({
      where: {
        ...(featured === "true" ? { isFeatured: true } : {}),
        ...(active === "true" ? { isActive: true } : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    // Map schema field names to frontend field names for compatibility
    const mappedTestimonials = testimonials.map((t) => ({
      ...t,
      authorName: t.clientName,
      authorRole: t.clientRole,
      authorCompany: t.company,
      authorImage: t.avatar,
    }));

    return NextResponse.json({ testimonials: mappedTestimonials });
  } catch (error) {
    console.error("Testimonials GET error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST - Create testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map frontend field names to schema field names
    const mappedBody = {
      clientName: body.authorName || body.clientName,
      clientRole: body.authorRole || body.clientRole,
      company: body.authorCompany || body.company,
      avatar: body.authorImage || body.avatar,
      contentFr: body.contentFr,
      contentEn: body.contentEn,
      rating: body.rating,
      projectId: body.projectId,
      order: body.order,
      isFeatured: body.isFeatured,
      isActive: body.isActive,
    };

    // Remove undefined values
    Object.keys(mappedBody).forEach((key) => {
      if (mappedBody[key as keyof typeof mappedBody] === undefined) {
        delete mappedBody[key as keyof typeof mappedBody];
      }
    });

    const validation = createSchema.safeParse(mappedBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: validation.data,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error("Testimonials POST error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
