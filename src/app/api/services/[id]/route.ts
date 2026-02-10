import { NextRequest } from "next/server";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/services/[id] - Get single service (supports id or slug)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try by slug first, then by id
    let service = await prisma.siteService.findUnique({
      where: { slug: id },
    });

    if (!service) {
      service = await prisma.siteService.findUnique({
        where: { id },
      });
    }

    if (!service || !service.isActive) {
      return apiNotFound("Service not found");
    }

    // Fetch matching PortfolioCategory + projects by same slug
    let portfolioCategory = null;
    if (service.slug) {
      portfolioCategory = await prisma.portfolioCategory.findUnique({
        where: { slug: service.slug },
        include: {
          projects: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              titleFr: true,
              titleEn: true,
              titleEs: true,
              titleAr: true,
              descriptionFr: true,
              descriptionEn: true,
              descriptionEs: true,
              descriptionAr: true,
              afterImages: true,
              coverImage: true,
              slug: true,
              isFeatured: true,
            },
          },
        },
      });
    }

    return apiSuccess({
      service,
      portfolioCategory: portfolioCategory ?? null,
      projects: portfolioCategory?.projects ?? [],
    });
  } catch (error) {
    return handleApiError(error, "Service Detail GET");
  }
}

// PUT /api/services/[id] - Admin update (placeholder)
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return apiNotFound("Services admin update not yet implemented");
  } catch (error) {
    return handleApiError(error, "Service PUT");
  }
}

// DELETE /api/services/[id] - Admin delete (placeholder)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return apiNotFound("Services admin delete not yet implemented");
  } catch (error) {
    return handleApiError(error, "Service DELETE");
  }
}
