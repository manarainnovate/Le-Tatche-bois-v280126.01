// ═══════════════════════════════════════════════════════════
// Status Configuration - Centralized status definitions
// Colors, labels, and utilities for Lead, Project, and Document statuses
// ═══════════════════════════════════════════════════════════

export type SupportedLocale = "fr" | "en" | "es" | "ar";

export interface StatusConfig {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  labels: Record<SupportedLocale, string>;
}

// ═══════════════════════════════════════════════════════════
// LEAD STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "VISIT_SCHEDULED"
  | "MEASURES_TAKEN"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  NEW: {
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    labels: {
      fr: "Nouveau",
      en: "New",
      es: "Nuevo",
      ar: "جديد",
    },
  },
  CONTACTED: {
    color: "cyan",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-800 dark:text-cyan-300",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    labels: {
      fr: "Contacté",
      en: "Contacted",
      es: "Contactado",
      ar: "تم التواصل",
    },
  },
  VISIT_SCHEDULED: {
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    labels: {
      fr: "Visite prévue",
      en: "Visit Scheduled",
      es: "Visita programada",
      ar: "زيارة مجدولة",
    },
  },
  MEASURES_TAKEN: {
    color: "indigo",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-800 dark:text-indigo-300",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    labels: {
      fr: "Mesures prises",
      en: "Measures Taken",
      es: "Medidas tomadas",
      ar: "تم أخذ القياسات",
    },
  },
  QUOTE_SENT: {
    color: "amber",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    labels: {
      fr: "Devis envoyé",
      en: "Quote Sent",
      es: "Presupuesto enviado",
      ar: "تم إرسال عرض السعر",
    },
  },
  NEGOTIATION: {
    color: "orange",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    labels: {
      fr: "Négociation",
      en: "Negotiation",
      es: "Negociación",
      ar: "مفاوضات",
    },
  },
  WON: {
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    labels: {
      fr: "Gagné",
      en: "Won",
      es: "Ganado",
      ar: "مكسب",
    },
  },
  LOST: {
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    labels: {
      fr: "Perdu",
      en: "Lost",
      es: "Perdido",
      ar: "خاسر",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// PROJECT STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════

export type ProjectStatus =
  | "STUDY"
  | "MEASURES"
  | "QUOTE"
  | "PENDING"
  | "PRODUCTION"
  | "READY"
  | "DELIVERY"
  | "INSTALLATION"
  | "COMPLETED"
  | "RECEIVED"
  | "CLOSED"
  | "CANCELLED";

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  STUDY: {
    color: "slate",
    bgColor: "bg-slate-100 dark:bg-slate-900/30",
    textColor: "text-slate-800 dark:text-slate-300",
    borderColor: "border-slate-200 dark:border-slate-800",
    labels: {
      fr: "Étude",
      en: "Study",
      es: "Estudio",
      ar: "دراسة",
    },
  },
  MEASURES: {
    color: "violet",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    textColor: "text-violet-800 dark:text-violet-300",
    borderColor: "border-violet-200 dark:border-violet-800",
    labels: {
      fr: "Mesures",
      en: "Measures",
      es: "Medidas",
      ar: "القياسات",
    },
  },
  QUOTE: {
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    labels: {
      fr: "Devis",
      en: "Quote",
      es: "Presupuesto",
      ar: "عرض سعر",
    },
  },
  PENDING: {
    color: "yellow",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-300",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    labels: {
      fr: "En attente",
      en: "Pending",
      es: "Pendiente",
      ar: "في الانتظار",
    },
  },
  PRODUCTION: {
    color: "amber",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    labels: {
      fr: "Production",
      en: "Production",
      es: "Producción",
      ar: "إنتاج",
    },
  },
  READY: {
    color: "cyan",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-800 dark:text-cyan-300",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    labels: {
      fr: "Prêt",
      en: "Ready",
      es: "Listo",
      ar: "جاهز",
    },
  },
  DELIVERY: {
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    labels: {
      fr: "Livraison",
      en: "Delivery",
      es: "Entrega",
      ar: "توصيل",
    },
  },
  INSTALLATION: {
    color: "indigo",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-800 dark:text-indigo-300",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    labels: {
      fr: "Pose",
      en: "Installation",
      es: "Instalación",
      ar: "تركيب",
    },
  },
  COMPLETED: {
    color: "teal",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    textColor: "text-teal-800 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
    labels: {
      fr: "Terminé",
      en: "Completed",
      es: "Completado",
      ar: "مكتمل",
    },
  },
  RECEIVED: {
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    labels: {
      fr: "Réceptionné",
      en: "Received",
      es: "Recibido",
      ar: "مستلم",
    },
  },
  CLOSED: {
    color: "gray",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    textColor: "text-gray-800 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-800",
    labels: {
      fr: "Clôturé",
      en: "Closed",
      es: "Cerrado",
      ar: "مغلق",
    },
  },
  CANCELLED: {
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    labels: {
      fr: "Annulé",
      en: "Cancelled",
      es: "Cancelado",
      ar: "ملغى",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// DOCUMENT STATUS CONFIGURATION - SPLIT BY DOCUMENT TYPE
// Each document type has its own valid statuses and transitions
// ═══════════════════════════════════════════════════════════

// Document types from Prisma schema
export type CRMDocumentType =
  | "DEVIS"
  | "BON_COMMANDE"
  | "BON_LIVRAISON"
  | "PV_RECEPTION"
  | "FACTURE"
  | "FACTURE_ACOMPTE"
  | "AVOIR";

// All possible document statuses (union of all types)
export type DocumentStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "CONFIRMED"
  | "PARTIAL"
  | "DELIVERED"
  | "SIGNED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

// Type-specific status types
export type QuoteStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "CANCELLED";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type OrderStatus = "DRAFT" | "CONFIRMED" | "PARTIAL" | "DELIVERED" | "CANCELLED";
export type DeliveryStatus = "DRAFT" | "DELIVERED" | "PARTIAL" | "CANCELLED";
export type ReceptionStatus = "DRAFT" | "SIGNED" | "CANCELLED";

// ═══════════════════════════════════════════════════════════
// STATUS CONFIGURATIONS BY DOCUMENT TYPE
// ═══════════════════════════════════════════════════════════

// Base status definitions (shared styling)
const STATUS_BASE: Record<DocumentStatus, StatusConfig> = {
  DRAFT: {
    color: "gray",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    textColor: "text-gray-800 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-800",
    labels: {
      fr: "Brouillon",
      en: "Draft",
      es: "Borrador",
      ar: "مسودة",
    },
  },
  SENT: {
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    labels: {
      fr: "Envoyé",
      en: "Sent",
      es: "Enviado",
      ar: "مرسل",
    },
  },
  VIEWED: {
    color: "cyan",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-800 dark:text-cyan-300",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    labels: {
      fr: "Vu",
      en: "Viewed",
      es: "Visto",
      ar: "تمت المشاهدة",
    },
  },
  ACCEPTED: {
    color: "green",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    labels: {
      fr: "Accepté",
      en: "Accepted",
      es: "Aceptado",
      ar: "مقبول",
    },
  },
  REJECTED: {
    color: "red",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    labels: {
      fr: "Refusé",
      en: "Rejected",
      es: "Rechazado",
      ar: "مرفوض",
    },
  },
  CONFIRMED: {
    color: "indigo",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-800 dark:text-indigo-300",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    labels: {
      fr: "Confirmé",
      en: "Confirmed",
      es: "Confirmado",
      ar: "مؤكد",
    },
  },
  PARTIAL: {
    color: "amber",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    labels: {
      fr: "Partiel",
      en: "Partial",
      es: "Parcial",
      ar: "جزئي",
    },
  },
  DELIVERED: {
    color: "purple",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    labels: {
      fr: "Livré",
      en: "Delivered",
      es: "Entregado",
      ar: "تم التسليم",
    },
  },
  SIGNED: {
    color: "teal",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    textColor: "text-teal-800 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
    labels: {
      fr: "Signé",
      en: "Signed",
      es: "Firmado",
      ar: "موقع",
    },
  },
  PAID: {
    color: "emerald",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-800 dark:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    labels: {
      fr: "Payé",
      en: "Paid",
      es: "Pagado",
      ar: "مدفوع",
    },
  },
  OVERDUE: {
    color: "rose",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    textColor: "text-rose-800 dark:text-rose-300",
    borderColor: "border-rose-200 dark:border-rose-800",
    labels: {
      fr: "En retard",
      en: "Overdue",
      es: "Vencido",
      ar: "متأخر",
    },
  },
  CANCELLED: {
    color: "slate",
    bgColor: "bg-slate-100 dark:bg-slate-900/30",
    textColor: "text-slate-800 dark:text-slate-300",
    borderColor: "border-slate-200 dark:border-slate-800",
    labels: {
      fr: "Annulé",
      en: "Cancelled",
      es: "Cancelado",
      ar: "ملغى",
    },
  },
};

