import { prisma } from "@/lib/prisma";
import { CRMDocumentType, CRMDocumentStatus } from "@prisma/client";
import { generateB2BNumber, mapDocumentType } from "./generate-document-number";

// ═══════════════════════════════════════════════════════════
// Document Service - FIX 2: ISSUED Flow + Locking
// ═══════════════════════════════════════════════════════════
//
// Handles:
// - Document issuance (draft → official)
// - Document locking (immutability after issuance)
// - Edit guards for locked documents
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Error Classes
// ═══════════════════════════════════════════════════════════

export class DocumentServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "DocumentServiceError";
  }
}

export class DocumentLockedError extends DocumentServiceError {
  constructor(documentId: string, documentNumber: string) {
    super(
      `Document ${documentNumber} is locked and cannot be modified.`,
      "DOCUMENT_LOCKED"
    );
  }
}

export class DocumentNotFoundError extends DocumentServiceError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found.`, "DOCUMENT_NOT_FOUND");
  }
}

export class InvalidDocumentStateError extends DocumentServiceError {
  constructor(message: string) {
    super(message, "INVALID_DOCUMENT_STATE");
  }
}

// ═══════════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════════

export interface IssueDocumentResult {
  success: boolean;
  document: {
    id: string;
    number: string;
    type: CRMDocumentType;
    status: CRMDocumentStatus;
    isLocked: boolean;
    issuedAt: Date;
  };
  previousNumber?: string;
}

export interface DocumentLockStatus {
  isLocked: boolean;
  isDraft: boolean;
  issuedAt: Date | null;
  issuedById: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canIssue: boolean;
}

// ═══════════════════════════════════════════════════════════
// Issue Document (Draft → Official)
// ═══════════════════════════════════════════════════════════

/**
 * Issue a document - converts from draft to official
 * - Generates official document number
 * - Sets issuedAt timestamp
 * - Locks the document (isLocked = true)
 * - Updates status to SENT (for quotes/invoices)
 */
export async function issueDocument(
  documentId: string,
  userId: string,
  options?: {
    sendEmail?: boolean;
    generatePdf?: boolean;
  }
): Promise<IssueDocumentResult> {
  // Fetch the document
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new DocumentNotFoundError(documentId);
  }

  // Check if already issued
  if (document.isLocked || !document.isDraft) {
    throw new InvalidDocumentStateError(
      `Document ${document.number} has already been issued.`
    );
  }

  // Check if document is in valid state for issuance
  if (document.status !== CRMDocumentStatus.DRAFT) {
    throw new InvalidDocumentStateError(
      `Document must be in DRAFT status to be issued. Current status: ${document.status}`
    );
  }

  // Generate official document number
  const docType = mapDocumentType(document.type);
  const officialNumber = await generateB2BNumber(docType);
  const previousNumber = document.number;

  // Determine new status based on document type
  let newStatus: CRMDocumentStatus;
  switch (document.type) {
    case CRMDocumentType.DEVIS:
    case CRMDocumentType.FACTURE:
    case CRMDocumentType.FACTURE_ACOMPTE:
    case CRMDocumentType.AVOIR:
      newStatus = CRMDocumentStatus.SENT;
      break;
    case CRMDocumentType.BON_COMMANDE:
      newStatus = CRMDocumentStatus.CONFIRMED;
      break;
    case CRMDocumentType.BON_LIVRAISON:
      newStatus = CRMDocumentStatus.DELIVERED;
      break;
    case CRMDocumentType.PV_RECEPTION:
      newStatus = CRMDocumentStatus.DRAFT; // PV stays draft until signed
      break;
    default:
      newStatus = CRMDocumentStatus.SENT;
  }

  // Update document in transaction
  const updatedDocument = await prisma.$transaction(async (tx) => {
    // Update document
    const doc = await tx.cRMDocument.update({
      where: { id: documentId },
      data: {
        number: officialNumber,
        draftNumber: previousNumber, // Store the old draft number
        isDraft: false,
        isLocked: true,
        issuedAt: new Date(),
        issuedById: userId,
        status: newStatus,
      },
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId,
        action: "issue",
        entity: "CRMDocument",
        entityId: documentId,
        description: `Document issued: ${previousNumber} → ${officialNumber}`,
        documentNumber: officialNumber,
        documentType: document.type,
        documentAmount: document.totalTTC,
        category: "document",
        severity: "info",
        changes: {
          number: { old: previousNumber, new: officialNumber },
          isDraft: { old: true, new: false },
          isLocked: { old: false, new: true },
          status: { old: document.status, new: newStatus },
        },
      },
    });

    return doc;
  });

  return {
    success: true,
    document: {
      id: updatedDocument.id,
      number: updatedDocument.number,
      type: updatedDocument.type,
      status: updatedDocument.status,
      isLocked: updatedDocument.isLocked,
      issuedAt: updatedDocument.issuedAt!,
    },
    previousNumber,
  };
}

// ═══════════════════════════════════════════════════════════
// Check Document Lock Status
// ═══════════════════════════════════════════════════════════

/**
 * Get the lock status of a document
 */
export async function getDocumentLockStatus(
  documentId: string
): Promise<DocumentLockStatus> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: {
      isLocked: true,
      isDraft: true,
      issuedAt: true,
      issuedById: true,
      status: true,
    },
  });

  if (!document) {
    throw new DocumentNotFoundError(documentId);
  }

  // Determine what actions are allowed
  const canEdit = !document.isLocked && document.isDraft;
  const canDelete = !document.isLocked && document.isDraft;
  const canIssue =
    !document.isLocked && document.isDraft && document.status === "DRAFT";

  return {
    isLocked: document.isLocked,
    isDraft: document.isDraft,
    issuedAt: document.issuedAt,
    issuedById: document.issuedById,
    canEdit,
    canDelete,
    canIssue,
  };
}

// ═══════════════════════════════════════════════════════════
// Edit Guard - Prevent Modification of Locked Documents
// ═══════════════════════════════════════════════════════════

/**
 * Guard function to prevent editing locked documents
 * Throws DocumentLockedError if document is locked
 */
export async function guardDocumentEdit(documentId: string): Promise<void> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      number: true,
      isLocked: true,
      isDraft: true,
    },
  });

  if (!document) {
    throw new DocumentNotFoundError(documentId);
  }

  if (document.isLocked || !document.isDraft) {
    throw new DocumentLockedError(document.id, document.number);
  }
}

/**
 * Guard function for document deletion
 */
export async function guardDocumentDelete(documentId: string): Promise<void> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      number: true,
      isLocked: true,
      isDraft: true,
      status: true,
    },
  });

  if (!document) {
    throw new DocumentNotFoundError(documentId);
  }

  if (document.isLocked || !document.isDraft) {
    throw new DocumentLockedError(document.id, document.number);
  }

  // Additional check: don't allow deletion of non-draft status documents
  if (document.status !== "DRAFT") {
    throw new InvalidDocumentStateError(
      `Cannot delete document ${document.number} with status ${document.status}`
    );
  }
}

// ═══════════════════════════════════════════════════════════
// Create Draft Document
// ═══════════════════════════════════════════════════════════

/**
 * Generate a draft document number
 * Format: DRAFT-{type}-{timestamp}
 */
export function generateDraftNumber(type: CRMDocumentType): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `DRAFT-${type}-${timestamp}`;
}

/**
 * Check if a document number is a draft number
 */
export function isDraftNumber(number: string): boolean {
  return number.startsWith("DRAFT-");
}

// ═══════════════════════════════════════════════════════════
// Unlock Document (Admin Only - Emergency)
// ═══════════════════════════════════════════════════════════

/**
 * Unlock a document - ADMIN ONLY for emergency corrections
 * This should be heavily audited and rarely used
 */
export async function unlockDocument(
  documentId: string,
  adminUserId: string,
  reason: string
): Promise<void> {
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    select: { id: true, number: true, isLocked: true },
  });

  if (!document) {
    throw new DocumentNotFoundError(documentId);
  }

  if (!document.isLocked) {
    throw new InvalidDocumentStateError(
      `Document ${document.number} is not locked.`
    );
  }

  await prisma.$transaction(async (tx) => {
    // Unlock the document
    await tx.cRMDocument.update({
      where: { id: documentId },
      data: { isLocked: false },
    });

    // Create critical audit log entry
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "unlock",
        entity: "CRMDocument",
        entityId: documentId,
        description: `ADMIN ACTION: Document ${document.number} unlocked. Reason: ${reason}`,
        documentNumber: document.number,
        category: "document",
        severity: "critical",
        changes: {
          isLocked: { old: true, new: false },
          unlockReason: reason,
        },
      },
    });
  });
}

// ═══════════════════════════════════════════════════════════
// Batch Operations
// ═══════════════════════════════════════════════════════════

/**
 * Issue multiple documents at once
 */
export async function issueMultipleDocuments(
  documentIds: string[],
  userId: string
): Promise<{ successful: IssueDocumentResult[]; failed: { id: string; error: string }[] }> {
  const results: IssueDocumentResult[] = [];
  const failures: { id: string; error: string }[] = [];

  for (const docId of documentIds) {
    try {
      const result = await issueDocument(docId, userId);
      results.push(result);
    } catch (error) {
      failures.push({
        id: docId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { successful: results, failed: failures };
}
