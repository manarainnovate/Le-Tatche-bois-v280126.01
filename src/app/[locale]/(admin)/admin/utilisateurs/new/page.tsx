export const dynamic = 'force-dynamic';


import { UserForm } from "@/components/admin/forms/UserForm";

// ═══════════════════════════════════════════════════════════
// New User Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewUserPage({ params }: PageProps) {
  const { locale } = await params;

  return <UserForm locale={locale} />;
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "New User",
};
