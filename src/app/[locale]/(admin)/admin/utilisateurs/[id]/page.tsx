import { notFound } from "next/navigation";
import { UserForm } from "@/components/admin/forms/UserForm";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type UserRole = "ADMIN" | "EDITOR" | "SALES";

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════
// Mock Get User
// ═══════════════════════════════════════════════════════════

function getUser(id: string): UserData | null {
  // In production, fetch from database
  const mockUsers: Record<string, UserData> = {
    "1": {
      id: "1",
      name: "Ahmed Benali",
      email: "ahmed@letatche-bois.ma",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
      avatar: null,
      isActive: true,
    },
    "2": {
      id: "2",
      name: "Fatima Zohra",
      email: "fatima@letatche-bois.ma",
      password: "",
      confirmPassword: "",
      role: "EDITOR",
      avatar: null,
      isActive: true,
    },
    "3": {
      id: "3",
      name: "Mohammed El Amrani",
      email: "mohammed@letatche-bois.ma",
      password: "",
      confirmPassword: "",
      role: "SALES",
      avatar: null,
      isActive: true,
    },
    "4": {
      id: "4",
      name: "Karim Idrissi",
      email: "karim@letatche-bois.ma",
      password: "",
      confirmPassword: "",
      role: "SALES",
      avatar: null,
      isActive: false,
    },
  };

  return mockUsers[id] ?? null;
}

// ═══════════════════════════════════════════════════════════
// Edit User Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { locale, id } = await params;

  const user = getUser(id);

  if (!user) {
    notFound();
  }

  return <UserForm user={user} locale={locale} />;
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Edit User",
};
