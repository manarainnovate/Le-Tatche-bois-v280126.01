import { prisma } from "@/lib/prisma";
import { apiSuccess, withAuth, handleApiError } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/admin/notifications - Get notification counts
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async () => {
    try {
      // Fetch unread messages count
      const unreadMessages = await prisma.message.count({
        where: { read: false },
      });

      // Fetch pending orders count (gracefully handle if Order table doesn't exist)
      let pendingOrders = 0;
      try {
        pendingOrders = await prisma.order.count({
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        });
      } catch (error) {
        console.warn("Order table not accessible:", error);
      }

      // Quote requests - set to 0 for now since the model doesn't exist yet
      // TODO: Implement QuoteRequest model and update this
      const newQuotes = 0;

      return apiSuccess({
        unreadMessages,
        pendingOrders,
        newQuotes,
        total: unreadMessages + pendingOrders + newQuotes,
      });
    } catch (error) {
      return handleApiError(error, "Admin Notifications GET");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);
