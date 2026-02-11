/**
 * PDF Generator - Main entry point
 * Loads document from database and routes to appropriate document type generator
 */

import { prisma } from '@/lib/prisma';
import { generateFacturePDF } from './document-types/facture';

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
  const pdfData = {
    document: {
      id: document.id,
      number: document.number,
      date: document.createdAt,
      dueDate: document.dueDate || undefined,
      status: document.status,
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
      buffer = await generateFacturePDF(pdfData);
      break;

    case 'DEVIS':
      // TODO: Implement devis generator
      throw new Error('Génération PDF pour DEVIS pas encore implémentée');

    case 'BON_COMMANDE':
      // TODO: Implement bon commande generator
      throw new Error('Génération PDF pour BON_COMMANDE pas encore implémentée');

    case 'BON_LIVRAISON':
      // TODO: Implement bon livraison generator
      throw new Error('Génération PDF pour BON_LIVRAISON pas encore implémentée');

    case 'PV_RECEPTION':
      // TODO: Implement PV reception generator
      throw new Error('Génération PDF pour PV_RECEPTION pas encore implémentée');

    case 'AVOIR':
      // TODO: Implement avoir generator
      throw new Error('Génération PDF pour AVOIR pas encore implémentée');

    default:
      // Fallback to facture layout for unknown types
      buffer = await generateFacturePDF(pdfData);
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
