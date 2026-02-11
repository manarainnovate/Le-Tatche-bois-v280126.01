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
// DEVIS (Quote)
// ────────────────────────────────────────────────────────────────────────────────

export { generateDevisPDF } from './devis';

// ────────────────────────────────────────────────────────────────────────────────
// BON DE COMMANDE (Purchase Order)
// ────────────────────────────────────────────────────────────────────────────────

export { generateBonCommandePDF } from './bon-commande';

// ────────────────────────────────────────────────────────────────────────────────
// BON DE LIVRAISON (Delivery Note)
// ────────────────────────────────────────────────────────────────────────────────

export { generateBonLivraisonPDF } from './bon-livraison';

// ────────────────────────────────────────────────────────────────────────────────
// PV DE RÉCEPTION (Reception Report)
// ────────────────────────────────────────────────────────────────────────────────

export { generatePVReceptionPDF } from './pv-reception';

// ────────────────────────────────────────────────────────────────────────────────
// AVOIR (Credit Note)
// ────────────────────────────────────────────────────────────────────────────────

export { generateAvoirPDF } from './avoir';

// ────────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ────────────────────────────────────────────────────────────────────────────────

export { generateFacturePDF as default } from './facture';
