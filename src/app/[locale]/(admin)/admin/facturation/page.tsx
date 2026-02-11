export const dynamic = 'force-dynamic';


import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// Facturation Index - Redirect to Factures
// ═══════════════════════════════════════════════════════════

interface FacturationPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FacturationPage({ params }: FacturationPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/admin/facturation/factures`);
}
