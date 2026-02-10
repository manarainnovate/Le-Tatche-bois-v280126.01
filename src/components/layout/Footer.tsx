"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDirection } from "@/hooks/useDirection";
import { useSiteSettings } from "@/stores/siteSettings";
import { useThemeSettings } from "@/stores/themeSettings";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  ArrowUp,
  CreditCard,
  Banknote,
  Send,
  Clock,
} from "lucide-react";
import { CONTACT, getPhoneLink, getEmailLink } from "@/config/contact";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface FooterLink {
  key: string;
  href: string;
}

interface SocialLink {
  name: string;
  icon: typeof Facebook;
  href: string;
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const quickLinks: FooterLink[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/atelier" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/realisations" },
  { key: "shop", href: "/boutique" },
  { key: "contact", href: "/contact" },
];

const serviceLinks: FooterLink[] = [
  { key: "doors", href: "/services/portes" },
  { key: "windows", href: "/services/fenetres" },
  { key: "furniture", href: "/services/mobilier" },
  { key: "stairs", href: "/services/escaliers" },
  { key: "ceilings", href: "/services/plafonds" },
  { key: "restoration", href: "/services/restauration" },
];

const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    icon: Facebook,
    href: CONTACT.social.facebook,
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: CONTACT.social.instagram,
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: CONTACT.social.youtube,
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: CONTACT.social.whatsapp,
  },
];

const legalLinks: FooterLink[] = [
  { key: "privacy", href: "/confidentialite" },
  { key: "terms", href: "/conditions" },
  { key: "cookies", href: "/cookies" },
];

// ═══════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tServices = useTranslations("services.categories");
  const locale = useLocale();
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { logoFooter, siteName, isLoaded: settingsLoaded } = useSiteSettings();
  const { woodTexture, footerEnabled, footerOpacity } = useThemeSettings();

  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    // TODO: Implement newsletter subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEmail("");
    setIsSubscribing(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const showFooterTexture = woodTexture && footerEnabled;

  return (
    <footer className={cn("relative z-10 overflow-hidden text-white/80", !showFooterTexture && "bg-wood-dark")}>
      {/* Footer wood texture background */}
      {showFooterTexture && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${woodTexture})` }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: footerOpacity / 100 }}
          />
        </>
      )}

      {/* Main Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12",
            isRTL && "lg:grid-flow-dense"
          )}
        >
          {/* Column 1: About */}
          <div className={cn(isRTL && "lg:col-start-4 text-right")}>
            {/* Logo - 50% larger */}
            <Link href={`/${locale}`} className="inline-flex items-center mb-4 min-w-[120px] min-h-[64px] md:min-h-[80px] lg:min-h-[96px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoFooter || "/images/logo-light.png"}
                alt={siteName}
                className={cn(
                  "h-16 md:h-20 lg:h-24 w-auto object-contain transition-opacity duration-300",
                  !settingsLoaded && "opacity-0"
                )}
                onError={(e) => {
                  // Hide broken image and show text fallback
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const fallback = img.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = "inline";
                }}
              />
              <span
                className="text-2xl font-bold text-white hidden"
              >
                {siteName}
              </span>
            </Link>

            <p className="text-sm mb-6 leading-relaxed">
              {t("about.description")}
            </p>

            {/* Social Icons */}
            <div className={cn("flex gap-3", isRTL && "justify-end")}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-wood-primary transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={cn(isRTL && "lg:col-start-3 text-right")}>
            <h3 className="text-white font-semibold mb-4">
              {t("quickLinks.title")}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href === "/" ? "" : link.href}`}
                    className="text-sm hover:text-wood-secondary transition-colors"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className={cn(isRTL && "lg:col-start-2 text-right")}>
            <h3 className="text-white font-semibold mb-4">
              {t("services.title")}
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-sm hover:text-wood-secondary transition-colors"
                  >
                    {tServices(`${link.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact + Newsletter */}
          <div className={cn(isRTL && "lg:col-start-1 text-right")}>
            <h3 className="text-white font-semibold mb-4">
              {t("contact.title")}
            </h3>

            {/* Contact Info */}
            <ul className="space-y-3 mb-6">
              <li
                className={cn(
                  "flex items-start gap-3 text-sm",
                  isRTL && "flex-row-reverse"
                )}
              >
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-wood-secondary" />
                <span>{CONTACT.address.full}</span>
              </li>
              <li>
                <a
                  href={getPhoneLink()}
                  className={cn(
                    "flex items-center gap-3 text-sm hover:text-wood-secondary transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Phone className="w-4 h-4 flex-shrink-0 text-wood-secondary" />
                  <span className="ltr-force">{CONTACT.phone.display}</span>
                </a>
              </li>
              <li>
                <a
                  href={getEmailLink()}
                  className={cn(
                    "flex items-center gap-3 text-sm hover:text-wood-secondary transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Mail className="w-4 h-4 flex-shrink-0 text-wood-secondary" />
                  <span>{CONTACT.email.main}</span>
                </a>
              </li>
              <li
                className={cn(
                  "flex items-start gap-3 text-sm",
                  isRTL && "flex-row-reverse"
                )}
              >
                <Clock className="w-4 h-4 mt-1 flex-shrink-0 text-wood-secondary" />
                <div>
                  <div>{CONTACT.hours.schedule[locale as keyof typeof CONTACT.hours.schedule]?.weekdays ?? CONTACT.hours.schedule.fr.weekdays}</div>
                  <div className="text-white/60">{CONTACT.hours.schedule[locale as keyof typeof CONTACT.hours.schedule]?.sunday ?? CONTACT.hours.schedule.fr.sunday}</div>
                </div>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-medium mb-2 text-sm">
                {t("newsletter.title")}
              </h4>
              <p className="text-xs mb-3">{t("newsletter.description")}</p>
              <form
                onSubmit={(e) => void handleNewsletter(e)}
                className={cn("flex gap-2", isRTL && "flex-row-reverse")}
              >
                <Input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSubscribing}
                  isLoading={isSubscribing}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div
            className={cn(
              "flex flex-col md:flex-row items-center justify-between gap-4",
              isRTL && "md:flex-row-reverse"
            )}
          >
            {/* Copyright */}
            <p className="text-sm">{t("copyright", { year: currentYear })}</p>

            {/* Legal Links */}
            <div
              className={cn(
                "flex items-center gap-4 text-sm",
                isRTL && "flex-row-reverse"
              )}
            >
              {legalLinks.map((link, index) => (
                <span key={link.key} className="flex items-center gap-4">
                  <Link
                    href={`/${locale}${link.href}`}
                    className="hover:text-wood-secondary transition-colors"
                  >
                    {t(`legal.${link.key}`)}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-white/20">|</span>
                  )}
                </span>
              ))}
            </div>

            {/* Payment Methods & Back to Top */}
            <div
              className={cn(
                "flex items-center gap-4",
                isRTL && "flex-row-reverse"
              )}
            >
              {/* Payment Icons */}
              <div className="flex items-center gap-2 text-white/60">
                <span title="Stripe">
                  <CreditCard className="w-5 h-5" />
                </span>
                <span title="Cash on Delivery">
                  <Banknote className="w-5 h-5" />
                </span>
              </div>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-wood-primary transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = "Footer";

export default Footer;
