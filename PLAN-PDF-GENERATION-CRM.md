# 🔨 PLAN D'IMPLÉMENTATION — Génération PDF Professionnelle
## LE TATCHE BOIS — Admin Panel CRM / Facturation

**Projet GitHub :** `manarainnovate/Le-Tatche-bois-v280126.01`
**Stack :** Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS
**Objectif :** Générer des PDFs professionnels avec design bois (textures, cadre sculpté, filigrane) pour tous les types de documents de facturation, directement depuis l'admin panel.

---

## 📋 RÉSUMÉ DE L'EXISTANT

### Ce qui existe déjà dans l'app :

1. **Module Facturation** dans l'admin panel : `/app/[locale]/(admin)/admin/facturation/`
   - Devis, Bons de commande, Bons de livraison, PV Réception, Factures, Avoirs
   - Pages de détail avec boutons View/Download/Print (déjà implémentés)
   - Fichiers : `FactureDetailClient.tsx`, `DevisDetailClient.tsx`, `BLDetailClient.tsx`, `PVDetailClient.tsx`, `AvoirDetailClient.tsx`

2. **API PDF (basique)** : `/api/crm/documents/[id]/pdf/route.ts`
   - Actuellement retourne du HTML simple (pas un vrai PDF)
   - Doit être remplacé par une vraie génération PDF

3. **Base de données Prisma** : modèles `CRMDocument`, `CRMDocumentItem`, `BillingClient`, `CompanySettings`

4. **Company Settings** stockées en DB (RC, IF, ICE, PAT, adresse, etc.)

### Ce qu'on veut ajouter :

- Vrais PDFs professionnels avec le branding Le Tatche Bois
- Textures bois, cadre sculpté, filigrane logo TB
- 9 types de documents : Facture, Devis, Bon de commande, Bon de livraison, PV Réception, Avoir, Attachement, Situation de Travaux, PV Fin de Travaux
- Montants en lettres en français
- Conformité légale marocaine (CGI Art. 145)

---

## 🏗️ ARCHITECTURE

```
src/
├── lib/
│   └── pdf/
│       ├── base-layout.ts          # Layout partagé (en-tête, pied de page, cadre, filigrane)
│       ├── pdf-generator.ts        # Fonction principale de génération
│       ├── document-types/
│       │   ├── facture.ts          # Layout spécifique facture
│       │   ├── devis.ts            # Layout spécifique devis
│       │   ├── bon-commande.ts     # Layout spécifique BC
│       │   ├── bon-livraison.ts    # Layout spécifique BL
│       │   ├── pv-reception.ts     # Layout spécifique PV
│       │   ├── avoir.ts            # Layout spécifique avoir
│       │   ├── attachement.ts      # Layout spécifique attachement
│       │   ├── situation-travaux.ts # Layout spécifique situation
│       │   └── fin-travaux.ts      # Layout spécifique PV fin
│       ├── helpers/
│       │   ├── french-numbers.ts   # Conversion montant → lettres
│       │   ├── format-utils.ts     # Formatage nombres, dates
│       │   └── table-builder.ts    # Construction tableaux PDF
│       └── assets/                 # Images embarquées (base64 ou fichiers)
│           ├── logo-header.png     # Logo TB pour en-tête
│           ├── logo-watermark.png  # Logo filigrane centre page
│           ├── wood-bg.png         # Texture bois fond page
│           ├── wood-bar.png        # Texture bois barres
│           ├── wood-header.png     # Texture bois en-têtes tableau
│           ├── frame-top.png       # Cadre sculpté haut
│           ├── frame-bottom.png    # Cadre sculpté bas
│           ├── frame-left.png      # Cadre sculpté gauche
│           └── frame-right.png     # Cadre sculpté droite
├── app/
│   └── api/
│       └── crm/
│           └── documents/
│               └── [id]/
│                   └── pdf/
│                       └── route.ts  # API endpoint (à REMPLACER)
```

