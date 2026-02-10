import { NextRequest } from "next/server";
import {
  apiSuccess,
  handleApiError,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/services - Public list of active services
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams, 50);

    const [services, total] = await Promise.all([
      prisma.siteService.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        skip,
        take: limit,
      }),
      prisma.siteService.count({ where: { isActive: true } }),
    ]);

    return apiSuccess(paginatedResponse(services, total, { page, limit, skip }));
  } catch (error) {
    return handleApiError(error, "Services GET");
  }
}
