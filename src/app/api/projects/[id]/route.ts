import { NextRequest } from "next/server";
import {
  apiNotFound,
  handleApiError,
} from "@/lib/api-helpers";

// GET /api/projects/[id] - Public get single
// Note: Portfolio/Showcase Project model not implemented yet
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params; // Consume params
    return apiNotFound("Portfolio projects feature not yet implemented");
  } catch (error) {
    return handleApiError(error, "Project GET");
  }
}

// PUT /api/projects/[id] - Admin update
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return apiNotFound("Portfolio projects feature not yet implemented");
  } catch (error) {
    return handleApiError(error, "Project PUT");
  }
}

// DELETE /api/projects/[id] - Admin delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return apiNotFound("Portfolio projects feature not yet implemented");
  } catch (error) {
    return handleApiError(error, "Project DELETE");
  }
}