---

## 📦 DÉPENDANCES À INSTALLER

```bash
npm install pdfkit
npm install @types/pdfkit --save-dev
```

> **Pourquoi PDFKit ?** C'est la lib Node.js la plus robuste pour la génération PDF côté serveur. Elle supporte nativement les images, le clipping, les transformations, les fonts custom — tout ce dont on a besoin pour les textures bois et le cadre sculpté. Elle fonctionne parfaitement dans les API Routes Next.js.

---

## ✅ TÂCHES DÉTAILLÉES

---

### TÂCHE 1 : Copier les assets images dans le projet

**Fichier :** `public/pdf-assets/` (ou `src/lib/pdf/assets/`)

Copier ces images depuis le repo ou les recréer :

| Fichier | Description | Dimensions approx |
|---------|-------------|-------------------|
| `logo-header.png` | Logo TB transparent pour en-tête | ~300x300px |
| `logo-watermark.png` | Logo TB texture bois pour filigrane | ~1129x756px |
| `wood-bg.png` | Texture bois claire pour fond de page | ~800x1200px |
| `wood-bar.png` | Texture bois dorée pour barres séparatrices | ~800x100px |
| `wood-header.png` | Texture bois foncée pour en-têtes tableau | ~800x100px |
| `frame-top.png` | Bande cadre sculpté haut | ~1282x83px |
| `frame-bottom.png` | Bande cadre sculpté bas | ~1282x83px |
| `frame-left.png` | Bande cadre sculpté gauche | ~57x1864px |
| `frame-right.png` | Bande cadre sculpté droite | ~57x1864px |

> **Note :** Les images sont disponibles dans le dossier `/home/claude/` de la session de design. Elles peuvent aussi être trouvées en pièces jointes de la conversation Claude ou régénérées à partir des originaux.

**Vérification :** Toutes les images existent dans `public/pdf-assets/` et sont lisibles.

---

### TÂCHE 2 : Créer le helper de conversion montant en lettres

**Fichier :** `src/lib/pdf/helpers/french-numbers.ts`

```typescript
/**
 * Convertit un nombre en mots français
 * Exemples :
 *   156180 → "Cent cinquante-six mille cent quatre-vingts"
 *   1234.56 → "Mille deux cent trente-quatre Dirhams ; 56 Cts TTC"
 *
 * Gère : millions, milliers, centaines
 * Particularités françaises : soixante-dix, quatre-vingts, quatre-vingt-dix
 */
export function numberToFrench(n: number): string { ... }
export function amountInFrench(amount: number): string { ... }
```

**Logique complète :**
- `units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']`
- `tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']`
- Règles : 70-79 = soixante + (10-19), 80 = quatre-vingts (avec s), 81-89 = quatre-vingt-un (sans s), 90-99 = quatre-vingt + (10-19)
- Millions prend un "s" au pluriel, mille jamais de "s"
- Capitaliser la première lettre du résultat final
- Format : `"{montant en lettres} Dirhams ; {centimes} Cts TTC"`

**Vérification :** Tester avec : 0, 1, 21, 71, 80, 81, 100, 200, 1000, 1500, 156180, 1000000.

---

### TÂCHE 3 : Créer le helper de formatage

**Fichier :** `src/lib/pdf/helpers/format-utils.ts`

```typescript
/**
 * Formate un nombre en format marocain : 1 234 567,89
 */
export function formatNumber(n: number): string { ... }

/**
 * Formate une date en format français : 05/01/2026
 */
export function formatDate(d: Date | string): string { ... }

/**
 * Formate une date en format long : 5 janvier 2026
 */
export function formatDateLong(d: Date | string): string { ... }
```

**Vérification :** formatNumber(1234567.89) → "1 234 567,89"

---

### TÂCHE 4 : Créer le layout de base (papier en-tête partagé)

**Fichier :** `src/lib/pdf/base-layout.ts`

