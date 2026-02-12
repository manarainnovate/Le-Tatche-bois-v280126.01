export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import { UserForm } from "@/components/admin/forms/UserForm";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type UserRole = "ADMIN" | "EDITOR" | "SALES" | "COMMERCIAL" | "MANAGER";

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | "";
  avatar: string | null;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════
// Edit User Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { locale, id } = await params;

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      image: true,
      isActive: true,
      phone: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Transform for UserForm
  const userData: UserData = {
    id: user.id,
    name: user.name || "",
    email: user.email,
    password: "",
    confirmPassword: "",
    role: user.role as UserRole,
    avatar: user.avatar || user.image || null,
    isActive: user.isActive,
  };

  return <UserForm user={userData} locale={locale} />;
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Edit User",
};
