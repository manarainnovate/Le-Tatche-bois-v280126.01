export const dynamic = 'force-dynamic';


import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// Redirect from /rft to /pv (PV = Procès-Verbal / RFT = Réception Fin Travaux)
// ═══════════════════════════════════════════════════════════

interface RFTRedirectPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RFTRedirectPage({ params }: RFTRedirectPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/admin/facturation/pv`);
}
