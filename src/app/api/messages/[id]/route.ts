import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiNotFound,
  apiError,
  withAuth,
  handleApiError,
} from "@/lib/api-helpers";
import { updateMessageSchema, type UpdateMessageInput } from "@/lib/validations";

// ═══════════════════════════════════════════════════════════
// GET /api/messages/[id] - Admin view single message
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const message = await prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        return apiNotFound("Message not found");
      }

      // Auto-mark as read when viewed
      if (!message.read) {
        await prisma.message.update({
          where: { id },
          data: {
            read: true,
            readAt: new Date(),
          },
        });
      }

      return apiSuccess({
        id: message.id,
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        content: message.content,
        read: true,
        readAt: message.readAt ?? new Date(),
        locale: message.locale,
        createdAt: message.createdAt,
      });
    } catch (error) {
      return handleApiError(error, "Message GET");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);

// ═══════════════════════════════════════════════════════════
// PATCH /api/messages/[id] - Admin update (mark read/unread)
// ═══════════════════════════════════════════════════════════

export const PATCH = withAuth(
  async (req, { params }) => {
    try {
      const { id } = await params;
      const body: unknown = await req.json();
      const result = updateMessageSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const data: UpdateMessageInput = result.data;

      const existing = await prisma.message.findUnique({
        where: { id },
      });
      if (!existing) {
        return apiNotFound("Message not found");
      }

      // Build update data
      const updateData: Record<string, unknown> = {};

      if (data.read !== undefined) {
        updateData.read = data.read;
        if (data.read && !existing.read) {
          updateData.readAt = new Date();
        } else if (!data.read) {
          updateData.readAt = null;
        }
      }

      if (data.starred !== undefined) {
        updateData.starred = data.starred;
      }

      const message = await prisma.message.update({
        where: { id },
        data: updateData,
      });

      return apiSuccess({
        id: message.id,
        name: message.name,
        email: message.email,
        read: message.read,
        readAt: message.readAt,
        starred: message.starred,
        updatedAt: new Date(),
      });
    } catch (error) {
      return handleApiError(error, "Message PATCH");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);

// ═══════════════════════════════════════════════════════════
// DELETE /api/messages/[id] - Admin delete
// ═══════════════════════════════════════════════════════════

export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { id } = await params;

      const existing = await prisma.message.findUnique({
        where: { id },
      });

      if (!existing) {
        return apiNotFound("Message not found");
      }

      await prisma.message.delete({ where: { id } });

      return apiSuccess({ message: "Message deleted successfully" });
    } catch (error) {
      return handleApiError(error, "Message DELETE");
    }
  },
  ["ADMIN"]
);
