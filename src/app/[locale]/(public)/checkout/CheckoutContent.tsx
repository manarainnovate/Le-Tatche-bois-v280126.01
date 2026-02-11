"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Price } from "@/components/ui/Price";
import { useCartStore } from "@/stores/cart";
import { useToast } from "@/hooks/useToast";
import { useThemeSettings } from "@/stores/themeSettings";
import {
  CreditCard,
  Banknote,
  Loader2,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  Package,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface CheckoutContentProps {
  locale: string;
  translations: {
    title: string;
    backToCart: string;
    contact: {
      title: string;
      email: string;
      phone: string;
    };
    shipping: {
      title: string;
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    payment: {
      title: string;
      card: string;
      cardSecure: string;
      cod: string;
      codDesc: string;
      cardDisabled: string;
    };
    summary: {
      title: string;
      subtotal: string;
      shipping: string;
      total: string;
      free: string;
    };
    placeOrder: string;
    processing: string;
    validation: {
      required: string;
      emailInvalid: string;
      phoneInvalid: string;
      minLength: string;
    };
    error: string;
    emptyCart: string;
  };
}

// ═══════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════

const createCheckoutSchema = (t: CheckoutContentProps["translations"]["validation"]) =>
  z.object({
    firstName: z.string().min(2, t.minLength.replace("{min}", "2")),
    lastName: z.string().min(2, t.minLength.replace("{min}", "2")),
    email: z.string().email(t.emailInvalid),
    phone: z.string().min(10, t.phoneInvalid),
    address: z.string().min(5, t.minLength.replace("{min}", "5")),
    city: z.string().min(2, t.minLength.replace("{min}", "2")),
    postalCode: z.string().min(4, t.minLength.replace("{min}", "4")),
    country: z.string().min(1),
    paymentMethod: z.enum(["cod", "card"]),
  });

type CheckoutFormData = z.infer<ReturnType<typeof createCheckoutSchema>>;

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 50;

// ═══════════════════════════════════════════════════════════
// PAYMENT OPTION COMPONENT
// ═══════════════════════════════════════════════════════════

function PaymentOption({
  value,
  selected,
  icon: Icon,
  title,
  description,
  isRTL,
  showLock,
  disabled,
  onChange,
}: {
  value: string;
  selected: boolean;
  icon: typeof CreditCard;
  title: string;
  description: string;
  isRTL: boolean;
  showLock?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200",
        disabled
          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
          : selected
          ? "border-wood-primary bg-wood-light/20 shadow-sm cursor-pointer"
          : "border-wood-light hover:border-wood-muted cursor-pointer",
        isRTL && "flex-row-reverse"
      )}
    >
      <input
        type="radio"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
      />

      {/* Radio Circle */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          disabled
            ? "border-gray-300"
            : selected
            ? "border-wood-primary"
            : "border-wood-muted"
        )}
      >
        {selected && !disabled && <div className="w-3 h-3 rounded-full bg-wood-primary" />}
      </div>

      {/* Icon */}
      <Icon className={cn("w-6 h-6 shrink-0", disabled ? "text-gray-400" : "text-wood-muted")} />

      {/* Content */}
      <div className={cn("flex-1", isRTL && "text-right")}>
        <span className={cn("font-medium", disabled ? "text-gray-500" : "text-wood-dark")}>
          {title}
        </span>
        <p className={cn("text-sm", disabled ? "text-gray-400" : "text-wood-muted")}>
          {description}
        </p>
      </div>

      {/* Lock Icon */}
      {showLock && !disabled && <Lock className="w-4 h-4 text-green-600 shrink-0" />}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function CheckoutContent({ locale, translations }: CheckoutContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const router = useRouter();
  const { error: toastError } = useToast();
  const theme = useThemeSettings();
  const checkout = theme.boutiqueCheckout;

  const checkoutBgStyle: React.CSSProperties = checkout.type === "color"
    ? { backgroundColor: checkout.color }
    : checkout.type === "image" && checkout.image
      ? { backgroundImage: `url(${checkout.image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

  const { items, getSubtotal, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isStripeConfigured, setIsStripeConfigured] = useState(false);

  // Handle hydration and check Stripe configuration
  useEffect(() => {
    setIsClient(true);
    // Check if Stripe is configured
    fetch("/api/stripe/create-session")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        setIsStripeConfigured(data.configured === true);
      })
      .catch(() => setIsStripeConfigured(false));
  }, []);

  // Redirect if cart is empty (but NOT if order was just completed)
  useEffect(() => {
    if (isClient && items.length === 0 && !orderComplete) {
      router.push(`/${locale}/cart`);
    }
  }, [isClient, items.length, router, locale, orderComplete]);

  // Calculate totals
  const subtotal = isClient ? getSubtotal() : 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  // Form setup
  const checkoutSchema = createCheckoutSchema(translations.validation);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Maroc",
      paymentMethod: "cod", // Default to COD since Stripe is disabled
    },
  });

  const paymentMethod = watch("paymentMethod");

  // Handle Stripe card payment
  const handleStripePayment = async (data: CheckoutFormData) => {
    try {
      const response = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
          },
          locale,
        }),
      });

      const sessionData = (await response.json()) as { url?: string; error?: string };

      if (sessionData.url) {
        // Set flag and clear cart before redirecting to Stripe
        setOrderComplete(true);
        clearCart();
        window.location.href = sessionData.url;
      } else {
        throw new Error(sessionData.error ?? "Failed to create Stripe session");
      }
    } catch (err) {
      console.error("Stripe error:", err);
      toastError(translations.error, err instanceof Error ? err.message : "Une erreur est survenue");
      setIsSubmitting(false);
    }
  };

  // Handle Cash on Delivery payment
  const handleCODPayment = async (data: CheckoutFormData) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
          shipping: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          },
          paymentMethod: "cod",
          subtotal,
          shippingCost: shipping,
          total,
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to create order");
      }

      const orderData = (await response.json()) as { orderId: string; success: boolean };

      if (orderData.success && orderData.orderId) {
        // Set flag BEFORE clearing cart to prevent redirect to /cart
        setOrderComplete(true);

        // Small delay to ensure state is set, then clear cart and redirect
        setTimeout(() => {
          clearCart();
          window.location.href = `/${locale}/checkout/success?order=${orderData.orderId}`;
        }, 100);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toastError(translations.error, err instanceof Error ? err.message : "Une erreur est survenue");
      setIsSubmitting(false);
    }
  };

  // Form submission
  const onSubmit = async (data: CheckoutFormData) => {
    console.log('🛒 Form submitted:', data);
    setIsSubmitting(true);

    if (data.paymentMethod === "card") {
      await handleStripePayment(data);
    } else {
      await handleCODPayment(data);
    }
  };

  // Show loading while order is being processed/redirecting
  if (orderComplete) {
    return (
      <main className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-wood-primary mx-auto mb-4" />
          <p className="text-lg font-medium" style={{ color: checkout.titleColor }}>
            {paymentMethod === "card"
              ? isRTL ? "جاري التحويل إلى صفحة الدفع..." : "Redirection vers la page de paiement..."
              : isRTL ? "جاري تأكيد الطلب..." : "Confirmation de votre commande..."}
          </p>
        </div>
      </main>
    );
  }

  // Show nothing while checking cart (prevents flash)
  if (!isClient || items.length === 0) {
    return (
      <main className="min-h-screen py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 md:py-12 relative" style={checkoutBgStyle}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className={cn("mb-8", isRTL && "text-right")}>
          <Link
            href={`/${locale}/cart`}
            className={cn(
              "inline-flex items-center gap-2 text-wood-primary hover:text-wood-secondary transition-colors mb-4",
              isRTL && "flex-row-reverse"
            )}
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{translations.backToCart}</span>
          </Link>
          <h1 className="font-heading text-2xl md:text-3xl font-bold" style={{ color: checkout.titleColor }}>
            {translations.title}
          </h1>
        </div>

        <form onSubmit={(e) => {
          console.log('📝 Form submit attempt, errors:', errors);
          void handleSubmit(onSubmit)(e);
        }}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h2
                  className={cn(
                    "text-lg font-semibold mb-6",
                    isRTL && "text-right"
                  )}
                  style={{ color: checkout.titleColor }}
                >
                  {translations.contact.title}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={translations.contact.email}
                    type="email"
                    error={errors.email?.message}
                    required
                    {...register("email")}
                  />
                  <Input
                    label={translations.contact.phone}
                    type="tel"
                    error={errors.phone?.message}
                    required
                    placeholder="+212 6XX XXX XXX"
                    {...register("phone")}
                  />
                </div>
              </Card>

              {/* Shipping Information */}
              <Card className="p-6">
                <h2
                  className={cn(
                    "text-lg font-semibold mb-6",
                    isRTL && "text-right"
                  )}
                  style={{ color: checkout.titleColor }}
                >
                  {translations.shipping.title}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={translations.shipping.firstName}
                    error={errors.firstName?.message}
                    required
                    {...register("firstName")}
                  />
                  <Input
                    label={translations.shipping.lastName}
                    error={errors.lastName?.message}
                    required
                    {...register("lastName")}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label={translations.shipping.address}
                      error={errors.address?.message}
                      required
                      {...register("address")}
                    />
                  </div>
                  <Input
                    label={translations.shipping.city}
                    error={errors.city?.message}
                    required
                    {...register("city")}
                  />
                  <Input
                    label={translations.shipping.postalCode}
                    error={errors.postalCode?.message}
                    required
                    {...register("postalCode")}
                  />
                  {/* Country Dropdown */}
                  <div className={cn("md:col-span-2", isRTL && "text-right")}>
                    <label className="block text-sm font-medium text-wood-dark mb-2">
                      {translations.shipping.country}
                    </label>
                    <select
                      {...register("country")}
                      className={cn(
                        "w-full px-4 py-3 border border-wood-light rounded-xl",
                        "bg-white text-wood-dark",
                        "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 focus:border-wood-primary",
                        "transition-colors duration-200",
                        isRTL && "text-right"
                      )}
                    >
                      <option value="Maroc">🇲🇦 {isRTL ? "المغرب" : "Maroc"}</option>
                      <option value="France">🇫🇷 France</option>
                      <option value="Espagne">🇪🇸 {isRTL ? "إسبانيا" : "Espagne"}</option>
                      <option value="Belgique">🇧🇪 {isRTL ? "بلجيكا" : "Belgique"}</option>
                      <option value="Suisse">🇨🇭 {isRTL ? "سويسرا" : "Suisse"}</option>
                      <option value="Allemagne">🇩🇪 {isRTL ? "ألمانيا" : "Allemagne"}</option>
                      <option value="Pays-Bas">🇳🇱 {isRTL ? "هولندا" : "Pays-Bas"}</option>
                      <option value="Italie">🇮🇹 {isRTL ? "إيطاليا" : "Italie"}</option>
                      <option value="Royaume-Uni">🇬🇧 {isRTL ? "المملكة المتحدة" : "Royaume-Uni"}</option>
                      <option value="États-Unis">🇺🇸 {isRTL ? "الولايات المتحدة" : "États-Unis"}</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Autre">🌍 {isRTL ? "أخرى" : "Autre"}</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2
                  className={cn(
                    "text-lg font-semibold mb-6",
                    isRTL && "text-right"
                  )}
                  style={{ color: checkout.titleColor }}
                >
                  {translations.payment.title}
                </h2>

                <div className="space-y-4">
                  {/* Card payment */}
                  <PaymentOption
                    value="card"
                    selected={paymentMethod === "card"}
                    icon={CreditCard}
                    title={translations.payment.card}
                    description={isStripeConfigured ? translations.payment.cardSecure : translations.payment.cardDisabled}
                    isRTL={isRTL}
                    showLock={isStripeConfigured && paymentMethod === "card"}
                    disabled={!isStripeConfigured}
                    onChange={(value) => setValue("paymentMethod", value as "cod" | "card")}
                  />

                  {/* Cash on Delivery */}
                  <PaymentOption
                    value="cod"
                    selected={paymentMethod === "cod"}
                    icon={Banknote}
                    title={translations.payment.cod}
                    description={translations.payment.codDesc}
                    isRTL={isRTL}
                    onChange={(value) => setValue("paymentMethod", value as "cod" | "card")}
                  />
                </div>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2
                  className={cn(
                    "text-lg font-semibold mb-6",
                    isRTL && "text-right"
                  )}
                  style={{ color: checkout.titleColor }}
                >
                  {translations.summary.title}
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className={cn("flex gap-3", isRTL && "flex-row-reverse")}
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-wood-light/30 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-wood-primary text-white text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <p className="text-sm font-medium truncate" style={{ color: checkout.titleColor }}>
                          {item.name}
                        </p>
                        <Price amount={item.price} size="sm" />
                      </div>
                      <div className={cn("shrink-0", isRTL && "text-left")}>
                        <Price amount={item.price * item.quantity} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 py-4 border-t border-wood-light">
                  <div
                    className={cn(
                      "flex justify-between text-sm",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <span className="text-wood-muted">{translations.summary.subtotal}</span>
                    <Price amount={subtotal} />
                  </div>
                  <div
                    className={cn(
                      "flex justify-between text-sm",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <span className="text-wood-muted">{translations.summary.shipping}</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">
                        {translations.summary.free}
                      </span>
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
                  <span className="text-lg font-semibold" style={{ color: checkout.titleColor }}>
                    {translations.summary.total}
                  </span>
                  <Price amount={total} size="xl" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2",
                    "px-8 py-4 rounded-lg font-medium text-lg",
                    paymentMethod === "card"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700"
                      : "bg-gradient-to-r from-wood-primary to-wood-secondary",
                    "text-white shadow-md",
                    "hover:brightness-110 transition-all duration-200",
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {translations.processing}
                    </>
                  ) : paymentMethod === "card" ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {isRTL ? "الدفع بالبطاقة" : "Payer par carte"}
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      {translations.placeOrder}
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 mt-4 text-sm text-wood-muted",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

CheckoutContent.displayName = "CheckoutContent";
