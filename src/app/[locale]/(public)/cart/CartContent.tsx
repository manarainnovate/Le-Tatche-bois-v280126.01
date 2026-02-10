"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Price } from "@/components/ui/Price";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCartStore } from "@/stores/cart";
import { useToast } from "@/hooks/useToast";
import { useThemeSettings } from "@/stores/themeSettings";
import { hexToRgba } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  X,
  Check,
  Package,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface CartContentProps {
  locale: string;
  translations: {
    title: string;
    items: string;
    empty: string;
    emptyDescription: string;
    continueShopping: string;
    clearCart: string;
    removeItem: string;
    orderSummary: string;
    promoCode: string;
    applyCode: string;
    promoApplied: string;
    promoInvalid: string;
    subtotal: string;
    discount: string;
    shipping: string;
    total: string;
    checkout: string;
    freeShippingBadge: string;
    freeShippingThreshold: string;
    secureCheckout: string;
    free: string;
  };
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const FREE_SHIPPING_THRESHOLD = 1000; // Free shipping above 1000 MAD
const SHIPPING_COST = 50; // 50 MAD shipping
const VALID_PROMO_CODES: Record<string, number> = {
  WELCOME10: 0.1, // 10% off
  ARTISAN20: 0.2, // 20% off
};

// ═══════════════════════════════════════════════════════════
// CART ITEM COMPONENT
// ═══════════════════════════════════════════════════════════

function CartItemCard({
  item,
  locale,
  isRTL,
  removeLabel,
  onRemove,
  onUpdateQuantity,
}: {
  item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  locale: string;
  isRTL: boolean;
  removeLabel: string;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  return (
    <Card className="p-4 md:p-6">
      <div
        className={cn(
          "flex gap-4 md:gap-6",
          isRTL && "flex-row-reverse"
        )}
      >
        {/* Product Image */}
        <Link
          href={`/${locale}/boutique/${item.productId}`}
          className="shrink-0 block"
        >
          <span className="relative block w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-wood-light/30">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </span>
        </Link>

        {/* Product Details */}
        <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
          <Link
            href={`/${locale}/boutique/${item.productId}`}
            className="font-medium text-wood-dark hover:text-wood-primary transition-colors line-clamp-2"
          >
            {item.name}
          </Link>
          <div className="mt-1">
            <Price amount={item.price} />
          </div>

          {/* Mobile: Quantity and Remove */}
          <div
            className={cn(
              "flex items-center justify-between mt-4",
              isRTL && "flex-row-reverse"
            )}
          >
            <QuantitySelector
              value={item.quantity}
              onChange={onUpdateQuantity}
              min={1}
              max={10}
              size="sm"
            />
            <button
              onClick={onRemove}
              className={cn(
                "flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{removeLabel}</span>
            </button>
          </div>
        </div>

        {/* Desktop: Line Total */}
        <div
          className={cn(
            "hidden md:flex flex-col items-end justify-between",
            isRTL && "items-start"
          )}
        >
          <Price amount={item.price * item.quantity} size="lg" />
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function CartContent({ locale, translations }: CartContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { success, error } = useToast();
  const theme = useThemeSettings();
  const cart = theme.boutiqueCart;

  const cartBgStyle: React.CSSProperties = cart.type === "color"
    ? { backgroundColor: cart.color }
    : cart.type === "image" && cart.image
      ? { backgroundImage: `url(${cart.image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate totals
  const subtotal = isClient ? getSubtotal() : 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;
  const amountUntilFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  // Handle promo code application
  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    const discountRate = VALID_PROMO_CODES[code];

    if (discountRate) {
      setDiscount(subtotal * discountRate);
      setAppliedPromo(code);
      success(translations.promoApplied, `${Math.round(discountRate * 100)}% off`);
    } else {
      error(translations.promoInvalid);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setDiscount(0);
  };

  // Recalculate discount when subtotal changes
  useEffect(() => {
    if (appliedPromo) {
      const discountRate = VALID_PROMO_CODES[appliedPromo];
      if (discountRate) {
        setDiscount(subtotal * discountRate);
      }
    }
  }, [subtotal, appliedPromo]);

  // Empty cart state
  if (!isClient || items.length === 0) {
    return (
      <main className="min-h-screen py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-wood-light/30 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-wood-muted" />
          </div>
          <h1
            className={cn(
              "font-heading text-2xl md:text-3xl font-bold mb-4",
              isRTL && "text-right"
            )}
            style={{ color: cart.titleColor }}
          >
            {translations.empty}
          </h1>
          <p className="text-wood-muted text-lg mb-8 max-w-md mx-auto">
            {translations.emptyDescription}
          </p>
          <Link
            href={`/${locale}/boutique`}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-8 py-4 text-lg font-medium rounded-lg",
              "bg-gradient-to-r from-wood-primary to-wood-secondary",
              "text-white shadow-md",
              "hover:brightness-110 transition-all duration-200",
              isRTL && "flex-row-reverse"
            )}
          >
            {translations.continueShopping}
            {isRTL ? (
              <ArrowLeft className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 md:py-12 relative" style={cartBgStyle}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1
          className={cn(
            "font-heading text-2xl md:text-3xl font-bold mb-8",
            isRTL && "text-right"
          )}
          style={{ color: cart.titleColor }}
        >
          {translations.title}{" "}
          <span className="font-normal" style={{ color: cart.bodyColor }}>
            ({items.length} {translations.items})
          </span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemCard
                key={item.productId}
                item={item}
                locale={locale}
                isRTL={isRTL}
                removeLabel={translations.removeItem}
                onRemove={() => removeItem(item.productId)}
                onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
              />
            ))}

            {/* Cart Actions */}
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 pt-4",
                isRTL && "flex-row-reverse"
              )}
            >
              <Link
                href={`/${locale}/boutique`}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5",
                  "border-2 border-wood-primary text-wood-primary rounded-lg",
                  "hover:bg-wood-primary hover:text-white transition-colors font-medium",
                  isRTL && "flex-row-reverse"
                )}
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
                {translations.continueShopping}
              </Link>
              <button
                onClick={clearCart}
                className="text-wood-muted hover:text-red-500 transition-colors text-sm"
              >
                {translations.clearCart}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2
                className={cn(
                  "text-lg font-semibold mb-6",
                  isRTL && "text-right"
                )}
                style={{ color: cart.titleColor }}
              >
                {translations.orderSummary}
              </h2>

              {/* Free Shipping Progress */}
              {amountUntilFreeShipping > 0 && (
                <div className="mb-6 p-4 bg-wood-light/30 rounded-lg">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm text-wood-muted mb-2",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Truck className="w-4 h-4" />
                    <span>
                      {translations.freeShippingThreshold.replace(
                        "{amount}",
                        String(Math.ceil(amountUntilFreeShipping))
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-wood-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-wood-primary to-wood-secondary transition-all duration-300"
                      style={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-6">
                {appliedPromo ? (
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 text-green-700",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      <span className="font-medium">{appliedPromo}</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex gap-2",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div className="flex-1">
                      <Input
                        placeholder={translations.promoCode}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        leftIcon={<Tag className="w-4 h-4" />}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium",
                        "border-2 border-wood-primary text-wood-primary",
                        "hover:bg-wood-primary hover:text-white transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {translations.applyCode}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-4 border-t border-wood-light">
                <div
                  className={cn(
                    "flex justify-between",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <span className="text-wood-muted">{translations.subtotal}</span>
                  <Price amount={subtotal} />
                </div>

                {discount > 0 && (
                  <div
                    className={cn(
                      "flex justify-between text-green-600",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <span>{translations.discount}</span>
                    <span className="flex items-center gap-1">
                      -<Price amount={discount} />
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "flex justify-between",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <span className="text-wood-muted">{translations.shipping}</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">{translations.free}</span>
                  ) : (
                    <Price amount={shipping} />
                  )}
                </div>
              </div>

              {/* Total */}
              <div
                className={cn(
                  "flex justify-between py-4 border-t border-wood-light",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span className="text-lg font-semibold" style={{ color: cart.titleColor }}>
                  {translations.total}
                </span>
                <Price amount={total} size="xl" />
              </div>

              {/* Checkout Button */}
              <Link
                href={`/${locale}/checkout`}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2",
                  "px-8 py-4 rounded-lg font-medium text-lg",
                  "bg-gradient-to-r from-wood-primary to-wood-secondary",
                  "text-white shadow-md",
                  "hover:brightness-110 transition-all duration-200",
                  isRTL && "flex-row-reverse"
                )}
              >
                {translations.checkout}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Link>

              {/* Trust Badges */}
              <div
                className={cn(
                  "flex justify-center gap-6 mt-6 pt-6 border-t border-wood-light",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="text-center">
                  <Package className="w-6 h-6 mx-auto text-wood-muted" />
                  <span className="text-xs text-wood-muted block mt-1">
                    {translations.freeShippingBadge}
                  </span>
                </div>
                <div className="text-center">
                  <ShieldCheck className="w-6 h-6 mx-auto text-wood-muted" />
                  <span className="text-xs text-wood-muted block mt-1">
                    {translations.secureCheckout}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

CartContent.displayName = "CartContent";