// ═══════════════════════════════════════════════════════════
// QUOTE (DEVIS) STATUS CONFIG
// Flow: DRAFT → SENT → VIEWED → ACCEPTED/REJECTED
// ═══════════════════════════════════════════════════════════

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, StatusConfig> = {
  DRAFT: STATUS_BASE.DRAFT,
  SENT: STATUS_BASE.SENT,
  VIEWED: STATUS_BASE.VIEWED,
  ACCEPTED: STATUS_BASE.ACCEPTED,
  REJECTED: STATUS_BASE.REJECTED,
  CANCELLED: STATUS_BASE.CANCELLED,
};

export const QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "ACCEPTED", "REJECTED", "CANCELLED"],
  VIEWED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: [], // Terminal - can convert to BC or create deposit invoice
  REJECTED: [], // Terminal
  CANCELLED: [], // Terminal
};

// ═══════════════════════════════════════════════════════════
// INVOICE (FACTURE, FACTURE_ACOMPTE, AVOIR) STATUS CONFIG
// Flow: DRAFT → SENT → PARTIAL → PAID / OVERDUE
// ═══════════════════════════════════════════════════════════

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, StatusConfig> = {
  DRAFT: STATUS_BASE.DRAFT,
  SENT: STATUS_BASE.SENT,
  PARTIAL: STATUS_BASE.PARTIAL,
  PAID: STATUS_BASE.PAID,
  OVERDUE: STATUS_BASE.OVERDUE,
  CANCELLED: STATUS_BASE.CANCELLED,
};

