# PDF Document Types

This directory contains specialized PDF generators for different document types used by LE TATCHE BOIS.

## Available Document Types

### 1. Facture (Invoice) - `facture.ts`

Generates professional invoice PDFs conforming to Moroccan CGI art. 145.

**Features:**
- Professional wood-themed layout
- TVA (20%) calculations
- Amount in French words
- Source document references (Bon de Commande, Bon de Livraison)
- Payment information section
- Client ICE display
- "Acquittée" mention for paid invoices
- Signature sections for vendor and client

**Usage:**

```typescript
import { generateFacturePDF, FactureData } from '@/lib/pdf/document-types/facture';

const factureData: FactureData = {
  document: {
    id: 'doc_123',
    number: 'F-2026/0001',
    date: new Date(),
    status: 'pending',

    client: {
      fullName: 'Client Name',
      address: 'Client Address',
      city: 'City',
      ice: 'ICE Number',
    },

    items: [
      {
        designation: 'Product description',
        quantity: 2,
        unit: 'U',
        unitPriceHT: 1500.00,
        tvaRate: 0.20,
      },
      // ... more items
    ],

    // Optional fields
    sourceDocuments: {
      bonCommande: 'BC-2026/0001',
      bonLivraison: 'BL-2026/0001',
    },
    paymentMethod: 'Virement bancaire',
    paymentDate: new Date(), // If paid
  },
};

// Generate PDF
const pdfBuffer = await generateFacturePDF(factureData);

// Save or send to client
fs.writeFileSync('facture.pdf', pdfBuffer);
```

**Required Fields:**
- `document.number` - Invoice number (e.g., "F-2026/0001")
- `document.date` - Invoice date
- `document.client.fullName` - Client name or company name
- `document.items` - Array of at least one item with:
  - `designation` - Item description
  - `quantity` - Quantity
  - `unit` - Unit of measure (e.g., "U", "Ens", "m²")
  - `unitPriceHT` - Unit price excluding VAT
  - `tvaRate` - VAT rate (usually 0.20 for 20%)

**Optional Fields:**
- `document.client.address` - Client address
- `document.client.city` - Client city
- `document.client.ice` - Client ICE number
- `document.sourceDocuments.bonCommande` - Purchase order reference
- `document.sourceDocuments.bonLivraison` - Delivery note reference
- `document.paymentMethod` - Payment method description
- `document.bankInfo` - Bank information
- `document.paymentDate` - Payment date (shows "Acquittée" mention)
- `document.discountGlobal` - Global discount percentage
- `items[].discountPercent` - Item-level discount percentage

**Output:**
Returns a `Promise<Buffer>` containing the complete PDF file.

**Example:**
See `facture.example.ts` for complete working examples.

---

## Common Layout Elements

All document types use shared layout functions from `../base-layout.ts`:

- `drawWoodBackground()` - Subtle wood texture background
- `drawCenterWatermark()` - Large centered logo watermark (6% opacity)
- `drawHeader()` - Company header with logo and contact info
- `drawClientBox()` - Client information box
- `drawItemsTable()` - Items table with TVA calculations
- `drawSignatureSection()` - Signature boxes for vendor and client
- `drawFooter()` - Legal footer with company identifiers
- `drawBorderFrame()` - Ornate wood border frame

## PDF Assets

Required assets are located in:
`/public/pdf-assets/le-tatche-bois-pdf-assets/`

- `logo-header.png` - Header logo
- `logo-watermark.png` - Large watermark logo
- `wood-bg.png` - Wood background texture
- `wood-header.png` - Wood texture for table headers
- `frame-*.png` - Border frame images (top, bottom, left, right)

## Reference

The implementation is based on the Python/ReportLab reference:
`/public/pdf-assets/le-tatche-bois-pdf-assets/REFERENCE-generate_docs.py`

Lines 733-816 contain the original `create_facture()` function.

## Future Document Types

Planned document generators:
- `devis.ts` - Quotation (Devis)
- `bon-livraison.ts` - Delivery note (Bon de Livraison)
- `bon-commande.ts` - Purchase order (Bon de Commande)
- `attachement.ts` - Work progress tracking (Attachement)

Each will follow the same pattern as `facture.ts`.
