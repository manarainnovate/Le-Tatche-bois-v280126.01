"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { TrackingScripts, GTMNoScript } from "@/components/TrackingScripts";
import { useUIStore } from "@/stores/ui";
import { useThemeSettings } from "@/stores/themeSettings";
import type { PageKey } from "@/stores/themeSettings";

interface Props {
  children: React.ReactNode;
}

interface TrackingSettings {
  googleAnalyticsId?: string;
  googleAnalyticsEnabled?: boolean;
  googleTagManagerId?: string;
  googleTagManagerEnabled?: boolean;
  facebookPixelId?: string;
  facebookPixelEnabled?: boolean;
  tiktokPixelId?: string;
  tiktokPixelEnabled?: boolean;
  pinterestTagId?: string;
  pinterestTagEnabled?: boolean;
}

// Map pathname segment to page key
function getPageKey(pathname: string): PageKey | null {
  // pathname = /fr, /en, /fr/atelier, etc.
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = locale, segments[1] = page
  const page = segments[1] || "home";

  const map: Record<string, PageKey> = {
    home: "home",
    atelier: "atelier",
    services: "services",
    realisations: "realisations",
    boutique: "boutique",
    contact: "contact",
  };

  // Only root (/fr) or first-level pages match
  if (page === "home" && segments.length <= 1) return "home";
  // Skip layout texture for detail sub-pages (e.g. /realisations/[slug])
  // because those pages use their own ThemeWrapper for background
  if (segments.length > 2) return null;
  return map[page] ?? null;
}

export default function PublicLayout({ children }: Props) {
  const { openMobileMenu } = useUIStore();
  const pathname = usePathname();
  const { woodTexture, getPageSettings } = useThemeSettings();
  const [trackingSettings, setTrackingSettings] = useState<TrackingSettings>({});

  // Fetch tracking settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const tracking = data.settings?.tracking || {};
          setTrackingSettings(tracking);
        }
      } catch {
        // Silently fail - tracking is not critical
      }
    };
    fetchSettings();
  }, []);

  // Determine page background (per-page image takes priority over global texture)
  const pageKey = getPageKey(pathname);
  const pageSettings = pageKey ? getPageSettings(pageKey) : null;
  const pageImage = pageSettings?.image || woodTexture;
  const showPageTexture = pageImage && pageSettings?.enabled;

  return (
    <div
      className="min-h-screen flex flex-col"
      data-texture-active={showPageTexture ? "true" : undefined}
    >
      {/* Fixed background texture layer */}
      {showPageTexture && (
        <>
          <div
            className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${pageImage})`,
              zIndex: -2,
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${(pageSettings?.opacity ?? 20) / 100})`,
              zIndex: -1,
            }}
          />
        </>
      )}

      {/* Tracking Scripts */}
      <TrackingScripts
        googleAnalyticsId={trackingSettings.googleAnalyticsId}
        googleAnalyticsEnabled={trackingSettings.googleAnalyticsEnabled}
        googleTagManagerId={trackingSettings.googleTagManagerId}
        googleTagManagerEnabled={trackingSettings.googleTagManagerEnabled}
        facebookPixelId={trackingSettings.facebookPixelId}
        facebookPixelEnabled={trackingSettings.facebookPixelEnabled}
        tiktokPixelId={trackingSettings.tiktokPixelId}
        tiktokPixelEnabled={trackingSettings.tiktokPixelEnabled}
        pinterestTagId={trackingSettings.pinterestTagId}
        pinterestTagEnabled={trackingSettings.pinterestTagEnabled}
      />
      <GTMNoScript gtmId={trackingSettings.googleTagManagerEnabled ? trackingSettings.googleTagManagerId : undefined} />

      <Header onMobileMenuOpen={openMobileMenu} />
      <MobileMenu />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
