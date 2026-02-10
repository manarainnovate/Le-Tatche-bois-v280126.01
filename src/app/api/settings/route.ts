import {
  apiSuccess,
  apiError,
  withAuth,
  handleApiError,
} from "@/lib/api-helpers";
import {
  SETTING_GROUPS,
  getSettings,
  updateSettings,
  type SettingGroup,
} from "@/lib/settings-helpers";
import { z } from "zod";

// Public settings (safe to expose)
const PUBLIC_GROUPS: SettingGroup[] = [
  "general",
  "contact",
  "social",
  "seo",
  "tracking",
  "devises",
  "theme",
];

// ═══════════════════════════════════════════════════════════
// Validation schema for batch update
// ═══════════════════════════════════════════════════════════

const batchUpdateSchema = z.object({
  settings: z.record(z.string(), z.record(z.string(), z.unknown())),
});

// Force dynamic - no caching for settings
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ═══════════════════════════════════════════════════════════
// GET /api/settings - Get public settings
// ═══════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Only return public settings
    const settings = await getSettings(PUBLIC_GROUPS);

    // Return with no-cache headers
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          settings,
          groups: PUBLIC_GROUPS,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, "Settings GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/settings - Batch update all settings (admin)
// ═══════════════════════════════════════════════════════════

export const PUT = withAuth(
  async (req) => {
    try {
      const body: unknown = await req.json();
      const result = batchUpdateSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const { settings } = result.data;

      // Validate groups
      const invalidGroups = Object.keys(settings).filter(
        (g) => !SETTING_GROUPS.includes(g as SettingGroup)
      );

      if (invalidGroups.length > 0) {
        return apiError(
          `Invalid setting groups: ${invalidGroups.join(", ")}`,
          400
        );
      }

      // Update each group
      for (const [group, groupSettings] of Object.entries(settings)) {
        await updateSettings(group, groupSettings);
      }

      // Return updated settings
      const updatedSettings = await getSettings();

      return apiSuccess({
        message: "Settings updated successfully",
        settings: updatedSettings,
      });
    } catch (error) {
      return handleApiError(error, "Settings PUT");
    }
  },
  ["ADMIN"]
);
