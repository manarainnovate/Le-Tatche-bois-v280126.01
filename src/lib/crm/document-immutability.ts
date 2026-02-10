import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════
// P0-4: Document Immutability & Integrity
// ═══════════════════════════════════════════════════════════
// Ensures issued documents cannot be modified and provides
// integrity verification through content hashing
// ═══════════════════════════════════════════════════════════

/**
 * Check if a document can be edited
 * Returns { canEdit: boolean, reason?: string }
 */
export async function canEditDocument(documentId: string): Promise<{
  canEdit: boolean;
  reason?: string;
}> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: {
      isLocked: true,
      isDraft: true,
      issuedAt: true,
      type: true,
      status: true,
      payments: {
        select: { id: true },
        take: 1,
      },
      children: {
        select: { id: true, type: true },
        take: 1,
      },
    },
  });

  if (!document) {
    return { canEdit: false, reason: "Document non trouvé" };
  }

  // Locked documents cannot be edited
  if (document.isLocked) {
    return {
      canEdit: false,
      reason: "Ce document a été émis et verrouillé. Il ne peut plus être modifié.",
    };
  }

  // Non-draft documents cannot be edited
  if (!document.isDraft) {
    return {
      canEdit: false,
      reason: "Ce document a un numéro officiel et ne peut plus être modifié.",
    };
  }

  // Documents with payments cannot be edited
  if (document.payments.length > 0) {
    return {
      canEdit: false,
      reason: "Ce document a des paiements enregistrés et ne peut plus être modifié.",
    };
  }

  // Documents with children (conversions) cannot be edited
  if (document.children.length > 0) {
    const childType = document.children[0].type;
    return {
      canEdit: false,
      reason: `Ce document a été converti en ${childType} et ne peut plus être modifié.`,
    };
  }

  return { canEdit: true };
}

/**
 * Generate content hash for document integrity verification
 */
export function generateDocumentHash(document: {
  type: string;
  number: string;
  clientId: string;
  clientName: string;
  date: Date;
  items: Array<{
    designation: string;
    quantity: number | string;
    unitPriceHT: number | string;
    tvaRate: number | string;
    totalTTC: number | string;
  }>;
  totalHT: number | string;
  totalTVA: number | string;
  totalTTC: number | string;
}): string {
  const content = JSON.stringify({
    type: document.type,
    number: document.number,
    clientId: document.clientId,
    clientName: document.clientName,
    date: document.date.toISOString(),
    items: document.items.map((item) => ({
      designation: item.designation,
      quantity: String(item.quantity),
      unitPriceHT: String(item.unitPriceHT),
      tvaRate: String(item.tvaRate),
      totalTTC: String(item.totalTTC),
    })),
    totalHT: String(document.totalHT),
    totalTVA: String(document.totalTVA),
    totalTTC: String(document.totalTTC),
  });

  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Verify document integrity by comparing current content with stored hash
 */
export async function verifyDocumentIntegrity(documentId: string): Promise<{
  isValid: boolean;
  storedHash?: string;
  currentHash?: string;
  reason?: string;
}> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!document) {
    return { isValid: false, reason: "Document non trouvé" };
  }

  // Only verify issued documents
  if (document.isDraft) {
    return { isValid: true, reason: "Document brouillon - pas de vérification requise" };
  }

  const storedHash = document.archivedPdfHash;
  if (!storedHash) {
    return {
      isValid: false,
      reason: "Aucun hash d'intégrité stocké pour ce document",
    };
  }

  const currentHash = generateDocumentHash({
    type: document.type,
    number: document.number,
    clientId: document.clientId,
    clientName: document.clientName,
    date: document.date,
    items: document.items.map((item) => ({
      designation: item.designation,
      quantity: Number(item.quantity),
      unitPriceHT: Number(item.unitPriceHT),
      tvaRate: Number(item.tvaRate),
      totalTTC: Number(item.totalTTC),
    })),
    totalHT: Number(document.totalHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
  });

  return {
    isValid: storedHash === currentHash,
    storedHash,
    currentHash,
    reason: storedHash === currentHash ? "Document intègre" : "ALERTE: Le document a été modifié!",
  };
}

/**
 * Lock a document and archive its hash
 */
export async function lockDocument(
  documentId: string,
  pdfUrl?: string
): Promise<{
  success: boolean;
  document?: {
    id: string;
    number: string;
    hash: string;
    lockedAt: Date;
  };
  error?: string;
}> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!document) {
    return { success: false, error: "Document non trouvé" };
  }

  if (document.isLocked) {
    return { success: false, error: "Document déjà verrouillé" };
  }

  const hash = generateDocumentHash({
    type: document.type,
    number: document.number,
    clientId: document.clientId,
    clientName: document.clientName,
    date: document.date,
    items: document.items.map((item) => ({
      designation: item.designation,
      quantity: Number(item.quantity),
      unitPriceHT: Number(item.unitPriceHT),
      tvaRate: Number(item.tvaRate),
      totalTTC: Number(item.totalTTC),
    })),
    totalHT: Number(document.totalHT),
    totalTVA: Number(document.totalTVA),
    totalTTC: Number(document.totalTTC),
  });

  const now = new Date();
  const updated = await prisma.cRMDocument.update({
    where: { id: documentId },
    data: {
      isLocked: true,
      archivedPdfHash: hash,
      archivedPdfUrl: pdfUrl,
      archivedAt: now,
    },
    select: {
      id: true,
      number: true,
    },
  });

  return {
    success: true,
    document: {
      id: updated.id,
      number: updated.number,
      hash,
      lockedAt: now,
    },
  };
}

/**
 * Get document edit history from audit logs
 */
export async function getDocumentEditHistory(documentId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "CRMDocument",
      entityId: documentId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    description: log.description,
    changes: log.changes,
    user: log.user,
    timestamp: log.createdAt,
  }));
}
