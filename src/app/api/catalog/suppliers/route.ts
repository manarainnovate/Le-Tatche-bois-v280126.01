import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const createSupplierSchema = z.object({
  code: z.string().optional(), // Auto-generated if not provided
  name: z.string().min(1, "Nom requis"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Maroc"),
  paymentTerms: z.string().optional(),
  bankInfo: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// Helper: Generate Supplier Code
// ═══════════════════════════════════════════════════════════

async function generateSupplierCode(): Promise<string> {
  const prefix = "FRN";

  const lastSupplier = await prisma.supplier.findFirst({
    where: {
      code: { startsWith: prefix },
    },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  let nextNumber = 1;
  if (lastSupplier?.code) {
    const match = lastSupplier.code.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// GET /api/catalog/suppliers - List suppliers
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("active") !== "false";

    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return apiSuccess(suppliers);
  } catch (error) {
    return handleApiError(error, "Suppliers GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/catalog/suppliers - Create supplier
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createSupplierSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Generate code if not provided
    let code = data.code;
    if (!code) {
      code = await generateSupplierCode();
    } else {
      // Check if code is unique
      const existingCode = await prisma.supplier.findUnique({
        where: { code },
      });
      if (existingCode) {
        return apiError("Ce code fournisseur existe déjà", 400);
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name: data.name,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        country: data.country,
        paymentTerms: data.paymentTerms,
        bankInfo: data.bankInfo,
        notes: data.notes,
        isActive: data.isActive,
      },
      include: {
        _count: { select: { items: true } },
      },
    });

    return apiSuccess(supplier, 201);
  } catch (error) {
    return handleApiError(error, "Suppliers POST");
  }
}
