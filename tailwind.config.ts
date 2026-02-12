import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wood Workshop Theme Colors
        wood: {
          primary: "#8B4513",    // Saddle Brown - Main brand color
          secondary: "#D2691E",  // Chocolate - Accent color
          light: "#F5DEB3",      // Wheat - Light backgrounds
          dark: "#5D3A1A",       // Dark Brown - Headers, footers
          cream: "#FFF8DC",      // Cornsilk - Page backgrounds
          accent: "#CD853F",     // Peru - Hover states
          muted: "#A0826D",      // Muted brown - Secondary text
        },
        gold: {
          DEFAULT: "#C9A227",    // Gold - Premium accents
          light: "#E5C76B",
          dark: "#8B7355",
        },
        // Semantic colors
        success: {
          DEFAULT: "#22C55E",
          light: "#BBF7D0",
          dark: "#166534",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#B45309",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#DC2626",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#1D4ED8",
        },
      },
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Noto Sans Arabic", "Tahoma", "sans-serif"],
      },
      fontSize: {
        "display-1": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-2": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-1": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-2": ["2.25rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "heading-3": ["1.875rem", { lineHeight: "1.3" }],
        "heading-4": ["1.5rem", { lineHeight: "1.35" }],
        "heading-5": ["1.25rem", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "wood": "0 4px 14px 0 rgba(139, 69, 19, 0.15)",
        "wood-lg": "0 10px 40px 0 rgba(139, 69, 19, 0.2)",
        "wood-xl": "0 20px 60px 0 rgba(139, 69, 19, 0.25)",
        "gold": "0 4px 14px 0 rgba(201, 162, 39, 0.3)",
        "inner-wood": "inset 0 2px 4px 0 rgba(139, 69, 19, 0.1)",
      },
      backgroundImage: {
        "wood-gradient": "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
        "wood-gradient-dark": "linear-gradient(135deg, #5D3A1A 0%, #8B4513 100%)",
        "gold-gradient": "linear-gradient(135deg, #C9A227 0%, #E5C76B 100%)",
        "cream-gradient": "linear-gradient(180deg, #FFF8DC 0%, #F5DEB3 100%)",
        "wood-texture": "url('/images/wood-texture.png')",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "shake": "shake 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },
      transitionDuration: {
        "400": "400ms",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    // RTL utilities plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ({ addUtilities }: any) {
      addUtilities({
        // Keep LTR direction even in RTL context (for code, numbers)
        ".ltr-force": {
          direction: "ltr",
        },
        // Text alignment that respects RTL
        ".text-start": {
          "text-align": "start",
        },
        ".text-end": {
          "text-align": "end",
        },
        // Margin/padding that respect RTL using logical properties
        ".ms-auto": {
          "margin-inline-start": "auto",
        },
        ".me-auto": {
          "margin-inline-end": "auto",
        },
        ".ps-4": {
          "padding-inline-start": "1rem",
        },
        ".pe-4": {
          "padding-inline-end": "1rem",
        },
        // Border that respects RTL
        ".border-s": {
          "border-inline-start-width": "1px",
        },
        ".border-e": {
          "border-inline-end-width": "1px",
        },
        // Rounded corners that respect RTL
        ".rounded-s": {
          "border-start-start-radius": "0.5rem",
          "border-end-start-radius": "0.5rem",
        },
        ".rounded-e": {
          "border-start-end-radius": "0.5rem",
          "border-end-end-radius": "0.5rem",
        },
      });
    },
  ],
};

export default config;
