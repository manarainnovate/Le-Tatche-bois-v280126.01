import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { searchAuditLogs, getFinancialAuditTrail } from "@/lib/crm/audit";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// FIX 5: Audit Log API Endpoint
// ═══════════════════════════════════════════════════════════

const auditQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  category: z.enum(["financial", "document", "client", "system"]).optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  documentNumber: z.string().optional(),
  searchTerm: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/crm/audit - Search audit logs
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, string | undefined> = {};

    // Extract query params
    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }

    // Validate query params
    const validation = auditQuerySchema.safeParse(query);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Paramètres invalides", 400);
    }

    const filters = validation.data;

    // Check for financial audit trail shortcut
    if (filters.category === "financial" && filters.dateFrom && filters.dateTo) {
      const result = await getFinancialAuditTrail(
        new Date(filters.dateFrom),
        new Date(filters.dateTo),
        {
          limit: filters.limit,
          offset: filters.offset,
        }
      );

      return apiSuccess({
        logs: result.logs.map((log) => ({
          ...log,
          documentAmount: log.documentAmount ? Number(log.documentAmount) : null,
        })),
        total: result.total,
        summary: result.summary,
      });
    }

    // General audit log search
    const result = await searchAuditLogs({
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      action: filters.action,
      entity: filters.entity,
      userId: filters.userId,
      category: filters.category,
      severity: filters.severity,
      documentNumber: filters.documentNumber,
      searchTerm: filters.searchTerm,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });

    return apiSuccess({
      logs: result.logs.map((log) => ({
        ...log,
        documentAmount: log.documentAmount ? Number(log.documentAmount) : null,
      })),
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return handleApiError(error, "Audit GET");
  }
}
