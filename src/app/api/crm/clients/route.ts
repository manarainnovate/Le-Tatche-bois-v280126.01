import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const createClientSchema = z.object({
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  fullName: z.string().min(2, "Le nom est requis"),
  company: z.string().optional(),
  phone: z.string().min(8, "Le téléphone est requis"),
  phoneAlt: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.string().default("Maroc"),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryPostalCode: z.string().optional(),
  sameAsDelivery: z.boolean().default(true),
  ice: z.string().optional(),
  taxId: z.string().optional(),
  rc: z.string().optional(),
  paymentTerms: z.string().default("comptant"),
  defaultDiscount: z.number().min(0).max(100).optional(),
  creditLimit: z.number().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/clients - List clients
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const clientType = searchParams.get("type");
    const city = searchParams.get("city");
    const hasBalance = searchParams.get("hasBalance");
    const search = searchParams.get("search");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (clientType) {
      where.clientType = clientType;
    }

    if (city) {
      where.billingCity = { contains: city, mode: "insensitive" };
    }

    if (hasBalance === "true") {
      where.balance = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { clientNumber: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute queries
    const [clients, total] = await Promise.all([
      prisma.cRMClient.findMany({
        where,
        include: {
          _count: {
            select: {
              projects: true,
              documents: true,
              payments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.cRMClient.count({ where }),
    ]);

    return apiSuccess({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Clients GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/clients - Create client
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createClientSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const data = result.data;

    // Generate client number with new B2B format (CLI0001, CLI0002, etc.)
    const clientNumber = await generateB2BNumber("CLIENT");

    // Handle delivery address
    const deliveryData = data.sameAsDelivery
      ? {
          deliveryAddress: data.billingAddress,
          deliveryCity: data.billingCity,
          deliveryPostalCode: data.billingPostalCode,
        }
      : {
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPostalCode: data.deliveryPostalCode,
        };

    // Create client
    const client = await prisma.cRMClient.create({
      data: {
        clientNumber,
        clientType: data.clientType,
        fullName: data.fullName,
        company: data.company || null,
        phone: data.phone,
        phoneAlt: data.phoneAlt || null,
        email: data.email || null,
        billingAddress: data.billingAddress || null,
        billingCity: data.billingCity || null,
        billingPostalCode: data.billingPostalCode || null,
        billingCountry: data.billingCountry,
        ...deliveryData,
        ice: data.ice || null,
        taxId: data.taxId || null,
        rc: data.rc || null,
        paymentTerms: data.paymentTerms,
        defaultDiscount: data.defaultDiscount || null,
        creditLimit: data.creditLimit || null,
        notes: data.notes || null,
        tags: data.tags,
      },
    });

    return apiSuccess({ client }, 201);
  } catch (error) {
    return handleApiError(error, "Clients POST");
  }
}
