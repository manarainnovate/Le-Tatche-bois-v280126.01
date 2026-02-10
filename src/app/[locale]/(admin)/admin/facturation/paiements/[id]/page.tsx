import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentDetailClient } from "./PaymentDetailClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Payment Detail Page
// ═══════════════════════════════════════════════════════════

interface PaymentDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PaymentDetailPage({
  params,
}: PaymentDetailPageProps) {
  const { locale, id } = await params;

  const payment = await prisma.cRMPayment.findUnique({
    where: { id },
    include: {
      document: {
        select: {
          id: true,
          number: true,
          type: true,
          date: true,
          clientId: true,
          clientName: true,
          clientAddress: true,
          clientCity: true,
          clientPhone: true,
          clientEmail: true,
          totalTTC: true,
          paidAmount: true,
          balance: true,
          status: true,
          client: {
            select: {
              id: true,
              fullName: true,
              clientNumber: true,
            },
          },
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!payment || !payment.document) {
    notFound();
  }

  // Get all payments for this invoice
  const allPayments = await prisma.cRMPayment.findMany({
    where: { documentId: payment.documentId },
    orderBy: { date: "desc" },
  });

  // Transform data
  const transformedPayment = {
    ...payment,
    amount: Number(payment.amount),
    document: {
      ...payment.document,
      totalTTC: Number(payment.document.totalTTC),
      paidAmount: Number(payment.document.paidAmount),
      balance: Number(payment.document.balance),
    },
  };

  const transformedAllPayments = allPayments.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));

  return (
    <PaymentDetailClient
      payment={transformedPayment}
      allPayments={transformedAllPayments}
      locale={locale}
    />
  );
}