C'est le fichier le plus important. Il dessine tous les éléments communs à tous les documents.

**Constantes de design :**
```typescript
// Couleurs
const BROWN_DARK = '#4A2511';    // Texte principal, titres
const BROWN_MEDIUM = '#6B3A22';  // Accents
const GOLD = '#C4973B';          // Bordures, séparateurs
const GOLD_DARK = '#8B6914';     // Labels en-tête, URL
const GOLD_LIGHT = '#F5E6C8';    // Fond tableau header
const GRAY_DARK = '#444444';     // Texte secondaire

// Company info
const COMPANY = {
  name: 'LE TATCHE BOIS',
  type: 'S.A.R.L.A.U',
  activity: 'Menuiserie Artisanat - Décoration',
  address: 'LOT HAMANE EL FETOUAKI N° 365',
  city: 'LAMHAMID - MARRAKECH',
  tel1: '0687 44 104',
  tel2: '0658 01 34 68',
  email: 'letatichebole@ymail.com',
  rc: '120511',
  if_num: '50628346',
  ice: '002942117000021',
  pat: '64601859',
  website: 'www.letatchebois.com',
  contact_email: 'contact@letatchebois.com',
};
```

**Fonctions à implémenter :**

```typescript
/**
 * Dessine le fond texture bois (pleine page, très léger)
 * - Image wood-bg.png étirée sur toute la page A4
 * - Opacité très faible (~15-20%)
 */
function drawWoodBackground(doc: PDFKit.PDFDocument): void { ... }

/**
 * Dessine le filigrane logo TB au centre de la page
 * - Image logo-watermark.png
 * - Centré horizontalement, légèrement sous le centre vertical
 * - Opacité 6%
 * - Taille : ~180mm x 130mm
 */
function drawCenterWatermark(doc: PDFKit.PDFDocument): void { ... }

/**
 * Dessine l'en-tête avec logo et infos entreprise
 * - Logo à gauche (35x35mm)
 * - "LE TATCHE BOIS" en gros (22pt bold)
 * - S.A.R.L.A.U • Menuiserie Artisanat - Décoration
 * - Tél, Email à gauche
 * - Adresse à droite (aligné à droite)
 * - Barre séparateur texture bois en bas
 * @returns headerBottomY - position Y du bas de l'en-tête
 */
function drawHeader(doc: PDFKit.PDFDocument): number { ... }

/**
 * Dessine le titre du document + date
 * - Ex: "FACTURE  N° : F-2026/0001" en 11.5pt bold brun
 * - Auto-réduction de la taille si le texte est trop long
 * - "Date : __/__/2026" en 10pt bold brun
 * @returns { titleY, fieldsY, leftX } - positions pour le contenu
 */
function drawDocumentTitle(
  doc: PDFKit.PDFDocument,
  headerBottomY: number,
  docType: string,
  docNumber: string,
  docDate: string
): { titleY: number; fieldsY: number; leftX: number } { ... }

/**
 * Dessine le cadre client à droite
 * - Bordure dorée (0.8pt)
 * - "Client :" en label brun
 * - Nom en bold, adresse, ville, ICE
 * - 75mm de large, 28mm de haut
 * @returns clientBottomY - position Y du bas du cadre
 */
function drawClientBox(
  doc: PDFKit.PDFDocument,
  topY: number,
  client: { name: string; address: string; city: string; ice?: string }
): number { ... }

/**
 * Dessine le pied de page
 * - Barre texture bois séparateur
 * - Adresse centrée
 * - RC | IF | ICE | PAT (labels en bold brun, valeurs en gris)
 * - Email | contact@letatchebois.com | Tél
 * - www.letatchebois.com en bold doré
 */
function drawFooter(doc: PDFKit.PDFDocument): void { ... }

/**
 * Dessine le cadre bois sculpté (4 bandes fines sur les bords)
 * - frame-top.png en haut (4mm d'épaisseur)
 * - frame-bottom.png en bas
 * - frame-left.png à gauche
 * - frame-right.png à droite
 */
function drawBorderFrame(doc: PDFKit.PDFDocument): void { ... }

/**
 * Dessine le tableau des articles/prestations
 * - En-têtes avec texture bois foncée + texte blanc
 * - Colonnes : N°, DÉSIGNATION, U, QTÉ, P.U. HT, TOTAL HT
 * - Lignes alternées (blanc/beige léger)
 * - Section totaux : Total HT, TVA, Total TTC
 * - Gère le débordement sur page 2 si trop d'articles
 * @returns { afterTableY, totalTTC }
 */
function drawItemsTable(
  doc: PDFKit.PDFDocument,
  startY: number,
  items: Array<{
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
  }>,
  tvaRate: number,
  showTVA: boolean
): { afterTableY: number; totalTTC: number } { ... }

/**
 * Section signatures (2 colonnes)
 * - "Le client :" à gauche, "Pour LE TATCHE BOIS :" à droite
 * - Cadres pointillés dorés pour signatures
 */
function drawSignatureSection(doc: PDFKit.PDFDocument, startY: number): void { ... }
```

