import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  withAuth,
  handleApiError,
} from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import {
  SETTING_GROUPS,
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings,
  type SettingGroup,
} from "@/lib/settings-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Public groups that don't require authentication
// ═══════════════════════════════════════════════════════════

const PUBLIC_GROUPS: SettingGroup[] = ["general", "contact", "social", "theme"];

// ═══════════════════════════════════════════════════════════
// Validation schema for group update
// ═══════════════════════════════════════════════════════════

const updateGroupSchema = z.record(z.string(), z.unknown());

// ═══════════════════════════════════════════════════════════
// GET /api/settings/[group] - Get settings by group
// ═══════════════════════════════════════════════════════════

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ group: string }> }
) {
  try {
    const { group } = await params;

    // Validate group
    if (!SETTING_GROUPS.includes(group as SettingGroup)) {
      return apiNotFound(`Setting group '${group}' not found`);
    }

    const typedGroup = group as SettingGroup;

    // Check if group requires authentication
    if (!PUBLIC_GROUPS.includes(typedGroup)) {
      const session = await auth();
      const userRole = session?.user?.role ?? null;

      if (!userRole || !["ADMIN", "EDITOR"].includes(userRole)) {
        return apiError("Authentication required", 401);
      }
    }

    // Get settings for this group
    const settings = await getSettings([typedGroup]);

    return apiSuccess({
      group: typedGroup,
      settings: settings[typedGroup] ?? DEFAULT_SETTINGS[typedGroup],
    });
  } catch (error) {
    return handleApiError(error, "Settings Group GET");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/settings/[group] - Update settings by group
// ═══════════════════════════════════════════════════════════

export const PUT = withAuth(
  async (req, { params }) => {
    try {
      const { group } = await params;

      // Validate group
      if (!SETTING_GROUPS.includes(group as SettingGroup)) {
        return apiNotFound(`Setting group '${group}' not found`);
      }

      const typedGroup = group as SettingGroup;

      const body: unknown = await req.json();
      const result = updateGroupSchema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return apiError("Validation failed", 400, errors);
      }

      const newSettings = result.data;

      // Validate settings keys against defaults
      const validKeys = Object.keys(DEFAULT_SETTINGS[typedGroup]);
      const invalidKeys = Object.keys(newSettings).filter(
        (key) => !validKeys.includes(key)
      );

      if (invalidKeys.length > 0) {
        return apiError(
          `Invalid setting keys for group '${group}': ${invalidKeys.join(", ")}`,
          400
        );
      }

      // Update settings
      await updateSettings(typedGroup, newSettings);

      // Return updated settings
      const settings = await getSettings([typedGroup]);

      return apiSuccess({
        message: `Settings for '${group}' updated successfully`,
        group: typedGroup,
        settings: settings[typedGroup],
      });
    } catch (error) {
      return handleApiError(error, "Settings Group PUT");
    }
  },
  ["ADMIN"]
);

// ═══════════════════════════════════════════════════════════
// DELETE /api/settings/[group] - Reset group to defaults
// ═══════════════════════════════════════════════════════════

export const DELETE = withAuth(
  async (_req, { params }) => {
    try {
      const { group } = await params;

      // Validate group
      if (!SETTING_GROUPS.includes(group as SettingGroup)) {
        return apiNotFound(`Setting group '${group}' not found`);
      }

      const typedGroup = group as SettingGroup;

      // Import prisma here to avoid circular dependency
      const { prisma } = await import("@/lib/prisma");

      // Delete all settings for this group
      await prisma.setting.deleteMany({
        where: { group: typedGroup },
      });

      return apiSuccess({
        message: `Settings for '${group}' reset to defaults`,
        group: typedGroup,
        settings: DEFAULT_SETTINGS[typedGroup],
      });
    } catch (error) {
      return handleApiError(error, "Settings Group DELETE");
    }
  },
  ["ADMIN"]
);
