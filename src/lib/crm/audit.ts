import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// P0-4: Audit Log System
// ═══════════════════════════════════════════════════════════
// Creates immutable audit trail for CRM operations
// ═══════════════════════════════════════════════════════════

export interface AuditLogInput {
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  documentNumber?: string;
  documentType?: string;
  documentAmount?: number;
  pdfSnapshot?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  category?: "financial" | "document" | "client" | "system";
  severity?: "info" | "warning" | "critical";
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: input.userId,
        userEmail: input.userEmail,
        userName: input.userName,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        description: input.description,
        changes: input.changes as object,
        documentNumber: input.documentNumber,
        documentType: input.documentType,
        documentAmount: input.documentAmount ? Number(input.documentAmount) : null,
        pdfSnapshot: input.pdfSnapshot,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        sessionId: input.sessionId,
        category: input.category,
        severity: input.severity || "info",
      },
    });
    return log;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failure shouldn't block operations
    return null;
  }
}

/**
 * Log document creation
 */
export async function auditDocumentCreation(
  documentId: string,
  documentNumber: string,
  documentType: string,
  amount: number,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "create",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Document ${documentType} ${documentNumber} créé`,
    documentNumber,
    documentType,
    documentAmount: amount,
    category: "document",
    severity: "info",
  });
}

/**
 * Log document issuance (official number assigned)
 */
export async function auditDocumentIssuance(
  documentId: string,
  documentNumber: string,
  documentType: string,
  amount: number,
  pdfUrl?: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "issue",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Document ${documentType} ${documentNumber} émis officiellement`,
    documentNumber,
    documentType,
    documentAmount: amount,
    pdfSnapshot: pdfUrl,
    category: "financial",
    severity: "critical", // Financial documents issuance is critical
  });
}

/**
 * Log document modification
 */
export async function auditDocumentUpdate(
  documentId: string,
  documentNumber: string,
  documentType: string,
  changes: Record<string, { old: unknown; new: unknown }>,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "update",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Document ${documentType} ${documentNumber} modifié`,
    documentNumber,
    documentType,
    changes,
    category: "document",
    severity: "warning",
  });
}

/**
 * Log payment recording
 */
export async function auditPaymentRecorded(
  paymentId: string,
  paymentNumber: string,
  documentNumber: string | null,
  amount: number,
  clientName: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "payment",
    entity: "CRMPayment",
    entityId: paymentId,
    description: documentNumber
      ? `Paiement ${paymentNumber} de ${amount} DH reçu pour ${documentNumber}`
      : `Paiement ${paymentNumber} de ${amount} DH reçu pour ${clientName}`,
    documentNumber: documentNumber || undefined,
    documentAmount: amount,
    category: "financial",
    severity: "critical",
  });
}

/**
 * Log document conversion
 */
export async function auditDocumentConversion(
  sourceId: string,
  sourceNumber: string,
  sourceType: string,
  targetId: string,
  targetNumber: string,
  targetType: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "convert",
    entity: "CRMDocument",
    entityId: targetId,
    description: `${sourceType} ${sourceNumber} converti en ${targetType} ${targetNumber}`,
    documentNumber: targetNumber,
    documentType: targetType,
    changes: {
      source: { old: null, new: { id: sourceId, number: sourceNumber, type: sourceType } },
    },
    category: "document",
    severity: "info",
  });
}

/**
 * Get audit history for an entity
 */
export async function getAuditHistory(
  entity: string,
  entityId: string,
  options?: {
    limit?: number;
    offset?: number;
    actions?: string[];
  }
) {
  const { limit = 50, offset = 0, actions } = options || {};

  const where: Record<string, unknown> = { entity, entityId };
  if (actions && actions.length > 0) {
    where.action = { in: actions };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get financial audit trail for a period
 */
export async function getFinancialAuditTrail(
  dateFrom: Date,
  dateTo: Date,
  options?: {
    category?: string;
    documentType?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { category, documentType, limit = 100, offset = 0 } = options || {};

  const where: Record<string, unknown> = {
    createdAt: {
      gte: dateFrom,
      lte: dateTo,
    },
    category: { in: ["financial", "document"] },
  };

  if (category) {
    where.category = category;
  }
  if (documentType) {
    where.documentType = documentType;
  }

  const [logs, total, summary] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: { id: true },
    }),
  ]);

  return {
    logs,
    total,
    summary: summary.reduce(
      (acc, item) => {
        acc[item.action] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

// ═══════════════════════════════════════════════════════════
// FIX 5: Enhanced Audit Functions
// ═══════════════════════════════════════════════════════════

/**
 * Log document locking (immutability)
 */
export async function auditDocumentLock(
  documentId: string,
  documentNumber: string,
  documentType: string,
  reason: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "lock",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Document ${documentType} ${documentNumber} verrouillé: ${reason}`,
    documentNumber,
    documentType,
    category: "document",
    severity: "critical",
  });
}

/**
 * Log document unlocking (admin emergency action)
 */
