import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════
// Root Layout - Only this file should have <html> and <body>
// ═══════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B4513" },
    { media: "(prefers-color-scheme: dark)", color: "#5D2E0C" },
  ],
};

// Dynamic metadata with favicon from database
export async function generateMetadata(): Promise<Metadata> {
  let favicon = "/favicon.ico";

  try {
    const faviconSetting = await prisma.setting.findUnique({
      where: { group_key: { group: "general", key: "favicon" } },
    });
    if (faviconSetting?.value && typeof faviconSetting.value === "string" && faviconSetting.value.startsWith("/")) {
      favicon = faviconSetting.value;
    }
  } catch (error) {
    // Use default favicon if database fetch fails
    console.error("Failed to fetch favicon setting:", error);
  }

  return {
    title: {
      template: "%s | LE TATCHE BOIS",
      default: "LE TATCHE BOIS - Artisan Menuisier Marocain",
    },
    description: "Atelier de menuiserie marocain - Créations bois sur mesure",
    icons: {
      icon: [
        { url: favicon, sizes: "any" },
        { url: "/icons/icon-32x32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party domains for performance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
