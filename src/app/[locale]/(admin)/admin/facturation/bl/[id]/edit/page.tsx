export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { BLFormClient } from "../../new/BLFormClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Edit Bon de Livraison
// ═══════════════════════════════════════════════════════════

interface EditBLPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditBLPage({ params }: EditBLPageProps) {
  const { locale, id } = await params;

  // Fetch the BL to edit
  const document = await prisma.cRMDocument.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, fullName: true, clientNumber: true },
      },
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!document) {
    notFound();
  }

  if (document.type !== "BON_LIVRAISON") {
    redirect(`/${locale}/admin/facturation/bl`);
  }

  // Fetch clients (for the selector — disabled in edit mode)
  const clients = await prisma.cRMClient.findMany({
    select: {
      id: true,
      fullName: true,
      clientNumber: true,
      email: true,
      phone: true,
      billingAddress: true,
      billingCity: true,
      billingPostalCode: true,
    },
    orderBy: { fullName: "asc" },
  });

  // Fetch available BCs (for the selector — disabled in edit mode)
  const bonsCommande = await prisma.cRMDocument.findMany({
    where: {
      type: "BON_COMMANDE",
      status: { in: ["CONFIRMED", "PARTIAL"] },
    },
    include: {
      client: { select: { id: true, fullName: true, clientNumber: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const editDocument = {
    id: document.id,
    clientId: document.clientId,
    date: document.date,
    deliveryDate: document.deliveryDate,
    deliveryAddress: document.deliveryAddress,
    publicNotes: document.publicNotes,
    internalNotes: document.internalNotes,
    items: document.items.map((item) => ({
      id: item.id,
      reference: item.reference,
      designation: item.designation,
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit,
      unitPriceHT: Number(item.unitPriceHT),
      tvaRate: Number(item.tvaRate),
    })),
  };

  return (
    <BLFormClient
      locale={locale}
      clients={clients}
      bonsCommande={bonsCommande.map((bc) => ({
        ...bc,
        totalTTC: Number(bc.totalTTC),
        items: bc.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPriceHT: Number(item.unitPriceHT),
          discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          discountAmount: Number(item.discountAmount),
          totalHT: Number(item.totalHT),
          tvaRate: Number(item.tvaRate),
          totalTVA: Number(item.totalTVA),
          totalTTC: Number(item.totalTTC),
        })),
      }))}
      editDocument={editDocument}
    />
  );
}
