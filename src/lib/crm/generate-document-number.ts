import { prisma } from "@/lib/prisma";
import { SequenceResetType } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// B2B Document Numbering System - Hardened Version (FIX 3)
// ═══════════════════════════════════════════════════════════
//
// NEW READABLE FORMAT (Examples for 2026):
// - FACTURE:         FAC-2026-000001 (yearly reset)
// - FACTURE_ACOMPTE: FAAC-2026-000001 (yearly reset)
// - DEVIS:           DEV-2026-000001 (yearly reset)
// - BC:              BC-2026-000001 (yearly reset)
// - BL:              BL-2026-000001 (yearly reset)
// - PV:              PV-2026-000001 (yearly reset)
// - AVOIR:           AV-2026-000001 (yearly reset)
// - CLIENT:          CLI-000001 (continuous, never resets)
// - LEAD:            L-2026-000001 (yearly reset)
// - PROJECT:         PRJ-2026-000001 (yearly reset)
// - PAYMENT:         PAY-2026-000001 (yearly reset)
//
// Hardening Features (P0-9):
// - Atomic transactions with optimistic locking
// - Retry logic on conflicts (up to 3 retries)
// - Format validation for generated numbers
// - Gap detection and logging
// - Error handling with descriptive messages
// ═══════════════════════════════════════════════════════════

export type CRMDocType =
  | "FACTURE"
  | "FACTURE_ACOMPTE"
  | "DEVIS"
  | "BC"
  | "BL"
  | "RFT" // PV_RECEPTION
  | "AVOIR"
  | "CLIENT"
  | "LEAD"
  | "PROJECT"
  | "PAYMENT";

interface DocTypeConfig {
  prefix: string;
  resetType: SequenceResetType;
  padLength: number;
}

// ═══════════════════════════════════════════════════════════
// Configuration for each document type (FIX 3 - New Format)
// All B2B documents now use YEARLY reset with 6-digit sequence
// Format: PREFIX-YYYY-NNNNNN (e.g., FAC-2026-000001)
// ═══════════════════════════════════════════════════════════

const DOC_CONFIG: Record<CRMDocType, DocTypeConfig> = {
  FACTURE: { prefix: "FAC", resetType: SequenceResetType.YEARLY, padLength: 6 },
  FACTURE_ACOMPTE: { prefix: "FAAC", resetType: SequenceResetType.YEARLY, padLength: 6 },
  DEVIS: { prefix: "DEV", resetType: SequenceResetType.YEARLY, padLength: 6 },
  BC: { prefix: "BC", resetType: SequenceResetType.YEARLY, padLength: 6 },
  BL: { prefix: "BL", resetType: SequenceResetType.YEARLY, padLength: 6 },
  RFT: { prefix: "PV", resetType: SequenceResetType.YEARLY, padLength: 6 }, // PV_RECEPTION
  AVOIR: { prefix: "AV", resetType: SequenceResetType.YEARLY, padLength: 6 },
  CLIENT: { prefix: "CLI", resetType: SequenceResetType.CONTINUOUS, padLength: 6 },
  LEAD: { prefix: "L", resetType: SequenceResetType.YEARLY, padLength: 6 },
  PROJECT: { prefix: "PRJ", resetType: SequenceResetType.YEARLY, padLength: 6 },
  PAYMENT: { prefix: "PAY", resetType: SequenceResetType.YEARLY, padLength: 6 },
};

// ═══════════════════════════════════════════════════════════
// Error Classes
// ═══════════════════════════════════════════════════════════

export class DocumentNumberError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "DocumentNumberError";
  }
}

export class SequenceConflictError extends DocumentNumberError {
  constructor(type: string) {
    super(`Sequence conflict for type ${type}. Please retry.`, "SEQUENCE_CONFLICT");
  }
}

export class InvalidFormatError extends DocumentNumberError {
  constructor(number: string, expectedPattern: string) {
    super(`Generated number "${number}" does not match expected pattern: ${expectedPattern}`, "INVALID_FORMAT");
  }
}

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function getDateParts(date: Date = new Date()): { day: number; month: number; year: number; yearShort: string } {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const yearShort = String(year).slice(-2);
  return { day, month, year, yearShort };
}

