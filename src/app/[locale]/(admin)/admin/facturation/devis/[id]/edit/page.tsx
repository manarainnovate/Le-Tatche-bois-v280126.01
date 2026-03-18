export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DevisFormClient } from "../../new/DevisFormClient";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditDevisPage({ params }: PageProps) {
  const { locale, id } = await params;

  // Fetch the existing document
  const document = await prisma.cRMDocument.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!document || document.type !== "DEVIS") {
    notFound();
  }

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

  // Fetch projects
  const projects = await prisma.cRMProject.findMany({
    select: {
      id: true,
      name: true,
      projectNumber: true,
      clientId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch catalog items
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

  // Get company settings
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

  // Serialize existing document for edit form
  const editDocument = {
    id: document.id,
    number: document.number,
    clientId: document.clientId,
    projectId: document.projectId,
    date: document.date.toISOString().split("T")[0],
    validUntil: document.validUntil ? document.validUntil.toISOString() : null,
    deliveryTime: document.deliveryTime,
    discountType: document.discountType,
    discountValue: document.discountValue ? Number(document.discountValue) : null,
    depositPercent: document.depositPercent ? Number(document.depositPercent) : null,
    publicNotes: document.publicNotes,
    internalNotes: document.internalNotes,
    footerText: document.footerText,
    includes: document.includes as string[] | null,
    excludes: document.excludes as string[] | null,
    items: document.items.map((item) => ({
      id: item.id,
      catalogItemId: item.catalogItemId,
      reference: item.reference,
      designation: item.designation,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPriceHT: Number(item.unitPriceHT),
      discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
      tvaRate: Number(item.tvaRate),
      totalHT: Number(item.totalHT),
    })),
  };

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
      editDocument={editDocument}
    />
  );
}
