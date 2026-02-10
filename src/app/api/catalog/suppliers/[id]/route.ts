import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const updateSupplierSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1).optional(),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().optional(),
  paymentTerms: z.string().nullable().optional(),
  bankInfo: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/suppliers/[id] - Get supplier details
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            sellingPriceHT: true,
            stockQty: true,
            unit: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    if (!supplier) {
      return apiError("Fournisseur non trouvé", 404);
    }

    // Transform items
    const transformedSupplier = {
      ...supplier,
      items: supplier.items.map((item) => ({
        ...item,
        sellingPriceHT: Number(item.sellingPriceHT),
        stockQty: Number(item.stockQty),
      })),
    };

    return apiSuccess(transformedSupplier);
  } catch (error) {
    return handleApiError(error, "Supplier GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/catalog/suppliers/[id] - Update supplier
// ═══════════════════════════════════════════════════════════

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateSupplierSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Fournisseur non trouvé", 404);
    }

    // If changing code, check uniqueness
    if (data.code && data.code !== existing.code) {
      const existingCode = await prisma.supplier.findUnique({
        where: { code: data.code },
      });
      if (existingCode) {
        return apiError("Ce code fournisseur existe déjà", 400);
      }
    }

    // Handle empty email
    if (data.email === "") {
      data.email = null;
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
      include: {
        _count: { select: { items: true } },
      },
    });

    return apiSuccess(supplier);
  } catch (error) {
    return handleApiError(error, "Supplier PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/catalog/suppliers/[id] - Delete supplier
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true } },
      },
    });

    if (!supplier) {
      return apiError("Fournisseur non trouvé", 404);
    }

    // Check if supplier has items
    if (supplier._count.items > 0) {
      // Soft delete - just deactivate
      await prisma.supplier.update({
        where: { id },
        data: { isActive: false },
      });
      return apiSuccess({ message: "Fournisseur désactivé (lié à des articles)" });
    }

    // Hard delete
    await prisma.supplier.delete({
      where: { id },
    });

    return apiSuccess({ message: "Fournisseur supprimé" });
  } catch (error) {
    return handleApiError(error, "Supplier DELETE");
  }
}