**Vérification :** Générer un PDF vide avec juste le layout de base (header + footer + cadre + filigrane) et vérifier visuellement.

---

### TÂCHE 5 : Créer les layouts spécifiques par type de document

Chaque fichier dans `src/lib/pdf/document-types/` utilise les fonctions de `base-layout.ts` et ajoute ses propres champs.

#### 5.1 — `facture.ts`

```typescript
export async function generateFacturePDF(data: {
  document: CRMDocument & { items: CRMDocumentItem[]; client: BillingClient };
  company: CompanySettings;
}): Promise<Buffer> { ... }
```

**Layout spécifique :**
- Titre : `FACTURE  N° : FAC-2026-0001`
- Champs gauche : Date, Réf. Bon de commande, Réf. Bon de livraison
- Cadre Client à droite
- Tableau articles avec TVA
- Montant en lettres : `*****Arrêté la présente facture à la somme de : ******`
- Section banque + mode de paiement
- Signatures
- Mention légale : `Mention « Acquittée » + date si paiement reçu`

#### 5.2 — `devis.ts`

**Layout spécifique :**
- Titre : `DEVIS  N° : DEV-2026-0001`
- Champs gauche : Date, Validité (30 jours), Nature (Menuiserie bois)
- Cadre Client
- Tableau articles avec TVA
- Conditions de validité en bas

#### 5.3 — `bon-commande.ts`

**Layout spécifique :**
- Titre : `BON DE COMMANDE  N° : BC-2026-0001`
- Champs gauche : Date, Réf. Devis
- Cadre Client
- Tableau articles avec TVA
- Conditions de livraison

#### 5.4 — `bon-livraison.ts`

**Layout spécifique :**
- Titre : `BON DE LIVRAISON  N° : BL-2026-0001`
- Champs gauche : Date, Réf. Facture, Réf. Devis
- Cadre Client
- Tableau simplifié : N°, Désignation, Qté, Observations (PAS de prix)
- Zone signatures + observations

#### 5.5 — `pv-reception.ts`

**Layout spécifique :**
- Titre : `PV DE RÉCEPTION  N° : PV-2026-0001`
- Champs gauche : Date, Réf. BL, Réf. Facture
- Cadre Client
- Tableau : N°, Désignation, Qté, État (Conforme/Réserves/Non conforme)
- Zone réserves
- Signatures client + entreprise

#### 5.6 — `avoir.ts`

**Layout spécifique :**
- Titre : `AVOIR  N° : AV-2026-0001`
- Champs gauche : Date, Réf. Facture d'origine
- Cadre Client
- Tableau articles (montants négatifs)
- Motif de l'avoir

#### 5.7 — `attachement.ts` (NOUVEAU TYPE)

