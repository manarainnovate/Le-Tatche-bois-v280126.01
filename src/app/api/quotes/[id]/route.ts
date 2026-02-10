import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  withAuth,
  handleApiError,
} from "@/lib/api-helpers";
import { z } from "zod";

// Update quote schema
const updateQuoteSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "QUOTED", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"]).optional(),
  response: z.string().optional(),
  quotedPrice: z.number().positive().optional(),
  validUntil: z.string().datetime().optional(),
  internalNote: z.string().optional(),
});

// Add note schema
const addNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  isInternal: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// GET /api/quotes/[id] - Admin view details
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      // Find by ID or quote number
      const quote = await prisma.ecomQuote.findFirst({
        where: {
          OR: [{ id }, { quoteNumber: id }],
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  thumbnail: true,
                  price: true,
                  translations: {
                    take: 1,
                    select: { name: true },
                  },
                },
              },
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!quote) {
        return apiNotFound("Quote not found");
      }

      return apiSuccess({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        company: quote.company,
        city: quote.city,
        address: quote.address,
        projectType: quote.projectType,
        description: quote.description,
        budget: quote.budget,
        timeline: quote.timeline,
        attachments: quote.attachments,
        response: quote.response,
        quotedPrice: quote.quotedPrice,
        validUntil: quote.validUntil,
        internalNote: quote.internalNote,
        locale: quote.locale,
        source: quote.source,
        convertedToLeadId: quote.convertedToLeadId,
        convertedToOrderId: quote.convertedToOrderId,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
        respondedAt: quote.respondedAt,
        items: quote.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          dimensions: item.dimensions,
          product: item.product ? {
            id: item.product.id,
            slug: item.product.slug,
            thumbnail: item.product.thumbnail,
            price: item.product.price,
            name: item.product.translations[0]?.name,
          } : null,
        })),
        notes: quote.notes.map((note) => ({
          id: note.id,
          content: note.content,
          isInternal: note.isInternal,
          createdAt: note.createdAt,
        })),
      });
    } catch (error) {
      return handleApiError(error, "Quote GET");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);

// ═══════════════════════════════════════════════════════════
// PATCH /api/quotes/[id] - Admin update
// ═══════════════════════════════════════════════════════════

export const PATCH = withAuth(
  async (req, { params }, user) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();

      // Check if this is a note addition
      if (body && typeof body === "object" && "content" in body && !("status" in body)) {
        const noteResult = addNoteSchema.safeParse(body);
        if (!noteResult.success) {
          const errors = noteResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }));
          return apiError("Validation failed", 400, errors);
        }

        const existing = await prisma.ecomQuote.findUnique({
          where: { id },
        });
        if (!existing) {
          return apiNotFound("Quote not found");
        }

        const note = await prisma.ecomQuoteNote.create({
          data: {
            quoteId: existing.id,
            content: noteResult.data.content,
            isInternal: noteResult.data.isInternal,
            createdById: user?.id,
          },
        });

        return apiSuccess({
          id: note.id,
          content: note.content,
          isInternal: note.isInternal,
          createdAt: note.createdAt,
        });
      }

      // Regular update
      const result = updateQuoteSchema.safeParse(body);
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data = result.data;

      const existing = await prisma.ecomQuote.findUnique({
        where: { id },
      });
      if (!existing) {
        return apiNotFound("Quote not found");
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.response !== undefined) updateData.response = data.response;
      if (data.quotedPrice !== undefined) updateData.quotedPrice = data.quotedPrice;
      if (data.validUntil !== undefined) updateData.validUntil = new Date(data.validUntil);
      if (data.internalNote !== undefined) updateData.internalNote = data.internalNote;

      // Set respondedAt when sending response
      if (data.status === "QUOTED" && existing.status !== "QUOTED") {
        updateData.respondedAt = new Date();
      }

      const quote = await prisma.ecomQuote.update({
        where: { id },
        data: updateData,
      });

      return apiSuccess({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        quotedPrice: quote.quotedPrice,
        validUntil: quote.validUntil,
        respondedAt: quote.respondedAt,
        updatedAt: quote.updatedAt,
      });
    } catch (error) {
      return handleApiError(error, "Quote PATCH");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);

// ═══════════════════════════════════════════════════════════
// DELETE /api/quotes/[id] - Admin delete
// ═══════════════════════════════════════════════════════════

export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const existing = await prisma.ecomQuote.findUnique({
        where: { id },
      });

      if (!existing) {
        return apiNotFound("Quote not found");
      }

      // Only allow deletion of PENDING or REJECTED quotes
      if (!["PENDING", "REJECTED", "EXPIRED"].includes(existing.status)) {
        return apiError(
          "Can only delete quotes with status PENDING, REJECTED, or EXPIRED.",
          400
        );
      }

      // Delete quote (notes and items will cascade)
      await prisma.ecomQuote.delete({ where: { id } });

      return apiSuccess({ message: "Quote deleted successfully" });
    } catch (error) {
      return handleApiError(error, "Quote DELETE");
    }
  },
  ["ADMIN"]
);
