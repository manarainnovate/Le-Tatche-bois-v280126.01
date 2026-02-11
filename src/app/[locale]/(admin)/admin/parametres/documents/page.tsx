export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { DocumentSettingsClient } from "./DocumentSettingsClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Document Settings Page
// ═══════════════════════════════════════════════════════════

interface DocumentSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DocumentSettingsPage({
  params,
}: DocumentSettingsPageProps) {
  const { locale } = await params;

  // Get or create company settings (which includes document settings)
  let settings = await prisma.companySettings.findFirst();

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        id: "company",
      },
    });
  }

  // Transform to the expected format
  const documentSettings = {
    id: settings.id,
    devisPrefix: settings.devisPrefix,
    bcPrefix: settings.bcPrefix,
    blPrefix: settings.blPrefix,
    pvPrefix: settings.pvPrefix,
    facturePrefix: settings.facturePrefix,
    avoirPrefix: settings.avoirPrefix,
    defaultValidityDays: settings.quoteValidityDays,
    defaultPaymentDays: settings.defaultPaymentDays,
    // These fields don't exist in CompanySettings - use defaults
    defaultPaymentTerms: "Paiement à réception de facture",
    defaultDeliveryTime: "Selon disponibilité",
    devisFooter: "Ce devis est valable 30 jours à compter de sa date d'émission.",
    factureFooter: "En cas de retard de paiement, des pénalités de retard seront appliquées.",
    blFooter: null,
    generalConditions: null,
    showLogo: true,
    showBankInfo: true,
    showSignature: true,
  };

  return <DocumentSettingsClient settings={documentSettings} locale={locale} />;
}