export const INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PARTIAL", "PAID", "OVERDUE", "CANCELLED"],
  PARTIAL: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: [], // Terminal
  OVERDUE: ["PARTIAL", "PAID", "CANCELLED"],
  CANCELLED: [], // Terminal
};

// ═══════════════════════════════════════════════════════════
// ORDER (BON_COMMANDE) STATUS CONFIG
// Flow: DRAFT → CONFIRMED → PARTIAL → DELIVERED
// ═══════════════════════════════════════════════════════════

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  DRAFT: STATUS_BASE.DRAFT,
  CONFIRMED: STATUS_BASE.CONFIRMED,
  PARTIAL: STATUS_BASE.PARTIAL,
  DELIVERED: STATUS_BASE.DELIVERED,
  CANCELLED: STATUS_BASE.CANCELLED,
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PARTIAL", "DELIVERED", "CANCELLED"],
  PARTIAL: ["DELIVERED", "CANCELLED"],
  DELIVERED: [], // Terminal - can create BL
  CANCELLED: [], // Terminal
};

// ═══════════════════════════════════════════════════════════
// DELIVERY (BON_LIVRAISON) STATUS CONFIG
// Flow: DRAFT → PARTIAL → DELIVERED
// ═══════════════════════════════════════════════════════════

export const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, StatusConfig> = {
  DRAFT: STATUS_BASE.DRAFT,
  DELIVERED: STATUS_BASE.DELIVERED,
  PARTIAL: STATUS_BASE.PARTIAL,
  CANCELLED: STATUS_BASE.CANCELLED,
};

export const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  DRAFT: ["PARTIAL", "DELIVERED", "CANCELLED"],
  PARTIAL: ["DELIVERED", "CANCELLED"],
  DELIVERED: [], // Terminal - can create PV
  CANCELLED: [], // Terminal
};

// ═══════════════════════════════════════════════════════════
// RECEPTION (PV_RECEPTION) STATUS CONFIG
// Flow: DRAFT → SIGNED
// ═══════════════════════════════════════════════════════════

export const RECEPTION_STATUS_CONFIG: Record<ReceptionStatus, StatusConfig> = {
  DRAFT: STATUS_BASE.DRAFT,
  SIGNED: STATUS_BASE.SIGNED,
  CANCELLED: STATUS_BASE.CANCELLED,
};

export const RECEPTION_STATUS_TRANSITIONS: Record<ReceptionStatus, ReceptionStatus[]> = {
  DRAFT: ["SIGNED", "CANCELLED"],
  SIGNED: [], // Terminal - triggers final invoice
  CANCELLED: [], // Terminal
};

// ═══════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY - Keep DOCUMENT_STATUS_CONFIG for existing code
// ═══════════════════════════════════════════════════════════

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = STATUS_BASE;

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get the appropriate status config map for a given document type
 */
export function getStatusConfigByDocType(docType: CRMDocumentType): Record<string, StatusConfig> {
  switch (docType) {
    case "DEVIS":
      return QUOTE_STATUS_CONFIG;
    case "FACTURE":
    case "FACTURE_ACOMPTE":
    case "AVOIR":
      return INVOICE_STATUS_CONFIG;
    case "BON_COMMANDE":
      return ORDER_STATUS_CONFIG;
    case "BON_LIVRAISON":
      return DELIVERY_STATUS_CONFIG;
    case "PV_RECEPTION":
      return RECEPTION_STATUS_CONFIG;
    default:
      return DOCUMENT_STATUS_CONFIG;
  }
}

