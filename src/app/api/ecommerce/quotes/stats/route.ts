import { prisma } from "@/lib/prisma";
import { apiSuccess, withAuth, handleApiError } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/ecommerce/quotes/stats - Get quote stats
// ═══════════════════════════════════════════════════════════

export const GET = withAuth(
  async () => {
    try {
      const [total, pending, quoted, converted] = await Promise.all([
        prisma.ecomQuote.count(),
        prisma.ecomQuote.count({ where: { status: "PENDING" } }),
        prisma.ecomQuote.count({ where: { status: "QUOTED" } }),
        prisma.ecomQuote.count({ where: { status: "CONVERTED" } }),
      ]);

      return apiSuccess({
        total,
        pending,
        quoted,
        converted,
      });
    } catch (error) {
      return handleApiError(error, "Quote Stats GET");
    }
  },
  ["ADMIN", "MANAGER", "COMMERCIAL"]
);