**Layout spécifique :**
- Titre : `ATTACHEMENT  N° : ATT-2026-0001`
- Champs gauche : Date, Nature (Menuiserie bois), Marché N°
- Cadre Client (Maître d'ouvrage)
- Tableau articles avec unités variées (U, ML, M², ENS, Forfait)
- Montant en lettres
- Signatures

#### 5.8 — `situation-travaux.ts` (NOUVEAU TYPE)

**Layout spécifique :**
- Titre : `SITUATION DE TRAVAUX  N° : ST-2026-0001`
- Champs gauche : Date, Nature, Situation N° / Période, Marché N°
- Cadre Client
- Tableau articles
- Montant en lettres
- Signatures

#### 5.9 — `fin-travaux.ts` (NOUVEAU TYPE)

**Layout spécifique :**
- Titre : `PV DE RÉCEPTION — FIN DE TRAVAUX  N° : PV-2026-0001`
- Champs : Maître d'ouvrage, Adresse chantier, Nature travaux, Réf. Devis/Marché, Dates début/fin
- Corps de texte PV
- Cases à cocher : Réception SANS réserves / AVEC réserves
- Lignes pour réserves
- Délai de levée des réserves
- 2 cadres signatures : Entreprise + Maître d'ouvrage

**Vérification par type :** Générer un PDF de test pour chaque type et vérifier le rendu visuel.

---

### TÂCHE 6 : Créer le générateur principal

**Fichier :** `src/lib/pdf/pdf-generator.ts`

```typescript
import { generateFacturePDF } from './document-types/facture';
import { generateDevisPDF } from './document-types/devis';
// ... etc

export async function generateDocumentPDF(
  documentId: string
): Promise<{ buffer: Buffer; filename: string }> {
  // 1. Charger le document depuis Prisma avec client + items
  const document = await prisma.cRMDocument.findUnique({
    where: { id: documentId },
    include: {
      client: true,
      items: { orderBy: { order: 'asc' } },
      project: true,
    },
  });

  if (!document) throw new Error('Document non trouvé');

  // 2. Charger les settings entreprise
  const company = await prisma.companySettings.findFirst();

  // 3. Router vers le bon générateur selon le type
  let buffer: Buffer;

  switch (document.type) {
    case 'DEVIS':
      buffer = await generateDevisPDF({ document, company });
      break;
    case 'BON_COMMANDE':
      buffer = await generateBonCommandePDF({ document, company });
      break;
    case 'BON_LIVRAISON':
      buffer = await generateBonLivraisonPDF({ document, company });
      break;
    case 'PV_RECEPTION':
      buffer = await generatePVReceptionPDF({ document, company });
      break;
    case 'FACTURE':
      buffer = await generateFacturePDF({ document, company });
      break;
    case 'AVOIR':
      buffer = await generateAvoirPDF({ document, company });
      break;
    // Nouveaux types
    case 'ATTACHEMENT':
      buffer = await generateAttachementPDF({ document, company });
      break;
    case 'SITUATION_TRAVAUX':
      buffer = await generateSituationTravauxPDF({ document, company });
      break;
    case 'FIN_TRAVAUX':
      buffer = await generateFinTravauxPDF({ document, company });
      break;
    default:
      buffer = await generateFacturePDF({ document, company });
  }

  const filename = `${document.type}-${document.number}.pdf`;
  return { buffer, filename };
}
```

**Vérification :** Appeler `generateDocumentPDF('some-id')` en test et vérifier qu'il retourne un buffer PDF valide.

---

### TÂCHE 7 : Remplacer l'API endpoint PDF

**Fichier :** `src/app/api/crm/documents/[id]/pdf/route.ts`

**REMPLACER** tout le contenu actuel par :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentPDF } from '@/lib/pdf/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { buffer, filename } = await generateDocumentPDF(params.id);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du PDF' },
      { status: error.message === 'Document non trouvé' ? 404 : 500 }
    );
  }
}
```

**Vérification :** Depuis le navigateur, accéder à `/api/crm/documents/{id}/pdf` et vérifier qu'un PDF se charge.

---

### TÂCHE 8 : Ajouter les nouveaux types de documents au schéma Prisma (si nécessaire)

**Fichier :** `prisma/schema.prisma`

Vérifier que l'enum `DocumentType` inclut les nouveaux types :

```prisma
enum DocumentType {
  DEVIS
  BON_COMMANDE
  BON_LIVRAISON
  PV_RECEPTION
  FACTURE
  AVOIR
  ATTACHEMENT         // NOUVEAU
  SITUATION_TRAVAUX   // NOUVEAU
  FIN_TRAVAUX         // NOUVEAU
}
```

Si modifié, lancer :
```bash
npx prisma migrate dev --name add-new-document-types
npx prisma generate
```

**Vérification :** `npx prisma studio` → vérifier que les types apparaissent.

---

### TÂCHE 9 : Ajouter les pages admin pour les nouveaux types

**Dossiers à créer :**
```
src/app/[locale]/(admin)/admin/facturation/
├── attachement/
│   ├── page.tsx              # Liste des attachements
│   ├── AttachementPageClient.tsx
│   ├── new/
│   │   └── page.tsx          # Nouveau attachement
│   └── [id]/
│       ├── page.tsx          # Détail
│       └── AttachementDetailClient.tsx
├── situation/
│   ├── page.tsx
│   ├── SituationPageClient.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── SituationDetailClient.tsx
└── fin-travaux/
    ├── page.tsx
    ├── FinTravauxPageClient.tsx
    ├── new/
    │   └── page.tsx
    └── [id]/
        ├── page.tsx
        └── FinTravauxDetailClient.tsx