function formatNumber(num: number, length: number): string {
  return String(num).padStart(length, "0");
}

// ═══════════════════════════════════════════════════════════
// Format Validation (FIX 3 - New Readable Format)
// ═══════════════════════════════════════════════════════════

// New format: PREFIX-YYYY-NNNNNN (e.g., FAC-2026-000001)
const FORMAT_PATTERNS: Record<SequenceResetType, RegExp> = {
  DAILY: /^[A-Z]{2,4}-\d{4}-\d{6}$/, // Not used anymore, but kept for backward compatibility
  MONTHLY: /^[A-Z]{1,4}-\d{4}-\d{6}$/, // Not used anymore
  YEARLY: /^[A-Z]{1,4}-\d{4}-\d{6}$/, // FAC-2026-000001, DEV-2026-000001
  CONTINUOUS: /^[A-Z]{2,3}-\d{6}$/, // CLI-000001
};

function validateFormat(number: string, resetType: SequenceResetType, prefix: string): boolean {
  const pattern = FORMAT_PATTERNS[resetType];
  if (!pattern.test(number)) {
    return false;
  }
  // Also verify prefix matches (before the first dash)
  const expectedStart = prefix + "-";
  return number.startsWith(expectedStart);
}

// ═══════════════════════════════════════════════════════════
// Gap Detection & Logging
// ═══════════════════════════════════════════════════════════

