import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodSchema, ZodError } from "zod";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Array<{ field: string; message: string }>;
  retryAfter?: number;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Standard success response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error response
 */
export function apiError(
  message: string,
  status = 400,
  errors?: Array<{ field: string; message: string }>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: message, errors },
    { status }
  );
}

/**
 * 404 Not Found response
 */
export function apiNotFound(message = "Resource not found"): NextResponse<ApiErrorResponse> {
  return apiError(message, 404);
}

/**
 * 401 Unauthorized response
 */
export function apiUnauthorized(message = "Authentication required"): NextResponse<ApiErrorResponse> {
  return apiError(message, 401);
}

/**
 * 403 Forbidden response
 */
export function apiForbidden(message = "Access denied"): NextResponse<ApiErrorResponse> {
  return apiError(message, 403);
}

/**
 * Validation error response from Zod
 */
export function apiValidationError(zodError: ZodError): NextResponse<ApiErrorResponse> {
  const formattedErrors: Array<{ field: string; message: string }> = [];

  for (const issue of zodError.issues) {
    formattedErrors.push({
      field: issue.path.join("."),
      message: issue.message,
    });
  }

  return NextResponse.json(
    { success: false as const, error: "Validation failed", errors: formattedErrors },
    { status: 400 }
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH WRAPPER
// ═══════════════════════════════════════════════════════════

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

type ApiHandler<T = Record<string, string>> = (
  req: NextRequest,
  context: { params: Promise<T> },
  user?: AuthUser
) => Promise<NextResponse>;

/**
 * Auth wrapper - checks NextAuth session and optionally validates roles
 * @param handler - The API route handler
 * @param allowedRoles - Optional array of allowed roles (ADMIN, EDITOR, SALES)
 */
export function withAuth<T = Record<string, string>>(
  handler: ApiHandler<T>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest, context: { params: Promise<T> }): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (!session?.user) {
        return apiUnauthorized();
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name,
        role: session.user.role,
      };

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return apiForbidden("Insufficient permissions");
      }

      return handler(req, context, user);
    } catch (error) {
      console.error("Auth error:", error);
      return apiError("Authentication error", 500);
    }
  };
}

// ═══════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  };
}

/**
 * Get client IP from request
 */
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIP = forwarded.split(",")[0];
    return firstIP ? firstIP.trim() : "unknown";
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Rate limit wrapper HOC
 * @param key - Rate limit key prefix
 * @param limit - Max requests
 * @param windowMs - Time window in milliseconds
 */
export function withRateLimit<T = Record<string, string>>(
  key: string,
  limit: number,
  windowMs?: number
) {
  return (handler: ApiHandler<T>): ApiHandler<T> => {
    return async (req, context, user) => {
      const clientKey = `${key}:${getClientIP(req)}`;
      const { allowed, remaining, resetIn } = checkRateLimit(clientKey, limit, windowMs);

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests",
            retryAfter: Math.ceil(resetIn / 1000),
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(resetIn / 1000)),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      const response = await handler(req, context, user);
      response.headers.set("X-RateLimit-Limit", String(limit));
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      return response;
    };
  };
}

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Validate request body against a Zod schema
 * @throws ZodError if validation fails
 */
export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Validate query parameters against a Zod schema
 * @throws ZodError if validation fails
 */
export function validateQuery<T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams
): T {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        params[key] = [existing, value];
      }
    } else {
      params[key] = value;
    }
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Safe body parser with validation
 */
export async function parseAndValidateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body: unknown = await req.json();
    const data = validateBody(schema, body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: apiValidationError(err) };
    }
    return { data: null, error: apiError("Invalid JSON body", 400) };
  }
}

// ═══════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════

/**
 * Parse pagination params from URL search params
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 10,
  maxLimit = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(defaultLimit), 10))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response object
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// LOCALE HELPERS
// ═══════════════════════════════════════════════════════════

export const SUPPORTED_LOCALES = ["fr", "en", "es", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "fr";

/**
 * Get locale from request headers
 */
export function getLocaleFromHeaders(headers: Headers): SupportedLocale {
  // Check X-Locale header first (set by middleware)
  const xLocale = headers.get("x-locale");
  if (xLocale && SUPPORTED_LOCALES.includes(xLocale as SupportedLocale)) {
    return xLocale as SupportedLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = headers.get("accept-language");
  if (acceptLanguage) {
    const firstLang = acceptLanguage.split(",")[0];
    const langPart = firstLang?.split("-")[0];
    const preferred = langPart?.toLowerCase() ?? "";
    if (SUPPORTED_LOCALES.includes(preferred as SupportedLocale)) {
      return preferred as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Get locale from search params with fallback to headers
 */
export function getLocale(
  searchParams: URLSearchParams,
  headers?: Headers
): SupportedLocale {
  const paramLocale = searchParams.get("locale");
  if (paramLocale && SUPPORTED_LOCALES.includes(paramLocale as SupportedLocale)) {
    return paramLocale as SupportedLocale;
  }
  if (headers) {
    return getLocaleFromHeaders(headers);
  }
  return DEFAULT_LOCALE;
}

// ═══════════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════════

/**
 * Handle API errors consistently
 */
export function handleApiError(
  error: unknown,
  context = "API"
): NextResponse {
  console.error(`[${context}] Error:`, error);

  if (error instanceof ZodError) {
    return apiValidationError(error);
  }

  if (error instanceof Error) {
    // Handle specific Prisma errors
    if (error.message.includes("Unique constraint")) {
      return apiError("A record with this value already exists", 409);
    }
    if (error.message.includes("Foreign key constraint")) {
      return apiError("Invalid reference to related record", 400);
    }
    if (error.message.includes("Record to update not found")) {
      return apiNotFound("Record not found");
    }

    // Don't expose internal errors in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred";
    return apiError(message, 500);
  }

  return apiError("An unexpected error occurred", 500);
}

// ═══════════════════════════════════════════════════════════
// SLUG & REFERENCE HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending number if needed
 */
export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = generateSlug(text);
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${generateSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate order number (ORD-2025-0001)
 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `ORD-${year}-${padded}`;
}

/**
 * Generate quote reference (QT-2025-0001)
 */
export function generateQuoteReference(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `QT-${year}-${padded}`;
}

// ═══════════════════════════════════════════════════════════
// SORTING HELPERS
// ═══════════════════════════════════════════════════════════

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

/**
 * Parse sort params from URL
 * Format: ?sort=field:order (e.g., ?sort=createdAt:desc)
 */
export function getSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): SortParams {
  const sortParam = searchParams.get("sort");

  if (!sortParam) {
    return { field: defaultField, order: defaultOrder };
  }

  const parts = sortParam.split(":");
  const field = parts[0] ?? defaultField;
  const orderStr = parts[1];
  const validField = allowedFields.includes(field) ? field : defaultField;
  const order = orderStr === "asc" || orderStr === "desc" ? orderStr : defaultOrder;

  return { field: validField, order };
}

/**
 * Create Prisma orderBy from sort params
 */
export function createOrderBy(sort: SortParams): Record<string, "asc" | "desc"> {
  return { [sort.field]: sort.order };
}

// ═══════════════════════════════════════════════════════════
// CURRENCY HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Convert price from MAD to target currency
 */
export function convertPrice(priceMAD: number, rate: number): number {
  return Math.round(priceMAD * rate * 100) / 100;
}

/**
 * Format price with currency
 */
export function formatPrice(
  amount: number,
  symbol: string,
  position: "before" | "after" = "after",
  locale = "fr-MA"
): string {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return position === "before" ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}