```

Chaque page suit le même pattern que les pages existantes (Devis, Facture, etc.) mais avec les champs spécifiques du type.

**Vérification :** Navigation vers chaque nouvelle page sans erreur 404.

---

### TÂCHE 10 : Mettre à jour la sidebar admin

**Fichier :** Le composant sidebar qui contient le menu Facturation

Ajouter sous "Facturation (B2B)" :
```
Facturation (B2B)
├── Devis
├── Bons Commande
├── Bons Livraison
├── PV Réception
├── Factures
├── Avoirs
├── Attachements      ← NOUVEAU
├── Situations        ← NOUVEAU
└── PV Fin Travaux    ← NOUVEAU
```

**Vérification :** Les 3 nouvelles entrées apparaissent dans la sidebar.

---

### TÂCHE 11 : Connecter les boutons View/Download/Print

Les boutons existent déjà dans les pages détail. Vérifier qu'ils appellent bien :

```typescript
// View (ouvrir dans nouvel onglet)
window.open(`/api/crm/documents/${documentId}/pdf`, '_blank');

// Download
const response = await fetch(`/api/crm/documents/${documentId}/pdf`);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${document.type}-${document.number}.pdf`;
a.click();

// Print
const printWindow = window.open(`/api/crm/documents/${documentId}/pdf`, '_blank');
printWindow?.addEventListener('load', () => printWindow.print());
```

**Vérification :** Cliquer sur chaque bouton et vérifier le comportement attendu.

---

## 🎨 DESIGN REFERENCE

### Couleurs exactes

| Élément | Couleur | Hex |
|---------|---------|-----|
| Titre document | Brun foncé | `#4A2511` |
| Labels | Brun foncé | `#4A2511` |
| Texte principal | Noir | `#000000` |
| Texte secondaire | Gris foncé | `#444444` |
| Bordures cadre client | Or | `#C4973B` |
| Barre séparateur | Texture bois | Image |
| En-tête tableau | Texture bois foncée | Image + texte blanc |
| Lignes alternées | Beige/Blanc | `rgba(252,248,240,0.4)` / `rgba(255,255,255,0.4)` |
| URL pied de page | Or foncé | `#8B6914` |

