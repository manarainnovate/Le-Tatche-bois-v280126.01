"use client";

import { Phone, Mail, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface SocialLink {
  name: string;
  icon: typeof Facebook;
  href: string;
  color: string;
}

// ═══════════════════════════════════════════════════════════
// SOCIAL LINKS DATA
// ═══════════════════════════════════════════════════════════

const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/letatche-bois",
    color: "hover:text-blue-400",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/letatche-bois",
    color: "hover:text-pink-400",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@letatche-bois",
    color: "hover:text-red-400",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://wa.me/212500000000",
    color: "hover:text-green-400",
  },
];

// ═══════════════════════════════════════════════════════════
// TOPBAR COMPONENT
// ═══════════════════════════════════════════════════════════

export function TopBar() {
  const direction = useDirection();
  const isRTL = direction === "rtl";

  return (
    <div className="bg-wood-dark text-white/80 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={cn(
            "flex items-center justify-between h-10 text-sm",
            isRTL && "flex-row-reverse"
          )}
        >
          {/* Left side - Contact Info */}
          <div
            className={cn(
              "flex items-center gap-6",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* Phone */}
            <a
              href="tel:+212500000000"
              className={cn(
                "flex items-center gap-2 hover:text-white transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <Phone className="w-4 h-4" />
              <span className="ltr-force">+212 5XX XX XX XX</span>
            </a>

            {/* Divider */}
            <span className="w-px h-4 bg-white/20" aria-hidden="true" />

            {/* Email */}
            <a
              href="mailto:contact@letatche-bois.ma"
              className={cn(
                "flex items-center gap-2 hover:text-white transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <Mail className="w-4 h-4" />
              <span>contact@letatche-bois.ma</span>
            </a>
          </div>

          {/* Right side - Social + Switchers */}
          <div
            className={cn(
              "flex items-center gap-4",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* Social Icons */}
            <div
              className={cn(
                "flex items-center gap-3",
                isRTL && "flex-row-reverse"
              )}
            >
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("transition-colors", social.color)}
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <span className="w-px h-4 bg-white/20" aria-hidden="true" />

            {/* Language Switcher */}
            <LanguageSwitcher variant="minimal" />

            {/* Divider */}
            <span className="w-px h-4 bg-white/20" aria-hidden="true" />

            {/* Currency Switcher */}
            <CurrencySwitcher variant="minimal" />
          </div>
        </div>
      </div>
    </div>
  );
}

TopBar.displayName = "TopBar";

export default TopBar;
