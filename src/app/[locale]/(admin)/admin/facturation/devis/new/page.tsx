export const dynamic = 'force-dynamic';


import { prisma } from "@/lib/prisma";
import { DevisFormClient } from "./DevisFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - New Devis Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
}

export default async function NewDevisPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const search = await searchParams;

  // Fetch clients
  const clients = await prisma.cRMClient.findMany({
    select: {
      id: true,
      fullName: true,
      clientNumber: true,
      clientType: true,
      phone: true,
      email: true,
      billingAddress: true,
      billingCity: true,
      ice: true,
      taxId: true,
      defaultDiscount: true,
      paymentTerms: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch projects (optional)
  const projects = await prisma.cRMProject.findMany({
    select: {
      id: true,
      name: true,
      projectNumber: true,
      clientId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch catalog items for item selector
  const catalogItems = await prisma.catalogItem.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      type: true,
      unit: true,
      sellingPriceHT: true,
      tvaRate: true,
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get company settings for defaults
  const settings = await prisma.companySettings.findUnique({
    where: { id: "company" },
  });

  // Transform data
  const transformedClients = clients.map((c) => ({
    ...c,
    defaultDiscount: c.defaultDiscount ? Number(c.defaultDiscount) : null,
  }));

  const transformedItems = catalogItems.map((item) => ({
    ...item,
    sellingPriceHT: Number(item.sellingPriceHT),
    tvaRate: Number(item.tvaRate),
  }));

  return (
    <DevisFormClient
      locale={locale}
      clients={transformedClients}
      projects={projects}
      catalogItems={transformedItems}
      settings={{
        quoteValidityDays: settings?.quoteValidityDays || 15,
        defaultDepositPercent: settings?.defaultDepositPercent ? Number(settings.defaultDepositPercent) : null,
        defaultTvaRate: settings?.defaultTvaRate ? Number(settings.defaultTvaRate) : 20,
        quoteFooter: settings?.quoteFooter || null,
      }}
      preselectedClientId={search.clientId}
      preselectedProjectId={search.projectId}
    />
  );
}