### Dimensions page A4

| Élément | Position/Taille |
|---------|-----------------|
| Page | 210mm × 297mm |
| Marge gauche | 20-25mm |
| Marge droite | 20mm |
| En-tête | 45mm de haut |
| Pied de page | 22mm de haut |
| Cadre client | 75mm × 28mm, aligné à droite |
| Filigrane | 180mm × 130mm, centré |
| Cadre sculpté | 4mm d'épaisseur sur chaque bord |
| Titre document | 11.5pt bold (auto-réduit) |
| Date | 10pt bold |
| Champs | 9pt regular, espacement 16pt |

### Informations légales obligatoires (Maroc CGI Art. 145)

Chaque facture/document DOIT contenir :
- Nom et adresse du vendeur
- Numéro RC (Registre Commerce)
- Numéro IF (Identifiant Fiscal)
- Numéro ICE (Identifiant Commun de l'Entreprise)
- Numéro de Patente
- Nom et adresse de l'acheteur
- Date de la facture
- Numéro de la facture
- Désignation des biens/services
- Prix unitaire HT
- TVA applicable
- Montant total TTC

---

## 🧪 CHECKLIST DE VALIDATION FINALE

- [ ] `npm install pdfkit @types/pdfkit` exécuté
- [ ] Assets images copiés dans `public/pdf-assets/`
- [ ] `french-numbers.ts` : test `amountInFrench(156180.50)` → "Cent cinquante-six mille cent quatre-vingts Dirhams ; 50 Cts TTC"
- [ ] `base-layout.ts` : génère un PDF de base valide
- [ ] Chaque type de document génère un PDF correct :
  - [ ] Facture
  - [ ] Devis
  - [ ] Bon de commande
  - [ ] Bon de livraison
  - [ ] PV Réception
  - [ ] Avoir
  - [ ] Attachement
  - [ ] Situation de travaux
  - [ ] PV Fin de travaux
- [ ] API `/api/crm/documents/[id]/pdf` retourne un vrai PDF
- [ ] Boutons View/Download/Print fonctionnent
- [ ] En-tête avec logo + infos entreprise
- [ ] Pied de page avec www.letatchebois.com + contact@letatchebois.com
- [ ] Filigrane logo TB visible mais subtil
- [ ] Cadre bois sculpté sur les 4 bords
- [ ] Textures bois sur barres et en-têtes tableau
- [ ] Montant en lettres en français correct
- [ ] Conformité légale marocaine (RC, IF, ICE, PAT affichés)
- [ ] `npm run build` passe sans erreur
- [ ] Prisma schema à jour avec nouveaux types
- [ ] Sidebar admin mise à jour

---

## 📎 FICHIER DE RÉFÉRENCE

Le script Python complet qui génère les PDFs de design est disponible ici :
**`/home/claude/generate_docs.py`** (dans la session Claude de design)

Ce fichier contient toute la logique de layout, positions, couleurs, et dimensions exactes à reproduire en TypeScript/PDFKit. Il fait ~1200 lignes et couvre tous les 7 types de documents.

Pour le consulter, demander à Claude de l'afficher ou le copier.

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Tâche 1** — Copier les assets images
2. **Tâche 2** — Helper conversion montant en lettres
3. **Tâche 3** — Helper formatage
4. **Tâche 4** — Layout de base (le plus gros morceau)
5. **Tâche 5.1** — Layout facture (tester bout en bout)
6. **Tâche 7** — Remplacer API endpoint
7. **Tâche 11** — Tester View/Download/Print
8. **Tâche 5.2 → 5.6** — Autres layouts existants
9. **Tâche 8** — Nouveaux types Prisma
10. **Tâche 5.7 → 5.9** — Nouveaux layouts
11. **Tâche 9** — Pages admin nouveaux types
12. **Tâche 10** — Sidebar
