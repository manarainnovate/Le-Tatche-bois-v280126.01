import { prisma } from "@/lib/prisma";
import { UsersManagementClient } from "./UsersManagementClient";

// ═══════════════════════════════════════════════════════════
// Server Component - Users Management Page
// ═══════════════════════════════════════════════════════════

interface UsersManagementPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersManagementPage({
  params,
}: UsersManagementPageProps) {
  const { locale } = await params;

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <UsersManagementClient users={users} locale={locale} />;
}
