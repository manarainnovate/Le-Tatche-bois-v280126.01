import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider, Toaster } from "@/components/ui/Toaster";
import { AdminThemeProvider } from "@/contexts/admin-theme-context";
import { ThemeCustomizer } from "@/components/admin/theme-customizer";
import type { UserRole } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// ═══════════════════════════════════════════════════════════
// Allowed Roles
// ═══════════════════════════════════════════════════════════

const ALLOWED_ROLES: UserRole[] = ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE"];

// ═══════════════════════════════════════════════════════════
// Admin Layout
// ═══════════════════════════════════════════════════════════

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  // Check role
  const userRole = session.user.role;
  if (!ALLOWED_ROLES.includes(userRole)) {
    redirect(`/${locale}/admin/login?error=unauthorized`);
  }

  // Prepare user data for client
  const user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };

  return (
    <ToastProvider>
      <AdminProvider user={user} locale={locale}>
        <AdminThemeProvider>
          <div
            className="min-h-screen transition-colors"
            style={{ backgroundColor: 'var(--content-bg, #F9FAFB)' }}
          >
            {/* Sidebar */}
            <Sidebar locale={locale} />

            {/* Main Content */}
            <div className="transition-all duration-300 lg:pl-64">
              {/* Header */}
              <AdminHeader locale={locale} />

              {/* Page Content */}
              <main className="min-h-[calc(100vh-4rem)] p-4 pt-20 md:p-6 md:pt-20 lg:p-8 lg:pt-20">
                {children}
              </main>
            </div>

            {/* Toast Notifications */}
            <Toaster position="top-right" />

            {/* Theme Customizer */}
            <ThemeCustomizer />
          </div>
        </AdminThemeProvider>
      </AdminProvider>
    </ToastProvider>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: {
    template: "%s | Admin - Le Tatche Bois",
    default: "Admin - Le Tatche Bois",
  },
  description: "Administration panel for Le Tatche Bois",
  robots: {
    index: false,
    follow: false,
  },
};