export async function auditDocumentUnlock(
  documentId: string,
  documentNumber: string,
  documentType: string,
  reason: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "unlock",
    entity: "CRMDocument",
    entityId: documentId,
    description: `ADMIN: Document ${documentType} ${documentNumber} déverrouillé. Raison: ${reason}`,
    documentNumber,
    documentType,
    category: "document",
    severity: "critical",
    changes: { unlockReason: { old: null, new: reason } },
  });
}

/**
 * Log PDF archival
 */
export async function auditPdfArchival(
  documentId: string,
  documentNumber: string,
  documentType: string,
  pdfUrl: string,
  pdfHash: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "archive",
    entity: "CRMDocument",
    entityId: documentId,
    description: `PDF archivé pour ${documentType} ${documentNumber}`,
    documentNumber,
    documentType,
    pdfSnapshot: pdfUrl,
    changes: { pdfHash: { old: null, new: pdfHash } },
    category: "document",
    severity: "info",
  });
}

/**
 * Log deposit invoice creation
 */
export async function auditDepositInvoiceCreation(
  documentId: string,
  documentNumber: string,
  sourceDevisNumber: string,
  amount: number,
  depositPercent: number,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "create_deposit",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Facture d'acompte ${documentNumber} créée (${depositPercent}% de ${sourceDevisNumber})`,
    documentNumber,
    documentType: "FACTURE_ACOMPTE",
    documentAmount: amount,
    changes: {
      sourceDevis: { old: null, new: sourceDevisNumber },
      depositPercent: { old: null, new: depositPercent },
    },
    category: "financial",
    severity: "critical",
  });
}

/**
 * Log deposit deduction application
 */
export async function auditDepositDeduction(
  documentId: string,
  documentNumber: string,
  depositInvoices: Array<{ number: string; amount: number }>,
  totalDeducted: number,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "apply_deposits",
    entity: "CRMDocument",
    entityId: documentId,
    description: `Acomptes déduits de ${documentNumber}: ${totalDeducted} DH`,
    documentNumber,
    documentType: "FACTURE",
    documentAmount: totalDeducted,
    changes: {
      appliedDeposits: { old: null, new: depositInvoices },
      totalDeducted: { old: null, new: totalDeducted },
    },
    category: "financial",
    severity: "critical",
  });
}

/**
 * Log status change
 */
export async function auditStatusChange(
  documentId: string,
  documentNumber: string,
  documentType: string,
  oldStatus: string,
  newStatus: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "status_change",
    entity: "CRMDocument",
    entityId: documentId,
    description: `${documentType} ${documentNumber}: ${oldStatus} → ${newStatus}`,
    documentNumber,
    documentType,
    changes: { status: { old: oldStatus, new: newStatus } },
    category: "document",
    severity: newStatus === "PAID" || newStatus === "CANCELLED" ? "critical" : "info",
  });
}

/**
 * Log client balance update
 */
export async function auditClientBalanceUpdate(
  clientId: string,
  clientNumber: string,
  clientName: string,
  oldBalance: number,
  newBalance: number,
  reason: string,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "balance_update",
    entity: "CRMClient",
    entityId: clientId,
    description: `Solde client ${clientName} (${clientNumber}): ${oldBalance} → ${newBalance} DH. ${reason}`,
    documentAmount: newBalance - oldBalance,
    changes: {
      balance: { old: oldBalance, new: newBalance },
      reason: { old: null, new: reason },
    },
    category: "financial",
    severity: Math.abs(newBalance - oldBalance) > 10000 ? "warning" : "info",
  });
}

/**
 * Log export operation
 */
export async function auditExportOperation(
  exportType: string,
  period: string,
  format: string,
  recordCount: number,
  userId?: string
) {
  return createAuditLog({
    userId,
    action: "export",
    entity: "Report",
    description: `Export ${exportType} (${period}): ${recordCount} enregistrements en ${format.toUpperCase()}`,
    changes: {
      exportType: { old: null, new: exportType },
      period: { old: null, new: period },
      format: { old: null, new: format },
      recordCount: { old: null, new: recordCount },
    },
    category: "system",
    severity: "info",
  });
}

/**
 * Search audit logs with filters
 */
export async function searchAuditLogs(filters: {
  dateFrom?: Date;
  dateTo?: Date;
  action?: string;
  entity?: string;
  userId?: string;
  category?: string;
  severity?: string;
  documentNumber?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}) {
  const {
    dateFrom,
    dateTo,
    action,
    entity,
    userId,
    category,
    severity,
    documentNumber,
    searchTerm,
    limit = 50,
    offset = 0,
  } = filters;

  const where: Record<string, unknown> = {};

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = dateFrom;
    if (dateTo) (where.createdAt as Record<string, unknown>).lte = dateTo;
  }

  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (userId) where.userId = userId;
  if (category) where.category = category;
  if (severity) where.severity = severity;
  if (documentNumber) where.documentNumber = { contains: documentNumber, mode: "insensitive" };
  if (searchTerm) {
    where.OR = [
      { description: { contains: searchTerm, mode: "insensitive" } },
      { documentNumber: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, hasMore: offset + logs.length < total };
}
