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
import { createMessageSchema, type CreateMessageInput } from "@/lib/validations";
import {
  checkRateLimitEnhanced,
  validateHoneypot,
  sanitizeObject,
  recordSuspiciousActivity,
} from "@/lib/security";

// ═══════════════════════════════════════════════════════════
// POST /api/messages - Public submit (rate limited)
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Enhanced rate limiting: 3 requests per hour per IP (using forms tier)
    const rateLimit = checkRateLimitEnhanced(`message:${clientIP}`, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(
        "Too many messages. Please try again later.",
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
      return apiSuccess({ message: "Message received" }, 201);
    }

    // Remove honeypot fields before validation
    const { honeypot, _hp_name, website, _timestamp, ...cleanBody } = body;
    void honeypot; void _hp_name; void website; void _timestamp;

    // Sanitize input
    const sanitizedBody = sanitizeObject(cleanBody as Record<string, unknown>);

    const result = createMessageSchema.safeParse(sanitizedBody);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const data: CreateMessageInput = result.data;

    // Get attachments if provided
    const attachments = (body as any).attachments;

    // Create message
    const message = await prisma.message.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        content: data.content,
        attachments: attachments && Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined,
        locale: data.locale ?? "fr",
        read: false,
      },
    });

    // Send emails (non-blocking - errors are logged but don't fail the request)
    const { sendMessageNotificationToAdmin, sendMessageConfirmationToVisitor } = await import("@/lib/email");

    const emailData = {
      id: message.id,
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      content: message.content,
      locale: message.locale,
      createdAt: message.createdAt,
    };

    // Send admin notification email
    sendMessageNotificationToAdmin(emailData).catch((err) => {
      console.error("Failed to send admin notification email:", err);
    });

    // Send visitor confirmation email
    sendMessageConfirmationToVisitor(emailData).catch((err) => {
      console.error("Failed to send visitor confirmation email:", err);
    });

    return apiSuccess(
      {
        id: message.id,
        message: "Your message has been sent successfully. We will respond shortly.",
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Messages POST");
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/messages - Admin list
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit, skip } = getPaginationParams(searchParams);
      const sort = getSortParams(
        searchParams,
        ["createdAt", "name", "email"],
        "createdAt",
        "desc"
      );

      // Build filters
      const read = searchParams.get("read");
      const starred = searchParams.get("starred");
      const type = searchParams.get("type");
      const search = searchParams.get("search");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const where: Prisma.MessageWhereInput = {};

      if (read !== null && read !== undefined && read !== "") {
        where.read = read === "true";
      }

      if (starred !== null && starred !== undefined && starred !== "") {
        where.starred = starred === "true";
      }

      if (type && (type === "RECEIVED" || type === "SENT")) {
        where.type = type;
      }

      // Search in name, email, subject, content
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
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
      let orderBy: Prisma.MessageOrderByWithRelationInput;
      if (sort.field === "name") {
        orderBy = { name: sort.order };
      } else if (sort.field === "email") {
        orderBy = { email: sort.order };
      } else {
        orderBy = { createdAt: sort.order };
      }

      const [messages, total, unreadCount] = await Promise.all([
        prisma.message.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.message.count({ where }),
        prisma.message.count({ where: { read: false } }),
      ]);

      // Transform data
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        subject: msg.subject,
        content: msg.content,
        read: msg.read,
        readAt: msg.readAt,
        starred: msg.starred,
        type: msg.type,
        locale: msg.locale,
        createdAt: msg.createdAt,
      }));

      return apiSuccess({
        ...paginatedResponse(transformedMessages, total, { page, limit, skip }),
        unreadCount,
      });
    } catch (error) {
      return handleApiError(error, "Messages GET");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);
