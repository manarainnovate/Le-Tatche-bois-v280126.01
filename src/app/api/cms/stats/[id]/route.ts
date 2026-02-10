import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CMS Stats/Counters API - Single Stat
// ═══════════════════════════════════════════════════════════

const updateSchema = z.object({
  value: z.string().min(1).optional(),
  labelFr: z.string().min(1).optional(),
  labelEn: z.string().nullable().optional(),
  labelEs: z.string().nullable().optional(),
  labelAr: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single stat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stat = await prisma.statCounter.findUnique({
      where: { id },
    });

    if (!stat) {
      return NextResponse.json({ error: "Stat not found" }, { status: 404 });
    }

    return NextResponse.json({ stat });
  } catch (error) {
    console.error("Stat GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stat" }, { status: 500 });
  }
}

// PUT - Update stat
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

    const stat = await prisma.statCounter.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ stat });
  } catch (error) {
    console.error("Stat PUT error:", error);
    return NextResponse.json({ error: "Failed to update stat" }, { status: 500 });
  }
}

// DELETE - Delete stat
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.statCounter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Stat DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete stat" }, { status: 500 });
  }
}
