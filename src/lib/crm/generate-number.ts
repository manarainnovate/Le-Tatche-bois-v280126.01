import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Document Type Prefixes
// ═══════════════════════════════════════════════════════════

const PREFIXES: Record<string, string> = {
  LEAD: "L",
  CLIENT: "CLI",
  PROJECT: "PRJ",
  DEVIS: "D",
  BON_COMMANDE: "BC",
  BON_LIVRAISON: "BL",
  PV_RECEPTION: "PV",
  FACTURE: "F",
  AVOIR: "A",
  PAYMENT: "PAY",
};

// ═══════════════════════════════════════════════════════════
// Generate Document Number
// ═══════════════════════════════════════════════════════════

export async function generateNumber(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = PREFIXES[type] || type.substring(0, 3).toUpperCase();

  // Use upsert to atomically increment the sequence
  const sequence = await prisma.documentSequence.upsert({
    where: {
      type_year: {
        type,
        year,
      },
    },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
    create: {
      type,
      prefix,
      year,
      lastNumber: 1,
    },
  });

  const number = String(sequence.lastNumber).padStart(6, "0");
  return `${prefix}-${year}-${number}`;
}

// ═══════════════════════════════════════════════════════════
// Get Current Sequence (without incrementing)
// ═══════════════════════════════════════════════════════════

export async function getCurrentSequence(type: string): Promise<number> {
  const year = new Date().getFullYear();

  const sequence = await prisma.documentSequence.findUnique({
    where: {
      type_year: {
        type,
        year,
      },
    },
  });

  return sequence?.lastNumber ?? 0;
}

// ═══════════════════════════════════════════════════════════
// Preview Next Number (without incrementing)
// ═══════════════════════════════════════════════════════════

export async function previewNextNumber(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = PREFIXES[type] || type.substring(0, 3).toUpperCase();
  const currentNumber = await getCurrentSequence(type);
  const nextNumber = String(currentNumber + 1).padStart(6, "0");
  return `${prefix}-${year}-${nextNumber}`;
}
