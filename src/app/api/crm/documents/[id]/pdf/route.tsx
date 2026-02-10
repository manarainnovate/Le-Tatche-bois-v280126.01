import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { DocumentPDF } from "@/lib/pdf/DocumentPDF";

// ═══════════════════════════════════════════════════════════
// GET /api/crm/documents/[id]/pdf - Generate PDF
// ═══════════════════════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const document = await prisma.cRMDocument.findUnique({
      where: { id },
      include: {
        client: true,
        project: {
          select: { id: true, name: true, projectNumber: true },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // Get company settings
    const company = await prisma.companySettings.findFirst();

    // Format date helper
    const formatDate = (date: Date | null | undefined): string | undefined => {
      if (!date) return undefined;
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(date));
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <DocumentPDF
        type={document.type as any}
        document={{
          number: document.number,
          date: formatDate(document.date) || "",
          dueDate: formatDate(document.dueDate),
          validUntil: formatDate(document.validUntil),
          deliveryDate: formatDate(document.deliveryDate),
          client: {
            fullName: document.clientName,
            address: document.clientAddress || undefined,
            city: document.clientCity || undefined,
            phone: document.clientPhone || undefined,
            email: document.clientEmail || undefined,
            ice: document.clientIce || undefined,
          },
          project: document.project
            ? {
                name: document.project.name,
                number: document.project.projectNumber,
              }
            : undefined,
          references: {
            devis: document.devisRef || undefined,
            bc: document.bcRef || undefined,
            bl: document.blRef || undefined,
            pv: document.pvRef || undefined,
            facture: document.factureRef || undefined,
          },
          items: document.items.map((item) => ({
            reference: item.reference || undefined,
            designation: item.designation,
            description: item.description || undefined,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPriceHT: Number(item.unitPriceHT),
            tvaRate: Number(item.tvaRate),
            totalHT: Number(item.totalHT),
          })),
          totalHT: Number(document.totalHT),
          discountAmount: Number(document.discountAmount),
          netHT: Number(document.netHT),
          totalTVA: Number(document.totalTVA),
          totalTTC: Number(document.totalTTC),
          depositPercent: document.depositPercent
            ? Number(document.depositPercent)
            : undefined,
          depositAmount: document.depositAmount
            ? Number(document.depositAmount)
            : undefined,
          paymentTerms: document.paymentTerms || undefined,
          deliveryTime: document.deliveryTime || undefined,
          includes: document.includes as string[] | undefined,
          excludes: document.excludes as string[] | undefined,
          conditions: document.conditions || undefined,
          publicNotes: document.publicNotes || undefined,
          footerText: document.footerText || undefined,
          workDescription: document.workDescription || undefined,
          hasReserves: document.hasReserves || undefined,
          reserves: document.reserves || undefined,
          avoirReason: document.avoirReason || undefined,
          receivedBy: document.receivedBy || undefined,
          deliveryNotes: document.deliveryNotes || undefined,
        }}
        company={{
          name: company?.companyName || "LE TATCHE BOIS S.A.R.L A.U",
          tagline: company?.tagline || "Menuiserie artisanat – Décoration",
          address:
            company?.address || "Lot Hamane El Fetouaki N°365, Lamhamid",
          city: company?.city || "Marrakech",
          phone: company?.phone || "0687441840",
          phoneAlt: company?.phoneAlt || "0698013468",
          email: company?.email || "contact@letatchebois.com",
          website: company?.website || "www.letatchbois.com",
          rc: company?.rc || "120511",
          taxId: company?.taxId || "50628346",
          ice: company?.ice || "002942117000021",
          pat: company?.pat || "64601859",
          logoUrl: company?.logoUrl || undefined,
        }}
      />
    );

    // Update PDF generation timestamp
    await prisma.cRMDocument.update({
      where: { id },
      data: {
        pdfGeneratedAt: new Date(),
      },
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.type}-${document.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