async function detectAndLogGaps(
  type: CRMDocType,
  expectedSequence: number,
  whereClause: { type: string; year: number; month?: number; day?: number }
): Promise<void> {
  // Check for unexpected gaps by querying expected previous sequence
  if (expectedSequence > 1) {
    const previousSequence = await prisma.cRMDocumentSequence.findFirst({
      where: whereClause,
    });

    if (previousSequence && previousSequence.lastNumber < expectedSequence - 1) {
      // Gap detected - log it (could send to audit log in production)
      console.warn(`[DocumentNumbering] Gap detected for ${type}: Expected ${expectedSequence - 1}, found ${previousSequence.lastNumber}`);

      // Optionally create an audit log entry for gaps
      try {
        await prisma.auditLog.create({
          data: {
            action: "sequence_gap",
            entity: "CRMDocumentSequence",
            entityId: previousSequence.id,
            description: `Sequence gap detected for ${type}: previous=${previousSequence.lastNumber}, next=${expectedSequence}`,
            category: "system",
          },
        });
      } catch {
        // Silent fail if audit log fails - don't break numbering
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Generate B2B Document Number (with hardening)
// ═══════════════════════════════════════════════════════════

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 50;

export async function generateB2BNumber(type: CRMDocType, date: Date = new Date()): Promise<string> {
  const config = DOC_CONFIG[type];
  if (!config) {
    throw new DocumentNumberError(`Unknown document type: ${type}`, "UNKNOWN_TYPE");
  }

  const { day, month, year, yearShort } = getDateParts(date);
  const dayStr = formatNumber(day, 2);
  const monthStr = formatNumber(month, 2);

  // Build unique constraint based on reset type
  let whereClause: { type: string; year: number; month?: number; day?: number };
  let createData: { type: string; prefix: string; resetType: SequenceResetType; year: number; month?: number; day?: number; lastNumber: number };

  switch (config.resetType) {
    case SequenceResetType.DAILY:
      whereClause = { type, year, month, day };
      createData = { type, prefix: config.prefix, resetType: config.resetType, year, month, day, lastNumber: 1 };
      break;
    case SequenceResetType.MONTHLY:
      whereClause = { type, year, month };
      createData = { type, prefix: config.prefix, resetType: config.resetType, year, month, lastNumber: 1 };
      break;
    case SequenceResetType.YEARLY:
      whereClause = { type, year };
      createData = { type, prefix: config.prefix, resetType: config.resetType, year, lastNumber: 1 };
      break;
    case SequenceResetType.CONTINUOUS:
      whereClause = { type, year: 0 };
      createData = { type, prefix: config.prefix, resetType: config.resetType, year: 0, lastNumber: 1 };
      break;
  }

  // Retry logic for race conditions
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Use transaction with isolation level for atomicity
      const sequence = await prisma.$transaction(async (tx) => {
        // Try to find existing sequence with lock
        const existing = await tx.cRMDocumentSequence.findFirst({
          where: whereClause,
        });

        if (existing) {
          // Increment existing sequence with optimistic locking
          const updated = await tx.cRMDocumentSequence.update({
            where: { id: existing.id },
            data: {
              lastNumber: { increment: 1 },
              updatedAt: new Date(), // Force update timestamp
            },
          });

          // Verify the update was successful (optimistic lock check)
          if (updated.lastNumber !== existing.lastNumber + 1) {
            throw new SequenceConflictError(type);
          }

          return updated;
        } else {
          // Create new sequence
          return await tx.cRMDocumentSequence.create({
            data: createData,
          });
        }
      }, {
        // Use serializable isolation for strict ordering
        isolationLevel: "Serializable",
      });

      // Detect gaps (non-blocking)
      detectAndLogGaps(type, sequence.lastNumber, whereClause).catch(() => {
        // Silent fail - gap detection is informational only
      });

      const seqNum = formatNumber(sequence.lastNumber, config.padLength);

      // Build the final number in new readable format: PREFIX-YYYY-NNNNNN
      let generatedNumber: string;
      switch (config.resetType) {
        case SequenceResetType.DAILY:
          // Converted to yearly format for consistency
          generatedNumber = `${config.prefix}-${year}-${seqNum}`;
          break;
        case SequenceResetType.MONTHLY:
          // Converted to yearly format for consistency
          generatedNumber = `${config.prefix}-${year}-${seqNum}`;
          break;
        case SequenceResetType.YEARLY:
          // Standard format: PREFIX-YYYY-NNNNNN
          generatedNumber = `${config.prefix}-${year}-${seqNum}`;
          break;
        case SequenceResetType.CONTINUOUS:
          // Format: PREFIX-NNNNNN (no year for continuous)
          generatedNumber = `${config.prefix}-${seqNum}`;
          break;
      }

      // Validate generated number format
      if (!validateFormat(generatedNumber, config.resetType, config.prefix)) {
        throw new InvalidFormatError(generatedNumber, FORMAT_PATTERNS[config.resetType].source);
      }

      return generatedNumber;

    } catch (error) {
      lastError = error as Error;

      // Check if it's a retryable error
      if (
        error instanceof SequenceConflictError ||
        (error instanceof Error && error.message.includes("Unique constraint"))
      ) {
        // Wait before retry with exponential backoff
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
          continue;
        }
      }

      // Non-retryable error, throw immediately
      throw error;
    }
  }

  // All retries exhausted
  throw lastError || new DocumentNumberError(`Failed to generate ${type} number after ${MAX_RETRIES} attempts`, "MAX_RETRIES_EXCEEDED");
}

// ═══════════════════════════════════════════════════════════
// Preview Next B2B Number (without incrementing)
// ═══════════════════════════════════════════════════════════

export async function previewB2BNumber(type: CRMDocType, date: Date = new Date()): Promise<string> {
  const config = DOC_CONFIG[type];
  if (!config) {
    throw new DocumentNumberError(`Unknown document type: ${type}`, "UNKNOWN_TYPE");
  }

  const { day, month, year, yearShort } = getDateParts(date);
  const dayStr = formatNumber(day, 2);
  const monthStr = formatNumber(month, 2);

  // Build where clause based on reset type
  let whereClause: { type: string; year: number; month?: number; day?: number };

  switch (config.resetType) {
    case SequenceResetType.DAILY:
      whereClause = { type, year, month, day };
      break;
    case SequenceResetType.MONTHLY:
      whereClause = { type, year, month };
      break;
    case SequenceResetType.YEARLY:
      whereClause = { type, year };
      break;
    case SequenceResetType.CONTINUOUS:
      whereClause = { type, year: 0 };
      break;
  }

  const existing = await prisma.cRMDocumentSequence.findFirst({
    where: whereClause,
  });

  const nextNum = (existing?.lastNumber ?? 0) + 1;
  const seqNum = formatNumber(nextNum, config.padLength);

  // Build the preview number in new readable format: PREFIX-YYYY-NNNNNN
  switch (config.resetType) {
    case SequenceResetType.DAILY:
    case SequenceResetType.MONTHLY:
    case SequenceResetType.YEARLY:
      return `${config.prefix}-${year}-${seqNum}`;
    case SequenceResetType.CONTINUOUS:
      return `${config.prefix}-${seqNum}`;
  }
}

// ═══════════════════════════════════════════════════════════
// Get Current Sequence Count
// ═══════════════════════════════════════════════════════════

export async function getCurrentB2BSequence(type: CRMDocType, date: Date = new Date()): Promise<number> {
  const config = DOC_CONFIG[type];
  if (!config) {
    throw new DocumentNumberError(`Unknown document type: ${type}`, "UNKNOWN_TYPE");
  }

  const { day, month, year } = getDateParts(date);

  let whereClause: { type: string; year: number; month?: number; day?: number };

  switch (config.resetType) {
    case SequenceResetType.DAILY:
      whereClause = { type, year, month, day };
      break;
    case SequenceResetType.MONTHLY:
      whereClause = { type, year, month };
      break;
    case SequenceResetType.YEARLY:
      whereClause = { type, year };
      break;
    case SequenceResetType.CONTINUOUS:
      whereClause = { type, year: 0 };
      break;
  }

  const existing = await prisma.cRMDocumentSequence.findFirst({
    where: whereClause,
  });

  return existing?.lastNumber ?? 0;
}

// ═══════════════════════════════════════════════════════════
// Parse Document Number (FIX 3 - New Readable Format)
// ═══════════════════════════════════════════════════════════

export function parseB2BNumber(documentNumber: string): {
  type: CRMDocType | null;
  prefix: string;
  day?: number;
  month?: number;
  year?: number;
  sequence: number;
} | null {
  // New format: PREFIX-YYYY-NNNNNN or PREFIX-NNNNNN (for continuous)
  const parts = documentNumber.split("-");

  if (parts.length < 2) {
    // Try legacy format parsing
    return parseLegacyB2BNumber(documentNumber);
  }

  const prefix = parts[0];

  // Find matching document type by prefix
  let matchedDocType: CRMDocType | null = null;
  for (const [docType, config] of Object.entries(DOC_CONFIG) as [CRMDocType, DocTypeConfig][]) {
    if (config.prefix === prefix) {
      matchedDocType = docType;
      break;
    }
  }

  if (!matchedDocType) {
    return null;
  }

  const config = DOC_CONFIG[matchedDocType];

  if (config.resetType === SequenceResetType.CONTINUOUS) {
    // Format: PREFIX-NNNNNN (e.g., CLI-000001)
    if (parts.length === 2) {
      const sequence = parseInt(parts[1], 10);
      if (!isNaN(sequence)) {
        return { type: matchedDocType, prefix, sequence };
      }
    }
  } else {
    // Format: PREFIX-YYYY-NNNNNN (e.g., FAC-2026-000001)
    if (parts.length === 3) {
      const year = parseInt(parts[1], 10);
      const sequence = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(sequence) && year >= 2020 && year <= 2099) {
        return { type: matchedDocType, prefix, year, sequence };
      }
    }
  }

  return null;
}

