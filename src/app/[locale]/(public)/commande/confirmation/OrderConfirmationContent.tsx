"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { Card } from "@/components/ui/Card";
import {
  CheckCircle,
  Package,
  Mail,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Copy,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface OrderConfirmationContentProps {
  locale: string;
  orderNumber: string;
  translations: {
    title: string;
    subtitle: string;
    orderNumber: string;
    whatsNext: string;
    emailSent: string;
    emailSentDesc: string;
    preparation: string;
    preparationDesc: string;
    delivery: string;
    deliveryDesc: string;
    continueShopping: string;
    trackOrder: string;
    needHelp: string;
    contactUs: string;
  };
}

// ═══════════════════════════════════════════════════════════
// CONFETTI ANIMATION (Simple CSS-based)
// ═══════════════════════════════════════════════════════════

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            backgroundColor: ["#8B4513", "#D2691E", "#CD853F", "#DEB887", "#22c55e", "#3b82f6"][
              Math.floor(Math.random() * 6)
            ],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function OrderConfirmationContent({
  locale,
  orderNumber,
  translations,
}: OrderConfirmationContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const theme = useThemeSettings();
  const confirmation = theme.boutiqueConfirmation;

  const confirmBgStyle: React.CSSProperties = confirmation.type === "color"
    ? { backgroundColor: confirmation.color }
    : confirmation.type === "image" && confirmation.image
      ? { backgroundImage: `url(${confirmation.image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Copy order number to clipboard
  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen py-12 md:py-16 relative" style={confirmBgStyle}>
      {/* Confetti */}
      {showConfetti && <Confetti />}

      <div className="max-w-2xl mx-auto px-4">
        <div
          ref={contentRef}
          className={cn(
            "transform transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}
        >
          <Card className="p-8 md:p-10 text-center shadow-lg">
            {/* Success Icon with Animation */}
            <div className="relative mb-8">
              <div
                className={cn(
                  "w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto",
                  "animate-bounce-slow"
                )}
              >
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-green-200 animate-ping opacity-20" />
              </div>
            </div>

            {/* Title */}
            <h1
              className={cn(
                "font-heading text-2xl md:text-3xl font-bold mb-2",
                isRTL && "font-arabic"
              )}
              style={{ color: confirmation.titleColor }}
            >
              {translations.title}
            </h1>
            <p className="text-wood-muted text-lg mb-8">{translations.subtitle}</p>

            {/* Order Number */}
            <div className="bg-wood-cream/30 border border-wood-light rounded-xl p-6 mb-8">
              <span className="text-sm text-wood-muted block mb-2">
                {translations.orderNumber}
              </span>
              <div
                className={cn(
                  "flex items-center justify-center gap-3",
                  isRTL && "flex-row-reverse"
                )}
              >
                <p className="text-2xl md:text-3xl font-mono font-bold text-wood-primary">
                  #{orderNumber}
                </p>
                <button
                  onClick={() => void handleCopyOrderNumber()}
                  className={cn(
                    "p-2 rounded-lg hover:bg-wood-light/50 transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-wood-primary"
                  )}
                  title="Copy order number"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-wood-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* What's Next Section */}
            <div className={cn("text-left mb-8", isRTL && "text-right")}>
              <h2
                className={cn(
                  "font-semibold text-lg mb-4",
                  isRTL && "font-arabic"
                )}
                style={{ color: confirmation.titleColor }}
              >
                {translations.whatsNext}
              </h2>

              <div className="space-y-4">
                {/* Email Confirmation */}
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className="font-medium" style={{ color: confirmation.titleColor }}>{translations.emailSent}</p>
                    <p className="text-sm text-wood-muted mt-1">
                      {translations.emailSentDesc}
                    </p>
                  </div>
                </div>

                {/* Preparation */}
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className="font-medium" style={{ color: confirmation.titleColor }}>{translations.preparation}</p>
                    <p className="text-sm text-wood-muted mt-1">
                      {translations.preparationDesc}
                    </p>
                  </div>
                </div>

                {/* Delivery */}
                <div
                  className={cn(
                    "flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className="font-medium" style={{ color: confirmation.titleColor }}>{translations.delivery}</p>
                    <p className="text-sm text-wood-muted mt-1">
                      {translations.deliveryDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/boutique`}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2",
                  "px-6 py-3 rounded-lg font-medium",
                  "border-2 border-wood-light text-wood-dark",
                  "hover:bg-wood-light/30 transition-colors",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                {translations.continueShopping}
              </Link>

              <Link
                href={`/${locale}/commande/suivi?order=${orderNumber}`}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2",
                  "px-6 py-3 rounded-lg font-medium",
                  "bg-gradient-to-r from-wood-primary to-wood-secondary",
                  "text-white shadow-md",
                  "hover:brightness-110 transition-all",
                  isRTL && "flex-row-reverse"
                )}
              >
                {translations.trackOrder}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Link>
            </div>
          </Card>

          {/* Help Link */}
          <p
            className={cn(
              "text-center text-sm text-wood-muted mt-6",
              isRTL && "font-arabic"
            )}
          >
            {translations.needHelp}{" "}
            <Link
              href={`/${locale}/contact`}
              className="text-wood-primary hover:text-wood-secondary hover:underline transition-colors"
            >
              {translations.contactUs}
            </Link>
          </p>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 5s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

OrderConfirmationContent.displayName = "OrderConfirmationContent";
