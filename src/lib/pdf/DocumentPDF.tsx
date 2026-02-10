import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#8B4513",
    paddingBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
  },
  companyInfo: {
    textAlign: "right",
    maxWidth: 250,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  companyTagline: {
    fontSize: 8,
    color: "#666",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 8,
    color: "#333",
    lineHeight: 1.4,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBox: {
    width: "48%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#8B4513",
  },
  infoText: {
    fontSize: 9,
    marginBottom: 2,
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#8B4513",
    padding: 8,
  },
  tableHeaderText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 8,
    minHeight: 30,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colRef: { width: "12%" },
  colDesc: { width: "35%" },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "8%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTva: { width: "8%", textAlign: "center" },
  colTotal: { width: "12%", textAlign: "right" },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
  },
  totalLabel: {
    width: 120,
    textAlign: "right",
    paddingRight: 10,
    fontSize: 10,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 10,
  },
  totalFinal: {
    backgroundColor: "#8B4513",
    padding: 8,
    marginTop: 5,
  },
  totalFinalText: {
    color: "white",
    fontWeight: "bold",
  },
  notesSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  notesTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 10,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#8B4513",
    paddingTop: 10,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBox: {
    width: "45%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    minHeight: 80,
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 40,
  },
  paymentSection: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  depositSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff8dc",
    borderRadius: 4,
  },
});

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type DocumentType =
  | "DEVIS"
  | "BON_COMMANDE"
  | "BON_LIVRAISON"
  | "PV_RECEPTION"
  | "FACTURE"
  | "AVOIR";

interface DocumentItem {
  reference?: string;
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  tvaRate: number;
  totalHT: number;
}

interface DocumentData {
  number: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  deliveryDate?: string;
  client: {
    fullName: string;
    company?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    ice?: string;
  };
  project?: {
    name: string;
    number: string;
  };
  references?: {
    devis?: string;
    bc?: string;
    bl?: string;
    pv?: string;
    facture?: string;
  };
  items: DocumentItem[];
  totalHT: number;
  discountAmount?: number;
  netHT: number;
  totalTVA: number;
  totalTTC: number;
  depositPercent?: number;
  depositAmount?: number;
  paymentTerms?: string;
  deliveryTime?: string;
  includes?: string[];
  excludes?: string[];
  conditions?: string;
  publicNotes?: string;
  footerText?: string;
  // PV specific
  workDescription?: string;
  hasReserves?: boolean;
  reserves?: string;
  // Avoir specific
  avoirReason?: string;
  // BL specific
  receivedBy?: string;
  deliveryNotes?: string;
}

interface CompanyData {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  phoneAlt?: string;
  email: string;
  website: string;
  rc: string;
  taxId: string;
  ice: string;
  pat: string;
  logoUrl?: string;
}

interface DocumentPDFProps {
  type: DocumentType;
  document: DocumentData;
  company: CompanyData;
}

// ═══════════════════════════════════════════════════════════
// Document Titles
// ═══════════════════════════════════════════════════════════