/**
 * Parse legacy document numbers (for backward compatibility)
 * Old formats: FTB0501260001, D01260001, etc.
 */
function parseLegacyB2BNumber(documentNumber: string): {
  type: CRMDocType | null;
  prefix: string;
  day?: number;
  month?: number;
  year?: number;
  sequence: number;
} | null {
  // Legacy prefix mapping
  const legacyPrefixes: Record<string, CRMDocType> = {
    "FTB": "FACTURE",
    "FA": "FACTURE_ACOMPTE",
    "D": "DEVIS",
    "BC": "BC",
    "BL": "BL",
    "RFT": "RFT",
    "AV": "AVOIR",
    "CLI": "CLIENT",
    "L": "LEAD",
    "PRJ": "PROJECT",
  };

  for (const [prefix, docType] of Object.entries(legacyPrefixes)) {
    if (!documentNumber.startsWith(prefix)) continue;

    const rest = documentNumber.slice(prefix.length);

    // Daily format: DDMMYYNNNN (10 digits)
    if (rest.length === 10 && (docType === "FACTURE" || docType === "FACTURE_ACOMPTE")) {
      const day = parseInt(rest.slice(0, 2), 10);
      const month = parseInt(rest.slice(2, 4), 10);
      const yearShort = parseInt(rest.slice(4, 6), 10);
      const sequence = parseInt(rest.slice(6), 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(yearShort) && !isNaN(sequence)) {
        return { type: docType, prefix, day, month, year: 2000 + yearShort, sequence };
      }
    }

    // Monthly format: MMYYNNNN (8 digits)
    if (rest.length === 8) {
      const month = parseInt(rest.slice(0, 2), 10);
      const yearShort = parseInt(rest.slice(2, 4), 10);
      const sequence = parseInt(rest.slice(4), 10);
      if (!isNaN(month) && !isNaN(yearShort) && !isNaN(sequence)) {
        return { type: docType, prefix, month, year: 2000 + yearShort, sequence };
      }
    }

    // Yearly format: YYNNNN (6 digits)
    if (rest.length === 6 && docType === "PROJECT") {
      const yearShort = parseInt(rest.slice(0, 2), 10);
      const sequence = parseInt(rest.slice(2), 10);
      if (!isNaN(yearShort) && !isNaN(sequence)) {
        return { type: docType, prefix, year: 2000 + yearShort, sequence };
      }
    }

    // Continuous format: NNNN (4 digits)
    if (rest.length === 4 && docType === "CLIENT") {
      const sequence = parseInt(rest, 10);
      if (!isNaN(sequence)) {
        return { type: docType, prefix, sequence };
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// Validate Document Number (supports both new and legacy formats)
// ═══════════════════════════════════════════════════════════

export function validateDocumentNumber(number: string): {
  valid: boolean;
  type?: CRMDocType;
  isLegacyFormat?: boolean;
  error?: string
} {
  const parsed = parseB2BNumber(number);

  if (!parsed) {
    return { valid: false, error: "Invalid document number format" };
  }

  if (!parsed.type) {
    return { valid: false, error: "Unknown document type prefix" };
  }

  // Determine if it's legacy format (no dashes)
  const isLegacyFormat = !number.includes("-");

  // Validate date parts are within valid ranges
  if (parsed.day !== undefined && (parsed.day < 1 || parsed.day > 31)) {
    return { valid: false, type: parsed.type, isLegacyFormat, error: "Invalid day in document number" };
  }

  if (parsed.month !== undefined && (parsed.month < 1 || parsed.month > 12)) {
    return { valid: false, type: parsed.type, isLegacyFormat, error: "Invalid month in document number" };
  }

  if (parsed.year !== undefined && (parsed.year < 2020 || parsed.year > 2099)) {
    return { valid: false, type: parsed.type, isLegacyFormat, error: "Invalid year in document number" };
  }

  // New format supports up to 999999, legacy supports up to 9999
  const maxSequence = isLegacyFormat ? 9999 : 999999;
  if (parsed.sequence < 1 || parsed.sequence > maxSequence) {
    return { valid: false, type: parsed.type, isLegacyFormat, error: "Invalid sequence number" };
  }

  return { valid: true, type: parsed.type, isLegacyFormat };
}

/**
 * Check if a document number uses the new readable format
 */
export function isNewNumberFormat(number: string): boolean {
  return number.includes("-");
}

// ═══════════════════════════════════════════════════════════
// Map old CRMDocumentType to new CRMDocType
// ═══════════════════════════════════════════════════════════

export function mapDocumentType(oldType: string): CRMDocType {
  const mapping: Record<string, CRMDocType> = {
    DEVIS: "DEVIS",
    BON_COMMANDE: "BC",
    BON_LIVRAISON: "BL",
    PV_RECEPTION: "RFT",
    FACTURE: "FACTURE",
    FACTURE_ACOMPTE: "FACTURE_ACOMPTE",
    AVOIR: "AVOIR",
  };
  return mapping[oldType] || (oldType as CRMDocType);
}

// ═══════════════════════════════════════════════════════════
// E-Commerce Number Generators (unchanged format)
// ═══════════════════════════════════════════════════════════

/**
 * Generate E-Commerce Order Number
 * Format: ORD-YYYY-NNNN (e.g., ORD-2025-0001)
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Use retry logic for e-commerce as well
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const sequence = await prisma.documentSequence.upsert({
        where: {
          type_year: {
            type: "ORDER",
            year,
          },
        },
        update: {
          lastNumber: { increment: 1 },
        },
        create: {
          type: "ORDER",
          prefix: "ORD",
          year,
          lastNumber: 1,
        },
      });

      return `ORD-${year}-${formatNumber(sequence.lastNumber, 4)}`;
    } catch (error) {
      if (attempt < MAX_RETRIES && error instanceof Error && error.message.includes("Unique constraint")) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        continue;
      }
      throw error;
    }
  }

  throw new DocumentNumberError("Failed to generate order number after retries", "MAX_RETRIES_EXCEEDED");
}

/**
 * Generate E-Commerce Quote Number
 * Format: QT-YYYY-NNNN (e.g., QT-2025-0001)
 */
export async function generateEcomQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const sequence = await prisma.documentSequence.upsert({
        where: {
          type_year: {
            type: "ECOM_QUOTE",
            year,
          },
        },
        update: {
          lastNumber: { increment: 1 },
        },
        create: {
          type: "ECOM_QUOTE",
          prefix: "QT",
          year,
          lastNumber: 1,
        },
      });

      return `QT-${year}-${formatNumber(sequence.lastNumber, 4)}`;
    } catch (error) {
      if (attempt < MAX_RETRIES && error instanceof Error && error.message.includes("Unique constraint")) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        continue;
      }
      throw error;
    }
  }

  throw new DocumentNumberError("Failed to generate quote number after retries", "MAX_RETRIES_EXCEEDED");
}

