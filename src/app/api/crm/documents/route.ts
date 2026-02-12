import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-helpers";
import { z } from "zod";
import { generateB2BNumber, mapDocumentType } from "@/lib/crm/generate-document-number";

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

const documentItemSchema = z.object({
  catalogItemId: z.string().optional(),
  sourceItemId: z.string().optional(), // For PV: link to source BL item
  reference: z.string().optional(),
  designation: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().default("pcs"),
  unitPriceHT: z.number().min(0),
  discountPercent: z.number().min(0).max(100).optional(),
  tvaRate: z.number().default(20),
  metadata: z.any().optional(), // For PV: quantityDelivered, status, remarks
});

const createDocumentSchema = z.object({
  type: z.enum(["DEVIS", "BON_COMMANDE", "BON_LIVRAISON", "PV_RECEPTION", "FACTURE", "FACTURE_ACOMPTE", "AVOIR"]),
  clientId: z.string().min(1),
  projectId: z.string().optional(),
  // Accept both simple date strings (YYYY-MM-DD) and ISO datetime strings
  date: z.string().optional(),
  validUntil: z.string().optional(),
  dueDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryNotes: z.string().optional(),
  items: z.array(documentItemSchema),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().optional(),
  depositPercent: z.number().min(0).max(100).optional(),
  deliveryTime: z.string().optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  conditions: z.string().optional(),
  paymentTerms: z.string().optional(),
  internalNotes: z.string().optional(),
  publicNotes: z.string().optional(),
  footerText: z.string().optional(),
  // For conversion from another document
  parentId: z.string().optional(),
  // P0-3: Draft mode - if true, creates draft with temporary number
  isDraft: z.boolean().optional().default(true),
  // If issueImmediately is true, bypass draft mode and issue with official number
  issueImmediately: z.boolean().optional().default(false),
  // PV Reception specific fields
  receptionDate: z.string().optional(), // PV reception date (separate from document date)
  signedBy: z.string().optional(), // Name of person who signed the PV
  workDescription: z.string().optional(), // Work description for PV
  hasReserves: z.boolean().optional(), // Whether there are reserves
  reserves: z.string().optional(), // Description of reserves
  // BL Reception specific
  receivedBy: z.string().optional(), // Name of person who received delivery
});

// ═══════════════════════════════════════════════════════════
// Helper: Calculate Document Totals
// ═══════════════════════════════════════════════════════════

interface CalculatedItem {
  reference: string | null;
  designation: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number;
  discountAmount: number;
  tvaRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  catalogItemId?: string;
  sourceItemId?: string;
  metadata?: any;
  order: number;
}

interface CalculatedTotals {
  items: CalculatedItem[];
  totalHT: number;
  discountAmount: number;
  netHT: number;
  tvaDetails: { rate: number; base: number; amount: number }[];
  totalTVA: number;
  totalTTC: number;
  depositAmount?: number;
}

