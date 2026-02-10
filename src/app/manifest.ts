import { MetadataRoute } from "next";

// ═══════════════════════════════════════════════════════════
// Web App Manifest for PWA capabilities
// ═══════════════════════════════════════════════════════════

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LE TATCHE BOIS - Menuiserie Artisanale",
    short_name: "LE TATCHE BOIS",
    description:
      "Atelier de menuiserie artisanale au Maroc. Fabrication sur mesure de meubles, portes, escaliers et fenêtres en bois.",
    start_url: "/fr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B4513", // Wood brown color
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.jpg",
        sizes: "1920x1080",
        type: "image/jpeg",
        // @ts-expect-error - form_factor is a valid manifest property but not typed
        form_factor: "wide",
        label: "LE TATCHE BOIS - Desktop",
      },
      {
        src: "/screenshots/mobile.jpg",
        sizes: "750x1334",
        type: "image/jpeg",
        // @ts-expect-error - form_factor is a valid manifest property but not typed
        form_factor: "narrow",
        label: "LE TATCHE BOIS - Mobile",
      },
    ],
    shortcuts: [
      {
        name: "Boutique",
        short_name: "Shop",
        url: "/fr/boutique",
        icons: [{ src: "/icons/shop-icon.png", sizes: "96x96" }],
      },
      {
        name: "Devis Gratuit",
        short_name: "Devis",
        url: "/fr/devis",
        icons: [{ src: "/icons/quote-icon.png", sizes: "96x96" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        url: "/fr/contact",
        icons: [{ src: "/icons/contact-icon.png", sizes: "96x96" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
