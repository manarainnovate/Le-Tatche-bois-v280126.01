export const dynamic = 'force-dynamic';


import { B2BReportClient } from "./B2BReportClient";

// ═══════════════════════════════════════════════════════════
// Server Component - B2B CRM Report Page
// ═══════════════════════════════════════════════════════════

interface B2BReportPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    period?: string;
    year?: string;
  }>;
}

export default async function B2BReportPage({
  params,
  searchParams,
}: B2BReportPageProps) {
  const { locale } = await params;
  const filters = await searchParams;

  const period = filters.period || "month";
  const year = parseInt(filters.year || new Date().getFullYear().toString());

  return (
    <B2BReportClient
      locale={locale}
      initialPeriod={period}
      initialYear={year}
    />
  );
}
