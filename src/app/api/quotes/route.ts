import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  withAuth,
  handleApiError,
  getPaginationParams,
  getSortParams,
  paginatedResponse,
  getClientIP,
} from "@/lib/api-helpers";
import { z } from "zod";
import {
  checkRateLimitEnhanced,
  RATE_LIMITS,
  validateHoneypot,
  sanitizeObject,
  recordSuspiciousActivity,
} from "@/lib/security";

// Quote creation schema
const createQuoteSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(8, "Phone must be at least 8 characters"),
  company: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  projectType: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  locale: z.string().default("fr"),
  source: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// HELPER: Generate unique quote number
// ═══════════════════════════════════════════════════════════

async function generateQuoteNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const startOfMonth = new Date(year, today.getMonth(), 1);
  const endOfMonth = new Date(year, today.getMonth() + 1, 1);

  const monthCount = await prisma.ecomQuote.count({
    where: {
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
  });

  const sequence = String(monthCount + 1).padStart(4, "0");
  return `QT-${year}${month}-${sequence}`;
}

// ═══════════════════════════════════════════════════════════
// POST /api/quotes - Public submit (rate limited)
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Enhanced rate limiting: 5 requests per hour per IP
    const rateLimit = checkRateLimitEnhanced(`quote:${clientIP}`, RATE_LIMITS.forms);

    if (!rateLimit.allowed) {
      return apiError(
        "Too many quote requests. Please try again later.",
        429,
        [{ field: "rateLimit", message: `Try again in ${rateLimit.retryAfter} seconds` }]
      );
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Honeypot validation
    const honeypotResult = validateHoneypot({
      honeypot: body.honeypot as string | undefined,
      _hp_name: body._hp_name as string | undefined,
      website: body.website as string | undefined,
      _timestamp: body._timestamp as number | undefined,
    });

    if (!honeypotResult.valid) {
      recordSuspiciousActivity(clientIP);
      // Return success to not reveal bot detection
      return apiSuccess({ message: "Request received" }, 201);
    }

    // Remove honeypot fields before validation
    const { honeypot, _hp_name, website, _timestamp, ...cleanBody } = body;
    void honeypot; void _hp_name; void website; void _timestamp;

    // Sanitize input
    const sanitizedBody = sanitizeObject(cleanBody as Record<string, unknown>);

    const result = createQuoteSchema.safeParse(sanitizedBody);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const data = result.data;

    // Generate unique quote number
    const quoteNumber = await generateQuoteNumber();

    // Create quote
    const quote = await prisma.ecomQuote.create({
      data: {
        quoteNumber,
        status: "PENDING",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        company: data.company,
        city: data.city,
        address: data.address,
        projectType: data.projectType,
        description: data.description,
        budget: data.budget,
        timeline: data.timeline,
        attachments: data.attachments ?? [],
        locale: data.locale,
        source: data.source ?? "website",
      },
    });

    return apiSuccess(
      {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        message: "Your quote request has been submitted successfully. We will contact you shortly.",
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Quotes POST");
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/quotes - Admin list
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit, skip } = getPaginationParams(searchParams);
      const sort = getSortParams(
        searchParams,
        ["createdAt", "status", "customerName"],
        "createdAt",
        "desc"
      );

      // Build filters
      const status = searchParams.get("status");
      const search = searchParams.get("search");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const where: Prisma.EcomQuoteWhereInput = {};

      if (status) where.status = status as Prisma.EnumEcomQuoteStatusFilter;

      // Search in customer info
      if (search) {
        where.OR = [
          { quoteNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ];
      }

      // Date range filter
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setDate(endDate.getDate() + 1);
          where.createdAt.lt = endDate;
        }
      }

      // Build orderBy
      let orderBy: Prisma.EcomQuoteOrderByWithRelationInput;
      if (sort.field === "status") {
        orderBy = { status: sort.order };
      } else if (sort.field === "customerName") {
        orderBy = { customerName: sort.order };
      } else {
        orderBy = { createdAt: sort.order };
      }

      const [quotes, total] = await Promise.all([
        prisma.ecomQuote.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
            },
            notes: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.ecomQuote.count({ where }),
      ]);

      // Transform data
      const transformedQuotes = quotes.map((quote) => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        company: quote.company,
        city: quote.city,
        projectType: quote.projectType,
        description: quote.description,
        budget: quote.budget,
        timeline: quote.timeline,
        quotedPrice: quote.quotedPrice,
        validUntil: quote.validUntil,
        locale: quote.locale,
        source: quote.source,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
        respondedAt: quote.respondedAt,
        itemsCount: quote.items.length,
        notesCount: quote.notes.length,
      }));

      return apiSuccess(paginatedResponse(transformedQuotes, total, { page, limit, skip }));
    } catch (error) {
      return handleApiError(error, "Quotes GET");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);
