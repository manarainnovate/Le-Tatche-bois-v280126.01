import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { generateB2BNumber } from "@/lib/crm/generate-document-number";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation Schema
// ═══════════════════════════════════════════════════════════

const createLeadSchema = z.object({
  source: z.enum(["WEBSITE", "WHATSAPP", "PHONE", "FACEBOOK", "INSTAGRAM", "REFERRAL", "WALK_IN", "OTHER"]),
  fullName: z.string().min(2, "Le nom est requis"),
  company: z.string().optional(),
  phone: z.string().min(8, "Le téléphone est requis"),
  phoneAlt: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  address: z.string().optional(),
  clientType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  ice: z.string().optional(),
  need: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["NEW", "CONTACTED", "VISIT_SCHEDULED", "MEASURES_TAKEN", "QUOTE_SENT", "NEGOTIATION", "WON", "LOST"]).default("NEW"),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/leads - List leads
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const urgency = searchParams.get("urgency");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (urgency) {
      where.urgency = urgency;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
      }
    }

    if (search) {
      where.OR = [
        { leadNumber: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute queries
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { activities: true, appointments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return apiSuccess({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Leads GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/leads - Create lead
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createLeadSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const data = result.data;

    // Generate lead number with new B2B format (L01260001, etc.)
    const leadNumber = await generateB2BNumber("LEAD");

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        source: data.source,
        status: data.status,
        fullName: data.fullName,
        company: data.company || null,
        phone: data.phone,
        phoneAlt: data.phoneAlt || null,
        email: data.email || null,
        city: data.city || null,
        address: data.address || null,
        clientType: data.clientType,
        ice: data.ice || null,
        need: data.need || null,
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        urgency: data.urgency,
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    // Create initial activity
    await prisma.activity.create({
      data: {
        type: "NOTE",
        description: `Lead créé depuis ${data.source.toLowerCase().replace("_", " ")}`,
        leadId: lead.id,
      },
    });

    return apiSuccess({ lead }, 201);
  } catch (error) {
    return handleApiError(error, "Leads POST");
  }
}
