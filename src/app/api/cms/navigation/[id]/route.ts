import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Navigation Item API
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  labelFr: z.string().min(1).optional(),
  labelEn: z.string().nullable().optional(),
  labelEs: z.string().nullable().optional(),
  labelAr: z.string().nullable().optional(),
  url: z.string().min(1).optional(),
  target: z.string().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single navigation item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.navigationItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Navigation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

// PUT - Update navigation item
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

    const item = await prisma.navigationItem.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Navigation PUT error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE - Delete navigation item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.navigationItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Navigation DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