/**
 * Get status label for a given status and locale
 */
export function getStatusLabel(
  status: string,
  type: "lead" | "project" | "document",
  locale: SupportedLocale = "fr",
  docType?: CRMDocumentType
): string {
  let config: StatusConfig | undefined;

  if (type === "lead") {
    config = LEAD_STATUS_CONFIG[status as LeadStatus];
  } else if (type === "project") {
    config = PROJECT_STATUS_CONFIG[status as ProjectStatus];
  } else if (docType) {
    const statusConfigMap = getStatusConfigByDocType(docType);
    config = statusConfigMap[status];
  } else {
    config = DOCUMENT_STATUS_CONFIG[status as DocumentStatus];
  }

  return config?.labels[locale] || status;
}

/**
 * Get status config for a given status
 */
export function getStatusConfig(
  status: string,
  type: "lead" | "project" | "document",
  docType?: CRMDocumentType
): StatusConfig | null {
  if (type === "lead") {
    return LEAD_STATUS_CONFIG[status as LeadStatus] || null;
  } else if (type === "project") {
    return PROJECT_STATUS_CONFIG[status as ProjectStatus] || null;
  } else if (docType) {
    const statusConfigMap = getStatusConfigByDocType(docType);
    return statusConfigMap[status] || null;
  } else {
    return DOCUMENT_STATUS_CONFIG[status as DocumentStatus] || null;
  }
}

/**
 * Get all statuses for a type as options (for select dropdowns)
 */
export function getStatusOptions(
  type: "lead" | "project" | "document",
  locale: SupportedLocale = "fr",
  docType?: CRMDocumentType
): Array<{ value: string; label: string; config: StatusConfig }> {
  let configs: Record<string, StatusConfig>;

  if (type === "lead") {
    configs = LEAD_STATUS_CONFIG;
  } else if (type === "project") {
    configs = PROJECT_STATUS_CONFIG;
  } else if (docType) {
    configs = getStatusConfigByDocType(docType);
  } else {
    configs = DOCUMENT_STATUS_CONFIG;
  }

  return Object.entries(configs).map(([value, config]) => ({
    value,
    label: config.labels[locale],
    config,
  }));
}

/**
 * Check if a status is a terminal/final status
 */
export function isTerminalStatus(
  status: string,
  type: "lead" | "project" | "document",
  docType?: CRMDocumentType
): boolean {
  if (type === "lead") {
    return ["WON", "LOST"].includes(status);
  } else if (type === "project") {
    return ["CLOSED", "CANCELLED"].includes(status);
  } else if (docType) {
    const transitions = getDocumentStatusTransitions(docType);
    return transitions[status]?.length === 0;
  }

  // Fallback for generic document
  return ["PAID", "CANCELLED", "REJECTED", "SIGNED", "DELIVERED"].includes(status);
}

/**
 * Check if a status indicates success
 */
export function isSuccessStatus(
  status: string,
  type: "lead" | "project" | "document",
  docType?: CRMDocumentType
): boolean {
  const successStatuses = {
    lead: ["WON"],
    project: ["COMPLETED", "RECEIVED", "CLOSED"],
    document: ["ACCEPTED", "CONFIRMED", "DELIVERED", "SIGNED", "PAID"],
  };

  if (docType) {
    switch (docType) {
      case "DEVIS":
        return status === "ACCEPTED";
      case "FACTURE":
      case "FACTURE_ACOMPTE":
      case "AVOIR":
        return status === "PAID";
      case "BON_COMMANDE":
        return status === "DELIVERED";
      case "BON_LIVRAISON":
        return status === "DELIVERED";
      case "PV_RECEPTION":
        return status === "SIGNED";
    }
  }

  return successStatuses[type].includes(status);
}

/**
 * Check if a status indicates failure/problem
 */
export function isFailureStatus(
  status: string,
  type: "lead" | "project" | "document",
  docType?: CRMDocumentType
): boolean {
  const failureStatuses = {
    lead: ["LOST"],
    project: ["CANCELLED"],
    document: ["REJECTED", "OVERDUE", "CANCELLED"],
  };

  if (docType) {
    switch (docType) {
      case "DEVIS":
        return ["REJECTED", "CANCELLED"].includes(status);
      case "FACTURE":
      case "FACTURE_ACOMPTE":
      case "AVOIR":
        return ["OVERDUE", "CANCELLED"].includes(status);
      default:
        return status === "CANCELLED";
    }
  }

  return failureStatuses[type].includes(status);
}

