export const dynamic = 'force-dynamic';


import { B2CReportClient } from "./B2CReportClient";

// ═══════════════════════════════════════════════════════════
// Server Component - B2C E-Commerce Report Page
// ═══════════════════════════════════════════════════════════

interface B2CReportPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    period?: string;
    year?: string;
  }>;
}

export default async function B2CReportPage({
  params,
  searchParams,
}: B2CReportPageProps) {
  const { locale } = await params;
  const filters = await searchParams;

  const period = filters.period || "month";
  const year = parseInt(filters.year || new Date().getFullYear().toString());

  return (
    <B2CReportClient
      locale={locale}
      initialPeriod={period}
      initialYear={year}
    />
  );
}
