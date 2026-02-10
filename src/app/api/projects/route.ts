import { NextRequest } from "next/server";
import {
  apiSuccess,
  handleApiError,
  getPaginationParams,
  paginatedResponse,
} from "@/lib/api-helpers";

// GET /api/projects - Public list
// Note: Portfolio/Showcase Project model not implemented yet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    // Return empty list - portfolio projects model not implemented
    return apiSuccess(paginatedResponse([], 0, { page, limit, skip }));
  } catch (error) {
    return handleApiError(error, "Projects GET");
  }
}

// POST /api/projects - Admin create
// Note: Portfolio/Showcase Project model not implemented yet
export async function POST() {
  return apiSuccess({
    message: "Portfolio projects feature not yet implemented"
  }, 501);
}