/**
 * Get status transitions map for a specific document type
 */
export function getDocumentStatusTransitions(docType: CRMDocumentType): Record<string, string[]> {
  switch (docType) {
    case "DEVIS":
      return QUOTE_STATUS_TRANSITIONS;
    case "FACTURE":
    case "FACTURE_ACOMPTE":
    case "AVOIR":
      return INVOICE_STATUS_TRANSITIONS;
    case "BON_COMMANDE":
      return ORDER_STATUS_TRANSITIONS;
    case "BON_LIVRAISON":
      return DELIVERY_STATUS_TRANSITIONS;
    case "PV_RECEPTION":
      return RECEPTION_STATUS_TRANSITIONS;
    default:
      return {};
  }
}

/**
 * Get valid next statuses for workflow transitions
 */
export function getValidNextStatuses(
  currentStatus: string,
  type: "lead" | "project" | "document",
  docType?: CRMDocumentType
): string[] {
  const leadTransitions: Record<string, string[]> = {
    NEW: ["CONTACTED", "LOST"],
    CONTACTED: ["VISIT_SCHEDULED", "QUOTE_SENT", "LOST"],
    VISIT_SCHEDULED: ["MEASURES_TAKEN", "CONTACTED", "LOST"],
    MEASURES_TAKEN: ["QUOTE_SENT", "LOST"],
    QUOTE_SENT: ["NEGOTIATION", "WON", "LOST"],
    NEGOTIATION: ["WON", "LOST"],
    WON: [],
    LOST: ["NEW"], // Allow reactivation
  };

  const projectTransitions: Record<string, string[]> = {
    STUDY: ["MEASURES", "QUOTE", "CANCELLED"],
    MEASURES: ["QUOTE", "STUDY", "CANCELLED"],
    QUOTE: ["PENDING", "STUDY", "CANCELLED"],
    PENDING: ["PRODUCTION", "QUOTE", "CANCELLED"],
    PRODUCTION: ["READY", "CANCELLED"],
    READY: ["DELIVERY", "INSTALLATION", "CANCELLED"],
    DELIVERY: ["INSTALLATION", "COMPLETED", "CANCELLED"],
    INSTALLATION: ["COMPLETED", "CANCELLED"],
    COMPLETED: ["RECEIVED", "INSTALLATION"],
    RECEIVED: ["CLOSED"],
    CLOSED: [],
    CANCELLED: ["STUDY"], // Allow reactivation
  };

  if (type === "lead") {
    return leadTransitions[currentStatus] || [];
  } else if (type === "project") {
    return projectTransitions[currentStatus] || [];
  } else if (docType) {
    const transitions = getDocumentStatusTransitions(docType);
    return transitions[currentStatus] || [];
  }

  // Fallback: return empty array for unknown type
  return [];
}

/**
 * Validate if a status transition is allowed
 */
export function isValidStatusTransition(
  fromStatus: string,
  toStatus: string,
  docType: CRMDocumentType
): boolean {
  const validNextStatuses = getValidNextStatuses(fromStatus, "document", docType);
  return validNextStatuses.includes(toStatus);
}

/**
 * Get the document type label in a locale
 */
export function getDocumentTypeLabel(docType: CRMDocumentType, locale: SupportedLocale = "fr"): string {
  const labels: Record<CRMDocumentType, Record<SupportedLocale, string>> = {
    DEVIS: { fr: "Devis", en: "Quote", es: "Presupuesto", ar: "عرض سعر" },
    BON_COMMANDE: { fr: "Bon de commande", en: "Purchase Order", es: "Orden de compra", ar: "أمر شراء" },
    BON_LIVRAISON: { fr: "Bon de livraison", en: "Delivery Note", es: "Albarán", ar: "سند تسليم" },
    PV_RECEPTION: { fr: "PV Réception", en: "Reception Report", es: "Acta de recepción", ar: "محضر استلام" },
    FACTURE: { fr: "Facture", en: "Invoice", es: "Factura", ar: "فاتورة" },
    FACTURE_ACOMPTE: { fr: "Facture d'acompte", en: "Deposit Invoice", es: "Factura de anticipo", ar: "فاتورة مقدمة" },
    AVOIR: { fr: "Avoir", en: "Credit Note", es: "Nota de crédito", ar: "إشعار دائن" },
  };

  return labels[docType]?.[locale] || docType;
}
