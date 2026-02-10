import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security";
import { checkRateLimitEnhanced, RATE_LIMITS } from "@/lib/security";
import { getClientIP } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/security/csrf - Generate CSRF token
// ═══════════════════════════════════════════════════════════

export function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const rateLimit = checkRateLimitEnhanced(`csrf:${ip}`, RATE_LIMITS.api);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  const { token, expiresAt } = generateCsrfToken();

  return NextResponse.json(
    {
      success: true,
      data: {
        token,
        expiresAt,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
