import { Suspense } from "react";

// ═══════════════════════════════════════════════════════════
// Auth Layout - Simple layout for login/auth pages
// ═══════════════════════════════════════════════════════════

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-800 to-amber-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Connexion - Le Tatche Bois",
  description: "Connectez-vous a l'administration de Le Tatche Bois",
  robots: {
    index: false,
    follow: false,
  },
};
