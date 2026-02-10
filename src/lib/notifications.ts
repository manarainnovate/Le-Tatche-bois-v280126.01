import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Notification Types
// ═══════════════════════════════════════════════════════════

export type NotificationType =
  | "INVOICE_OVERDUE"
  | "INVOICE_PAID"
  | "PAYMENT_RECEIVED"
  | "QUOTE_EXPIRING"
  | "QUOTE_CONVERTED"
  | "NEW_CLIENT"
  | "NEW_ORDER"
  | "DOCUMENT_CREATED"
  | "PROJECT_UPDATED"
  | "TASK_ASSIGNED"
  | "STOCK_LOW"
  | "SYSTEM";

// ═══════════════════════════════════════════════════════════
// Notification Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message: message ?? null,
        link: link ?? null,
        metadata: metadata ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notifications for all admins
 */
export async function notifyAdmins({
  type,
  title,
  message,
  link,
  metadata,
}: {
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] } },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      userId: admin.id,
      type,
      title,
      message: message ?? null,
      link: link ?? null,
      metadata: metadata ?? Prisma.JsonNull,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}

/**
 * Check for overdue invoices and create notifications
 * (Should be called by a cron job or scheduled task)
 */
export async function checkOverdueInvoices() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find invoices that became overdue today
    const overdueInvoices = await prisma.cRMDocument.findMany({
      where: {
        type: "FACTURE",
        status: { in: ["SENT", "PARTIAL"] },
        dueDate: { lt: today },
        balance: { gt: 0 },
      },
      select: {
        id: true,
        number: true,
        clientName: true,
        balance: true,
        dueDate: true,
      },
    });

    // Update status to OVERDUE and create notifications
    for (const invoice of overdueInvoices) {
      await prisma.cRMDocument.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });

      await notifyAdmins({
        type: "INVOICE_OVERDUE",
        title: `Facture ${invoice.number} en retard`,
        message: `La facture de ${invoice.clientName} d'un montant de ${Number(
          invoice.balance
        ).toFixed(2)} MAD est en retard de paiement.`,
        link: `/admin/facturation/factures/${invoice.id}`,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          balance: Number(invoice.balance),
        },
      });
    }

    return overdueInvoices.length;
  } catch (error) {
    console.error("Error checking overdue invoices:", error);
    return 0;
  }
}

/**
 * Check for expiring quotes and create notifications
 */
export async function checkExpiringQuotes() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find quotes expiring in the next 3 days
    const expiringQuotes = await prisma.cRMDocument.findMany({
      where: {
        type: "DEVIS",
        status: { in: ["DRAFT", "SENT"] },
        validUntil: {
          gte: today,
          lte: threeDaysFromNow,
        },
      },
      select: {
        id: true,
        number: true,
        clientName: true,
        totalTTC: true,
        validUntil: true,
      },
    });

    for (const quote of expiringQuotes) {
      await notifyAdmins({
        type: "QUOTE_EXPIRING",
        title: `Devis ${quote.number} expire bientôt`,
        message: `Le devis de ${quote.clientName} expire le ${new Date(
          quote.validUntil!
        ).toLocaleDateString("fr-FR")}.`,
        link: `/admin/facturation/devis/${quote.id}`,
        metadata: {
          quoteId: quote.id,
          quoteNumber: quote.number,
          validUntil: quote.validUntil,
        },
      });
    }

    return expiringQuotes.length;
  } catch (error) {
    console.error("Error checking expiring quotes:", error);
    return 0;
  }
}

/**
 * Notify about new payment received
 */
export async function notifyPaymentReceived({
  invoiceId,
  invoiceNumber,
  clientName,
  amount,
  isPaidInFull,
}: {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  isPaidInFull: boolean;
}) {
  await notifyAdmins({
    type: "PAYMENT_RECEIVED",
    title: isPaidInFull
      ? `Facture ${invoiceNumber} payée`
      : `Paiement reçu - ${invoiceNumber}`,
    message: `Paiement de ${amount.toFixed(2)} MAD reçu de ${clientName}${
      isPaidInFull ? ". Facture entièrement réglée." : "."
    }`,
    link: `/admin/facturation/factures/${invoiceId}`,
    metadata: {
      invoiceId,
      invoiceNumber,
      amount,
      isPaidInFull,
    },
  });
}

/**
 * Notify about new client
 */
export async function notifyNewClient({
  clientId,
  clientName,
  clientNumber,
}: {
  clientId: string;
  clientName: string;
  clientNumber: string;
}) {
  await notifyAdmins({
    type: "NEW_CLIENT",
    title: "Nouveau client",
    message: `${clientName} (${clientNumber}) a été ajouté.`,
    link: `/admin/crm/clients/${clientId}`,
    metadata: {
      clientId,
      clientName,
      clientNumber,
    },
  });
}

/**
 * Notify about document created
 */
export async function notifyDocumentCreated({
  documentId,
  documentNumber,
  documentType,
  clientName,
  totalTTC,
}: {
  documentId: string;
  documentNumber: string;
  documentType: string;
  clientName: string;
  totalTTC: number;
}) {
  const typeLabels: Record<string, string> = {
    DEVIS: "Devis",
    BC: "Bon de commande",
    BL: "Bon de livraison",
    PV: "PV de réception",
    FACTURE: "Facture",
    AVOIR: "Avoir",
  };

  const typeRoutes: Record<string, string> = {
    DEVIS: "devis",
    BC: "bc",
    BL: "bl",
    PV: "pv",
    FACTURE: "factures",
    AVOIR: "avoirs",
  };

  await notifyAdmins({
    type: "DOCUMENT_CREATED",
    title: `${typeLabels[documentType] || documentType} créé`,
    message: `${typeLabels[documentType]} ${documentNumber} créé pour ${clientName} - ${totalTTC.toFixed(
      2
    )} MAD TTC`,
    link: `/admin/facturation/${typeRoutes[documentType]}/${documentId}`,
    metadata: {
      documentId,
      documentNumber,
      documentType,
      totalTTC,
    },
  });
}
