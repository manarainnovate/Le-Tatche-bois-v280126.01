import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// POST /api/cms/portfolio/merge
// Merge 2-3 portfolio projects into one:
//   - Keep the project with the longest description (FR)
//   - Combine all images (before/after/cover) deduplicated
//   - Delete the other projects
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 5) {
      return NextResponse.json(
        { error: "Please select 2 to 5 projects to merge" },
        { status: 400 }
      );
    }

    // Fetch full details of all selected projects
    const projects = await prisma.portfolioProject.findMany({
      where: { id: { in: ids } },
      include: {
        category: {
          select: { id: true, slug: true, nameFr: true },
        },
      },
    });

    if (projects.length < 2) {
      return NextResponse.json(
        { error: "Could not find enough projects to merge" },
        { status: 404 }
      );
    }

    // Determine the "keeper" — the one with the longest descriptionFr
    const keeper = projects.reduce((best, current) => {
      const bestLen = (best.descriptionFr || "").length;
      const currentLen = (current.descriptionFr || "").length;
      return currentLen > bestLen ? current : best;
    }, projects[0]);

    const others = projects.filter((p) => p.id !== keeper.id);

    // Merge images — deduplicate by URL
    const mergeArrays = (base: string[], ...additions: string[][]) => {
      const set = new Set(base);
      for (const arr of additions) {
        for (const item of arr) {
          set.add(item);
        }
      }
      return Array.from(set);
    };

    const mergedBeforeImages = mergeArrays(
      keeper.beforeImages,
      ...others.map((p) => p.beforeImages)
    );
    const mergedAfterImages = mergeArrays(
      keeper.afterImages,
      ...others.map((p) => p.afterImages)
    );
    const mergedImages = mergeArrays(
      keeper.images,
      ...others.map((p) => p.images)
    );

    // Use keeper's cover image, or fall back to any other project's cover
    const coverImage =
      keeper.coverImage ||
      others.find((p) => p.coverImage)?.coverImage ||
      null;

    // For text fields: use keeper's value, or fall back to longest from others
    const pickLongest = (keeperVal: string | null, othersVals: (string | null)[]) => {
      if (keeperVal && keeperVal.length > 0) return keeperVal;
      return othersVals.reduce<string | null>((best, val) => {
        if (!val) return best;
        if (!best || val.length > best.length) return val;
        return best;
      }, null);
    };

    // Merge description fields (keep longest for each locale)
    const descriptionFr = pickLongest(keeper.descriptionFr, others.map((p) => p.descriptionFr));
    const descriptionEn = pickLongest(keeper.descriptionEn, others.map((p) => p.descriptionEn));
    const descriptionEs = pickLongest(keeper.descriptionEs, others.map((p) => p.descriptionEs));
    const descriptionAr = pickLongest(keeper.descriptionAr, others.map((p) => p.descriptionAr));

    // Before/After descriptions
    const beforeDescFr = pickLongest(keeper.beforeDescFr, others.map((p) => p.beforeDescFr));
    const beforeDescEn = pickLongest(keeper.beforeDescEn, others.map((p) => p.beforeDescEn));
    const beforeDescEs = pickLongest(keeper.beforeDescEs, others.map((p) => p.beforeDescEs));
    const beforeDescAr = pickLongest(keeper.beforeDescAr, others.map((p) => p.beforeDescAr));
    const afterDescFr = pickLongest(keeper.afterDescFr, others.map((p) => p.afterDescFr));
    const afterDescEn = pickLongest(keeper.afterDescEn, others.map((p) => p.afterDescEn));
    const afterDescEs = pickLongest(keeper.afterDescEs, others.map((p) => p.afterDescEs));
    const afterDescAr = pickLongest(keeper.afterDescAr, others.map((p) => p.afterDescAr));

    // Location, year, client, duration — keep keeper's value, or first non-null from others
    const location = keeper.location || others.find((p) => p.location)?.location || null;
    const year = keeper.year || others.find((p) => p.year)?.year || null;
    const client = keeper.client || others.find((p) => p.client)?.client || null;
    const duration = keeper.duration || others.find((p) => p.duration)?.duration || null;

    // Use a transaction: update keeper + delete others
    await prisma.$transaction([
      prisma.portfolioProject.update({
        where: { id: keeper.id },
        data: {
          beforeImages: mergedBeforeImages,
          afterImages: mergedAfterImages,
          images: mergedImages,
          coverImage,
          descriptionFr,
          descriptionEn,
          descriptionEs,
          descriptionAr,
          beforeDescFr,
          beforeDescEn,
          beforeDescEs,
          beforeDescAr,
          afterDescFr,
          afterDescEn,
          afterDescEs,
          afterDescAr,
          location,
          year,
          client,
          duration,
        },
      }),
      prisma.portfolioProject.deleteMany({
        where: { id: { in: others.map((p) => p.id) } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      kept: keeper.id,
      deleted: others.map((p) => p.id),
      mergedCounts: {
        beforeImages: mergedBeforeImages.length,
        afterImages: mergedAfterImages.length,
        images: mergedImages.length,
      },
    });
  } catch (error) {
    console.error("Portfolio merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge projects" },
      { status: 500 }
    );
  }
}
