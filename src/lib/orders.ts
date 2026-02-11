import { prisma } from "@/lib/prisma";

/**
 * Generate Order ID in format: TB + DDMMYY + 5-digit sequence
 * Example: TB1102260001 (11 Feb 2026, sequence 1)
 *
 * Uses database for counter persistence (production-safe)
 */
export async function generateOrderId(): Promise<string> {
  const now = new Date();

  // Format: DDMMYY
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;

  // Use DocumentSequence model to persist counter
  // Type: ORDER-DDMMYY (e.g., ORDER-110226)
  const sequenceType = `ORDER-${dateStr}`;
  const currentYear = now.getFullYear();

  // Atomic increment using upsert
  const sequence = await prisma.documentSequence.upsert({
    where: {
      type_year: {
        type: sequenceType,
        year: currentYear,
      },
    },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
    create: {
      type: sequenceType,
      prefix: "TB",
      year: currentYear,
      lastNumber: 1,
    },
  });

  // Format: TB + DDMMYY + 5-digit number (padded with zeros)
  const orderNumber = String(sequence.lastNumber).padStart(5, "0");

  return `TB${dateStr}${orderNumber}`;
}

/**
 * Parse order ID to get date and sequence
 */
export function parseOrderId(orderId: string): { date: string; sequence: number } | null {
  const match = orderId.match(/^TB(\d{6})(\d{5})$/);
  if (!match || !match[1] || !match[2]) return null;

  const dateStr = match[1];
  const sequence = parseInt(match[2], 10);

  const day = dateStr.slice(0, 2);
  const month = dateStr.slice(2, 4);
  const year = `20${dateStr.slice(4, 6)}`;

  return {
    date: `${day}/${month}/${year}`,
    sequence,
  };
}
