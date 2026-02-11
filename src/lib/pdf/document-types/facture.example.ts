/**
 * Example usage of the Facture PDF Generator
 *
 * This file demonstrates how to use generateFacturePDF()
 * DO NOT import this in production code - for reference only
 */

import { generateFacturePDF, FactureData } from './facture';
import fs from 'fs';
import path from 'path';

/**
 * Example: Generate a sample invoice PDF
 */
async function exampleGenerateFacture() {
  // Sample facture data
  const factureData: FactureData = {
    document: {
      id: 'doc_123456',
      number: 'F-2026/0001',
      date: new Date('2026-01-05'),
      dueDate: new Date('2026-02-05'),
      status: 'paid',

      // Client information
      client: {
        fullName: 'M. Ahmed BENANI',
        address: 'Avenue Mohammed V, N° 123',
        city: 'Marrakech',
        ice: '002942117000021',
      },

      // Invoice items
      items: [
        {
          designation: 'Porte en bois massif sur mesure (chêne)',
          description: 'Finition vernie',
          quantity: 2,
          unit: 'U',
          unitPriceHT: 3500.00,
          tvaRate: 0.20,
        },
        {
          designation: 'Fenêtre en bois avec vitrage double',
          quantity: 4,
          unit: 'U',
          unitPriceHT: 2200.00,
          tvaRate: 0.20,
        },
        {
          designation: 'Meuble TV en noyer - Design moderne',
          quantity: 1,
          unit: 'U',
          unitPriceHT: 4800.00,
          discountPercent: 10,  // 10% discount on this item
          tvaRate: 0.20,
        },
        {
          designation: 'Étagère murale en cèdre (200x80cm)',
          quantity: 3,
          unit: 'U',
          unitPriceHT: 1500.00,
          tvaRate: 0.20,
        },
        {
          designation: 'Table à manger en chêne (240x100cm)',
          quantity: 1,
          unit: 'U',
          unitPriceHT: 7500.00,
          tvaRate: 0.20,
        },
      ],

      // Source document references
      sourceDocuments: {
        bonCommande: 'BC-2025/0123',
        bonLivraison: 'BL-2026/0001',
      },

      // Payment information
      paymentMethod: 'Virement bancaire',
      bankInfo: 'Banque Populaire - RIB: 123456789012345678901234',

      // Payment date (for "Acquittée" mention)
      paymentDate: new Date('2026-01-10'),

      // Optional notes
      notes: 'Livraison effectuée avec succès. Merci pour votre confiance.',
      internalNotes: 'Client fidèle - prioritaire',
    },
  };

  try {
    console.log('Generating facture PDF...');

    // Generate PDF
    const pdfBuffer = await generateFacturePDF(factureData);

    // Save to file (example output)
    const outputPath = path.join(process.cwd(), 'output', 'facture-example.pdf');

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✓ Facture PDF generated successfully: ${outputPath}`);
    console.log(`  Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    return pdfBuffer;

  } catch (error) {
    console.error('Error generating facture:', error);
    throw error;
  }
}

/**
 * Example: Simple invoice without payment info
 */
async function exampleSimpleFacture() {
  const simpleData: FactureData = {
    document: {
      id: 'doc_simple',
      number: 'F-2026/0002',
      date: new Date(),
      status: 'pending',

      client: {
        fullName: 'Entreprise XYZ SARL',
        address: 'Zone Industrielle, Lot 45',
        city: 'Casablanca',
        ice: '001234567890123',
      },

      items: [
        {
          designation: 'Cuisine complète en bois massif',
          quantity: 1,
          unit: 'Ens',
          unitPriceHT: 25000.00,
          tvaRate: 0.20,
        },
        {
          designation: 'Installation et finition',
          quantity: 1,
          unit: 'Ens',
          unitPriceHT: 3500.00,
          tvaRate: 0.20,
        },
      ],

      // No source documents
      sourceDocuments: {},
    },
  };

  const pdfBuffer = await generateFacturePDF(simpleData);

  const outputPath = path.join(process.cwd(), 'output', 'facture-simple.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✓ Simple facture generated: ${outputPath}`);

  return pdfBuffer;
}

// ────────────────────────────────────────────────────────────────────────────────
// Run examples (only if executed directly)
// ────────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  (async () => {
    console.log('=== Facture PDF Generator Examples ===\n');

    try {
      // Example 1: Full facture with all fields
      await exampleGenerateFacture();
      console.log('');

      // Example 2: Simple facture
      await exampleSimpleFacture();
      console.log('');

      console.log('✓ All examples completed successfully!');

    } catch (error) {
      console.error('❌ Example failed:', error);
      process.exit(1);
    }
  })();
}

// Export examples for testing
export { exampleGenerateFacture, exampleSimpleFacture };