const documentTitles: Record<DocumentType, string> = {
  DEVIS: "DEVIS",
  BON_COMMANDE: "BON DE COMMANDE",
  BON_LIVRAISON: "BON DE LIVRAISON",
  PV_RECEPTION: "PROCÈS-VERBAL DE RÉCEPTION",
  FACTURE: "FACTURE",
  AVOIR: "AVOIR",
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function DocumentPDF({ type, document, company }: DocumentPDFProps) {
  const showPrices = type !== "BON_LIVRAISON" && type !== "PV_RECEPTION";
  const showSignatures = type === "PV_RECEPTION" || type === "BON_LIVRAISON";
  const showDeposit = type === "DEVIS" && document.depositAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {company.logoUrl && (
              <Image src={company.logoUrl} style={styles.logo} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyTagline}>{company.tagline}</Text>
            <Text style={styles.companyDetails}>
              {company.address}, {company.city}
              {"\n"}
              Tél: {company.phone}
              {company.phoneAlt ? ` / ${company.phoneAlt}` : ""}
              {"\n"}
              Email: {company.email}
              {"\n"}
              Web: {company.website}
            </Text>
            <Text style={[styles.companyDetails, { marginTop: 5 }]}>
              RC: {company.rc} | IF: {company.taxId}
              {"\n"}
              ICE: {company.ice} | PAT: {company.pat}
            </Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>
          {documentTitles[type]}
          {type === "AVOIR" && " (Note de crédit)"}
        </Text>

        {/* Document Info & Client Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>DOCUMENT</Text>
            <Text style={styles.infoText}>N°: {document.number}</Text>
            <Text style={styles.infoText}>Date: {document.date}</Text>
            {document.dueDate && (
              <Text style={styles.infoText}>Échéance: {document.dueDate}</Text>
            )}
            {document.validUntil && (
              <Text style={styles.infoText}>
                Valide jusqu&apos;au: {document.validUntil}
              </Text>
            )}
            {document.deliveryDate && (
              <Text style={styles.infoText}>
                Date livraison: {document.deliveryDate}
              </Text>
            )}
            {document.references?.devis && (
              <Text style={styles.infoText}>
                Réf. Devis: {document.references.devis}
              </Text>
            )}
            {document.references?.bc && (
              <Text style={styles.infoText}>
                Réf. BC: {document.references.bc}
              </Text>
            )}
            {document.references?.bl && (
              <Text style={styles.infoText}>
                Réf. BL: {document.references.bl}
              </Text>
            )}
            {document.references?.facture && (
              <Text style={styles.infoText}>
                Réf. Facture: {document.references.facture}
              </Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>CLIENT</Text>
            <Text style={[styles.infoText, { fontWeight: "bold" }]}>
              {document.client.fullName}
            </Text>
            {document.client.company && (
              <Text style={styles.infoText}>{document.client.company}</Text>
            )}
            {document.client.address && (
              <Text style={styles.infoText}>{document.client.address}</Text>
            )}
            {document.client.city && (
              <Text style={styles.infoText}>{document.client.city}</Text>
            )}
            {document.client.phone && (
              <Text style={styles.infoText}>Tél: {document.client.phone}</Text>
            )}
            {document.client.ice && (
              <Text style={[styles.infoText, { fontWeight: "bold" }]}>
                ICE: {document.client.ice}
              </Text>
            )}
          </View>
        </View>

        {/* Project Info */}
        {document.project && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 9, color: "#666" }}>
              Projet: {document.project.number} - {document.project.name}
            </Text>
          </View>
        )}

        {/* PV Work Description */}
        {type === "PV_RECEPTION" && document.workDescription && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>TRAVAUX RÉALISÉS</Text>
            <Text style={styles.notesText}>{document.workDescription}</Text>
          </View>
        )}

        {/* Avoir Reason */}
        {type === "AVOIR" && document.avoirReason && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>MOTIF DE L&apos;AVOIR</Text>
            <Text style={styles.notesText}>{document.avoirReason}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colRef]}>Réf</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>
              Désignation
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unité</Text>
            {showPrices && (
              <>
                <Text style={[styles.tableHeaderText, styles.colPrice]}>
                  PU HT
                </Text>
                <Text style={[styles.tableHeaderText, styles.colTva]}>TVA</Text>
                <Text style={[styles.tableHeaderText, styles.colTotal]}>
                  Total HT
                </Text>
              </>
            )}
          </View>
          {document.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={styles.colRef}>{item.reference || "-"}</Text>
              <View style={styles.colDesc}>
                <Text>{item.designation}</Text>
                {item.description && (
                  <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              {showPrices && (
                <>
                  <Text style={styles.colPrice}>
                    {item.unitPriceHT.toFixed(2)}
                  </Text>
                  <Text style={styles.colTva}>{item.tvaRate}%</Text>
                  <Text style={styles.colTotal}>
                    {type === "AVOIR" ? "-" : ""}
                    {item.totalHT.toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        {showPrices && (
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT:</Text>
              <Text style={styles.totalValue}>
                {type === "AVOIR" ? "-" : ""}
                {document.totalHT.toFixed(2)} DH
              </Text>
            </View>
            {document.discountAmount && document.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Remise:</Text>
                <Text style={styles.totalValue}>
                  -{document.discountAmount.toFixed(2)} DH
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT:</Text>
              <Text style={styles.totalValue}>
                {type === "AVOIR" ? "-" : ""}
                {document.netHT.toFixed(2)} DH
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA:</Text>
              <Text style={styles.totalValue}>
                {type === "AVOIR" ? "-" : ""}
                {document.totalTVA.toFixed(2)} DH
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal]}>
              <Text style={[styles.totalLabel, styles.totalFinalText]}>
                TOTAL TTC:
              </Text>
              <Text style={[styles.totalValue, styles.totalFinalText]}>
                {type === "AVOIR" ? "-" : ""}
                {document.totalTTC.toFixed(2)} DH
              </Text>
            </View>
          </View>
        )}

        {/* Deposit for Devis */}
        {showDeposit && (
          <View style={styles.depositSection}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              Acompte à la commande ({document.depositPercent}%):{" "}
              {document.depositAmount?.toFixed(2)} DH
            </Text>
          </View>
        )}

        {/* Delivery Time for Devis */}
        {type === "DEVIS" && document.deliveryTime && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 10 }}>
              <Text style={{ fontWeight: "bold" }}>Délai de réalisation: </Text>
              {document.deliveryTime}
            </Text>
          </View>
        )}

        {/* Payment Terms */}
        {document.paymentTerms && (
          <View style={styles.paymentSection}>
            <Text style={styles.notesTitle}>MODE DE PAIEMENT</Text>
            <Text style={styles.notesText}>{document.paymentTerms}</Text>
          </View>
        )}

        {/* Includes/Excludes for Devis */}
        {type === "DEVIS" && (document.includes?.length || document.excludes?.length) && (
          <View style={{ marginTop: 15, flexDirection: "row", gap: 20 }}>
            {document.includes && document.includes.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={[styles.notesTitle, { color: "green" }]}>
                  INCLUS
                </Text>
                {document.includes.map((item, i) => (
                  <Text key={i} style={styles.notesText}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}
            {document.excludes && document.excludes.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={[styles.notesTitle, { color: "red" }]}>
                  NON INCLUS
                </Text>
                {document.excludes.map((item, i) => (
                  <Text key={i} style={styles.notesText}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* PV Reserves */}
        {type === "PV_RECEPTION" && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              Réception:{" "}
              {document.hasReserves ? "Avec réserves" : "Sans réserves"}
            </Text>
            {document.hasReserves && document.reserves && (
              <View
                style={{
                  marginTop: 5,
                  padding: 10,
                  backgroundColor: "#fff0f0",
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 9 }}>{document.reserves}</Text>
              </View>
            )}
          </View>
        )}

        {/* BL Reception */}
        {type === "BON_LIVRAISON" && (
          <View style={{ marginTop: 15 }}>
            {document.deliveryNotes && (
              <Text style={{ fontSize: 9, marginBottom: 10 }}>
                Notes: {document.deliveryNotes}
              </Text>
            )}
            <Text style={{ fontSize: 10 }}>
              Reçu par: ____________________________
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>
              Date: ____/____/________
            </Text>
          </View>
        )}

        {/* Notes */}
        {document.publicNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>NOTES</Text>
            <Text style={styles.notesText}>{document.publicNotes}</Text>
          </View>
        )}

        {/* Conditions */}
        {document.conditions && (
          <View style={[styles.notesSection, { marginTop: 10 }]}>
            <Text style={styles.notesTitle}>CONDITIONS GÉNÉRALES</Text>
            <Text style={[styles.notesText, { fontSize: 8 }]}>
              {document.conditions}
            </Text>
          </View>
        )}

        {/* Signatures */}
        {showSignatures && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Pour l&apos;entreprise</Text>
              <Text style={{ fontSize: 8, marginTop: 5 }}>
                {company.name}
              </Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Pour le client</Text>
              <Text style={{ fontSize: 8, marginTop: 5 }}>
                {document.client.fullName}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 7, marginTop: 5, color: "#666" }}>
                Lu et approuvé, bon pour accord
              </Text>
            </View>
          </View>
        )}

        {/* Footer Text */}
        {document.footerText && (
          <View
            style={{
              marginTop: 15,
              padding: 10,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 8 }}>{document.footerText}</Text>
          </View>
        )}

        {/* Page Footer */}
        <View style={styles.footer}>
          <Text>
            {company.name} | RC: {company.rc} | IF: {company.taxId} | ICE:{" "}
            {company.ice}
          </Text>
          <Text>
            {company.email} | {company.website}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default DocumentPDF;
