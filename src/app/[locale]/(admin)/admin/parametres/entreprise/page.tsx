export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { CompanySettingsClient } from "./CompanySettingsClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Company Settings Page
// ═══════════════════════════════════════════════════════════

interface CompanySettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CompanySettingsPage({
  params,
}: CompanySettingsPageProps) {
  const { locale } = await params;

  // Get or create company settings
  let settings = await prisma.companySettings.findFirst();

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        id: "company",
        companyName: "LE TATCHE BOIS S.A.R.L A.U",
        tagline: "Menuiserie artisanat – Décoration",
        address: "Lot Hamane El Fetouaki N°365, Lamhamid",
        city: "Marrakech",
        country: "Maroc",
        phone: "0687441840",
        phoneAlt: "0698013468",
        email: "contact@letatchebois.com",
        website: "www.letatchebois.com",
        rc: "120511",
        taxId: "50628346",
        ice: "002942117000021",
        pat: "64601859",
        defaultTvaRate: 20,
      },
    });
  }

  const transformedSettings = {
    ...settings,
    defaultTvaRate: settings.defaultTvaRate ? Number(settings.defaultTvaRate) : 20,
  };

  return <CompanySettingsClient settings={transformedSettings} locale={locale} />;
}