// ═══════════════════════════════════════════════════════════
// Sequence Health Check
// ═══════════════════════════════════════════════════════════

export async function checkSequenceHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  summary: Record<CRMDocType, { current: number; lastUpdated: Date | null }>;
}> {
  const issues: string[] = [];
  const summary: Record<string, { current: number; lastUpdated: Date | null }> = {};

  const date = new Date();
  const { day, month, year } = getDateParts(date);

  for (const [docType, config] of Object.entries(DOC_CONFIG) as [CRMDocType, DocTypeConfig][]) {
    let whereClause: { type: string; year: number; month?: number; day?: number };

    switch (config.resetType) {
      case SequenceResetType.DAILY:
        whereClause = { type: docType, year, month, day };
        break;
      case SequenceResetType.MONTHLY:
        whereClause = { type: docType, year, month };
        break;
      case SequenceResetType.YEARLY:
        whereClause = { type: docType, year };
        break;
      case SequenceResetType.CONTINUOUS:
        whereClause = { type: docType, year: 0 };
        break;
    }

    const sequence = await prisma.cRMDocumentSequence.findFirst({
      where: whereClause,
    });

    summary[docType] = {
      current: sequence?.lastNumber ?? 0,
      lastUpdated: sequence?.updatedAt ?? null,
    };

    // Check for stale daily sequences (should have activity)
    if (config.resetType === SequenceResetType.DAILY && sequence) {
      const hoursSinceUpdate = sequence.updatedAt
        ? (Date.now() - sequence.updatedAt.getTime()) / (1000 * 60 * 60)
        : null;

      if (hoursSinceUpdate && hoursSinceUpdate > 24) {
        issues.push(`${docType}: Sequence unchanged for over 24 hours`);
      }
    }
  }

  return {
    healthy: issues.length === 0,
    issues,
    summary: summary as Record<CRMDocType, { current: number; lastUpdated: Date | null }>,
  };
}
