/**
 * PDF Document Types - Main Export
 *
 * Central export point for all PDF document generators
 */

// ────────────────────────────────────────────────────────────────────────────────
// FACTURE (Invoice)
// ────────────────────────────────────────────────────────────────────────────────

export {
  generateFacturePDF,
  type FactureData,
  type FactureItem,
  type FactureClient,
  type SourceDocuments,
} from './facture';

// ────────────────────────────────────────────────────────────────────────────────
// FUTURE DOCUMENT TYPES
// ────────────────────────────────────────────────────────────────────────────────

// TODO: Add when implemented
// export { generateDevisPDF, type DevisData } from './devis';
// export { generateBonLivraisonPDF, type BonLivraisonData } from './bon-livraison';
// export { generateBonCommandePDF, type BonCommandeData } from './bon-commande';
// export { generateAttachementPDF, type AttachementData } from './attachement';

// ────────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ────────────────────────────────────────────────────────────────────────────────

export { generateFacturePDF as default } from './facture';