function calculateDocumentTotals(
  items: z.infer<typeof documentItemSchema>[],
  discountType?: string,
  discountValue?: number,
  depositPercent?: number
): CalculatedTotals {
  // Calculate each line
  const calculatedItems: CalculatedItem[] = items.map((item, index) => {
    const lineTotal = item.quantity * item.unitPriceHT;
    const lineDiscount = item.discountPercent
      ? lineTotal * (item.discountPercent / 100)
      : 0;
    const lineNetHT = lineTotal - lineDiscount;
    const lineTVA = lineNetHT * (item.tvaRate / 100);
    const lineTTC = lineNetHT + lineTVA;

    return {
      reference: item.reference || null,
      designation: item.designation,
      description: item.description || null,
      quantity: item.quantity,
      unit: item.unit,
      unitPriceHT: item.unitPriceHT,
      discountPercent: item.discountPercent || 0,
      discountAmount: lineDiscount,
      tvaRate: item.tvaRate,
      totalHT: lineNetHT,
      totalTVA: lineTVA,
      totalTTC: lineTTC,
      catalogItemId: item.catalogItemId,
      sourceItemId: item.sourceItemId,
      metadata: item.metadata,
      order: index,
    };
  });

  // Calculate totals
  const totalHT = calculatedItems.reduce((sum, item) => sum + item.totalHT, 0);

  // Apply global discount
  let discountAmount = 0;
  if (discountType && discountValue) {
    discountAmount =
      discountType === "percentage"
        ? totalHT * (discountValue / 100)
        : discountValue;
  }

  const netHT = totalHT - discountAmount;

  // Group TVA by rate
  const tvaByRate = new Map<number, { base: number; amount: number }>();
  calculatedItems.forEach((item) => {
    const proportion = item.totalHT / totalHT;
    const adjustedBase = (netHT * proportion * item.totalHT) / item.totalHT;
    const existing = tvaByRate.get(item.tvaRate) || { base: 0, amount: 0 };
    tvaByRate.set(item.tvaRate, {
      base: existing.base + (netHT * proportion),
      amount: existing.amount + (netHT * proportion * item.tvaRate / 100),
    });
  });

  const tvaDetails = Array.from(tvaByRate.entries()).map(([rate, data]) => ({
    rate,
    base: Math.round(data.base * 100) / 100,
    amount: Math.round(data.amount * 100) / 100,
  }));

  const totalTVA = tvaDetails.reduce((sum, tva) => sum + tva.amount, 0);
  const totalTTC = netHT + totalTVA;

  // Calculate deposit
  const depositAmount = depositPercent
    ? totalTTC * (depositPercent / 100)
    : undefined;

  return {
    items: calculatedItems,
    totalHT: Math.round(totalHT * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    netHT: Math.round(netHT * 100) / 100,
    tvaDetails,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
    depositAmount: depositAmount ? Math.round(depositAmount * 100) / 100 : undefined,
  };
}

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents - List documents
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(dateTo);
      }
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.cRMDocument.findMany({
        where,
        include: {
          client: {
            select: { id: true, fullName: true, clientNumber: true },
          },
          project: {
            select: { id: true, name: true, projectNumber: true },
          },
          _count: {
            select: { items: true, payments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.cRMDocument.count({ where }),
    ]);

    // Transform documents
    const transformedDocuments = documents.map((doc) => ({
      ...doc,
      totalHT: Number(doc.totalHT),
      discountAmount: Number(doc.discountAmount),
      netHT: Number(doc.netHT),
      totalTVA: Number(doc.totalTVA),
      totalTTC: Number(doc.totalTTC),
      paidAmount: Number(doc.paidAmount),
      balance: Number(doc.balance),
      depositPercent: doc.depositPercent ? Number(doc.depositPercent) : null,
      depositAmount: doc.depositAmount ? Number(doc.depositAmount) : null,
    }));

    return apiSuccess({
      documents: transformedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Documents GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/crm/documents - Create document
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createDocumentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0]?.message || "Données invalides", 400);
    }

    const data = validation.data;

    // Validate client exists
    const client = await prisma.cRMClient.findUnique({
      where: { id: data.clientId },
      select: {
        id: true,
        fullName: true,
        billingAddress: true,
        billingCity: true,
        ice: true,
        phone: true,
        email: true,
      },
    });

    if (!client) {
      return apiError("Client non trouvé", 404);
    }

    // Validate project if provided
    if (data.projectId) {
      const project = await prisma.cRMProject.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        return apiError("Projet non trouvé", 404);
      }
    }

    // P0-3: Generate document number based on draft mode
    const docType = mapDocumentType(data.type);
    let number: string;
    let isDraft = true;
    let isLocked = false;
    let issuedAt: Date | null = null;

    if (data.issueImmediately) {
      // Issue immediately with official number
      number = await generateB2BNumber(docType);
      isDraft = false;
      isLocked = true;
      issuedAt = new Date();
    } else if (data.isDraft !== false) {
      // Create as draft with temporary number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      number = `DRAFT-${docType}-${timestamp}${random}`;
      isDraft = true;
    } else {
      // Legacy behavior: issue immediately
      number = await generateB2BNumber(docType);
      isDraft = false;
      isLocked = true;
      issuedAt = new Date();
    }

    // Calculate totals
    const calculated = calculateDocumentTotals(
      data.items,
      data.discountType,
      data.discountValue,
      data.depositPercent
    );

    // Handle parent document (for conversions)
    const parentRefs: Record<string, string> = {};
    if (data.parentId) {
      const parent = await prisma.cRMDocument.findUnique({
        where: { id: data.parentId },
        select: { type: true, number: true },
      });
      if (parent) {
        switch (parent.type) {
          case "DEVIS":
            parentRefs.devisRef = parent.number;
            break;
          case "BON_COMMANDE":
            parentRefs.bcRef = parent.number;
            break;
          case "BON_LIVRAISON":
            parentRefs.blRef = parent.number;
            break;
          case "PV_RECEPTION":
            parentRefs.pvRef = parent.number;
            break;
          case "FACTURE":
            parentRefs.factureRef = parent.number;
            break;
        }
      }
    }

    // Create document with items
    const document = await prisma.cRMDocument.create({
      data: {
        type: data.type,
        number,
        // P0-3: Draft tracking
        isDraft,
        isLocked,
        issuedAt,
        clientId: data.clientId,
        projectId: data.projectId || null,
        parentId: data.parentId || null,
        ...parentRefs,
        date: data.date ? new Date(data.date.includes("T") ? data.date : `${data.date}T00:00:00.000Z`) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil.includes("T") ? data.validUntil : `${data.validUntil}T00:00:00.000Z`) : null,
        dueDate: data.dueDate ? new Date(data.dueDate.includes("T") ? data.dueDate : `${data.dueDate}T00:00:00.000Z`) : null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate.includes("T") ? data.deliveryDate : `${data.deliveryDate}T00:00:00.000Z`) : null,
        // Client snapshot
        clientName: client.fullName,
        clientAddress: client.billingAddress,
        clientCity: client.billingCity,
        clientIce: client.ice,
        clientPhone: client.phone,
        clientEmail: client.email,
        // Delivery
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryNotes: data.deliveryNotes,
        // Totals
        totalHT: calculated.totalHT,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: calculated.discountAmount,
        netHT: calculated.netHT,
        tvaDetails: calculated.tvaDetails,
        totalTVA: calculated.totalTVA,
        totalTTC: calculated.totalTTC,
        depositPercent: data.depositPercent,
        depositAmount: calculated.depositAmount,
        balance: calculated.totalTTC,
        // Conditions
        deliveryTime: data.deliveryTime,
        includes: data.includes || [],
        excludes: data.excludes || [],
        conditions: data.conditions,
        paymentTerms: data.paymentTerms,
        // Notes
        internalNotes: data.internalNotes,
        publicNotes: data.publicNotes,
        footerText: data.footerText,
        // PV Reception specific fields
        workDescription: data.workDescription,
        hasReserves: data.hasReserves,
        reserves: data.reserves,
        signedBy: data.signedBy,
        // BL Reception specific
        receivedBy: data.receivedBy,
        // Items
        items: {
          create: calculated.items.map((item, idx) => {
            const originalItem = data.items[idx];
            // For PV: extract metadata fields
            const isPV = data.type === "PV_RECEPTION";
            const pvMetadata = isPV && originalItem?.metadata ? originalItem.metadata : null;

            // Build description with PV status/remarks if present
            let itemDescription = item.description || null;
            if (pvMetadata) {
              const statusText = pvMetadata.status || '';
              const remarks = pvMetadata.remarks || '';
              if (statusText || remarks) {
                itemDescription = [
                  statusText && `[${statusText}]`,
                  remarks,
                  itemDescription
                ].filter(Boolean).join(' ');
              }
            }

            return {
              catalogItemId: item.catalogItemId || null,
              sourceBCItemId: item.sourceItemId || null, // Map sourceItemId to sourceBCItemId
              reference: item.reference,
              designation: item.designation,
              description: itemDescription,
              quantity: item.quantity, // For PV: accepted quantity
              unit: item.unit,
              unitPriceHT: item.unitPriceHT,
              discountPercent: item.discountPercent,
              discountAmount: item.discountAmount,
              tvaRate: item.tvaRate,
              totalHT: item.totalHT,
              totalTVA: item.totalTVA,
              totalTTC: item.totalTTC,
              deliveredQty: pvMetadata?.quantityDelivered || null, // For PV: delivered quantity
              order: item.order,
            };
          }),
        },
      },
      include: {
        client: {
          select: { id: true, fullName: true, clientNumber: true },
        },
        project: {
          select: { id: true, name: true, projectNumber: true },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return apiSuccess(
      {
        ...document,
        totalHT: Number(document.totalHT),
        netHT: Number(document.netHT),
        totalTVA: Number(document.totalTVA),
        totalTTC: Number(document.totalTTC),
        // P0-3: Include draft status
        isDraft: document.isDraft,
        isLocked: document.isLocked,
        issuedAt: document.issuedAt,
      },
      201
    );
  } catch (error) {
    return handleApiError(error, "Documents POST");
  }
}
