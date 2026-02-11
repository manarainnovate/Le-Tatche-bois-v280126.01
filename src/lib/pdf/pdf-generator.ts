/**
 * PDF Generator - Main entry point
 * Loads document from database and routes to appropriate document type generator
 */

import { prisma } from '@/lib/prisma';
import { generateFacturePDF } from './document-types/facture';
import { generateDevisPDF } from './document-types/devis';
import { generateBonCommandePDF } from './document-types/bon-commande';
import { generateBonLivraisonPDF } from './document-types/bon-livraison';
import { generatePVReceptionPDF } from './document-types/pv-reception';
import { generateAvoirPDF } from './document-types/avoir';

/**
 * Generate PDF for any CRM document type
 * @param documentId - CRM Document ID
 * @returns Promise with Buffer and filename
 */
export async function generateDocumentPDF(
  documentId: string
): Promise<{ buffer: Buffer; filename: string }> {
  // 1. Load document from database with all relations
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    include: {
      client: true,
      items: {
        orderBy: { createdAt: 'asc' },
      },
      project: true,
      parent: true,
    },
  });

  if (!document) {
    throw new Error('Document non trouvé');
  }

  if (!document.client) {
    throw new Error('Client manquant pour ce document');
  }

  // 2. Transform data to match PDF generator interface
  // Base data structure for most document types
  const baseData = {
    document: {
      id: document.id,
      number: document.number,
      date: document.createdAt,
      dueDate: document.dueDate || undefined,
      status: document.status,
      client: {
        fullName: document.client.fullName,
        address: document.client.billingAddress || undefined,
        city: document.client.billingCity || undefined,
        ice: document.client.ice || undefined,
      },
      sourceDocuments: document.devisRef || document.bcRef || document.blRef
        ? {
            bonCommande: document.bcRef || undefined,
            bonLivraison: document.blRef || undefined,
          }
        : undefined,
      paymentMethod: document.paymentTerms || undefined,
      bankInfo: undefined, // TODO: Add company bank info
      paymentDate: undefined, // TODO: Track payment date in CRMPayment
    },
  };

  // 3. Route to appropriate generator based on document type
  let buffer: Buffer;

  switch (document.type) {
    case 'FACTURE':
    case 'FACTURE_ACOMPTE':
      buffer = await generateFacturePDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
            unitPriceHT: parseFloat(item.unitPriceHT.toString()),
            discountPercent: item.discountPercent
              ? parseFloat(item.discountPercent.toString())
              : undefined,
            tvaRate: parseFloat(item.tvaRate.toString()),
          })),
        },
      });
      break;

    case 'DEVIS':
      buffer = await generateDevisPDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
            unitPriceHT: parseFloat(item.unitPriceHT.toString()),
            discountPercent: item.discountPercent
              ? parseFloat(item.discountPercent.toString())
              : undefined,
            tvaRate: parseFloat(item.tvaRate.toString()),
          })),
        },
      });
      break;

    case 'BON_COMMANDE':
      buffer = await generateBonCommandePDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
            unitPriceHT: parseFloat(item.unitPriceHT.toString()),
            discountPercent: item.discountPercent
              ? parseFloat(item.discountPercent.toString())
              : undefined,
            tvaRate: parseFloat(item.tvaRate.toString()),
          })),
        },
      });
      break;

    case 'BON_LIVRAISON':
      buffer = await generateBonLivraisonPDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
          })),
        },
      });
      break;

    case 'PV_RECEPTION':
      // PV de réception has a different item structure with 'etat' field
      buffer = await generatePVReceptionPDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            etat: 'Conforme' as const, // Default state, can be customized later
          })),
          reserves: undefined, // TODO: Add reserves field to CRMDocument
        },
      });
      break;

    case 'AVOIR':
      buffer = await generateAvoirPDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
            unitPriceHT: parseFloat(item.unitPriceHT.toString()),
            discountPercent: item.discountPercent
              ? parseFloat(item.discountPercent.toString())
              : undefined,
            tvaRate: parseFloat(item.tvaRate.toString()),
          })),
          refFactureOrigine: undefined, // TODO: Add refFactureOrigine field to CRMDocument
          motif: undefined, // TODO: Add motif field to CRMDocument
        },
      });
      break;

    default:
      // Fallback to facture layout for unknown types
      buffer = await generateFacturePDF({
        ...baseData,
        document: {
          ...baseData.document,
          items: document.items.map((item) => ({
            designation: item.designation,
            description: item.description || undefined,
            quantity: parseFloat(item.quantity.toString()),
            unit: item.unit,
            unitPriceHT: parseFloat(item.unitPriceHT.toString()),
            discountPercent: item.discountPercent
              ? parseFloat(item.discountPercent.toString())
              : undefined,
            tvaRate: parseFloat(item.tvaRate.toString()),
          })),
        },
      });
  }

  // 4. Generate filename
  const typePrefix = document.type.replace('_', '-');
  const filename = `${typePrefix}-${document.number}.pdf`.replace(/[\/\\:*?"<>|]/g, '-');

  return { buffer, filename };
}

/**
 * Validate that a document can be converted to PDF
 * @param documentId - CRM Document ID
 * @returns Promise with validation result
 */
export async function validateDocumentForPDF(documentId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const document = await prisma.cRMDocument.findUnique({
      where: { id: documentId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!document) {
      errors.push('Document non trouvé');
      return { valid: false, errors };
    }

    if (!document.client) {
      errors.push('Client manquant');
    }

    if (!document.items || document.items.length === 0) {
      errors.push('Aucun article dans le document');
    }

    if (!document.number) {
      errors.push('Numéro de document manquant');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating document:', error);
    return {
      valid: false,
      errors: ['Erreur lors de la validation du document'],
    };
  }
}
