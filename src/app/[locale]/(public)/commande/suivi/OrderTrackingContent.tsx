"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Price } from "@/components/ui/Price";
import {
  Search,
  CheckCircle,
  Package,
  Truck,
  Home,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface OrderTrackingContentProps {
  locale: string;
  initialOrderNumber: string;
  translations: {
    title: string;
    description: string;
    searchTitle: string;
    orderNumber: string;
    email: string;
    search: string;
    searching: string;
    orderDate: string;
    statusTitle: string;
    estimatedDelivery: string;
    shippingAddress: string;
    orderItems: string;
    total: string;
    searchAnother: string;
    trackingNumber: string;
    notFound: string;
    notFoundDesc: string;
    statuses: {
      confirmed: string;
      processing: string;
      shipped: string;
      delivered: string;
    };
    needHelp: string;
    contactUs: string;
    whatsapp: string;
  };
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface TimelineEntry {
  status: string;
  date: string;
}

interface OrderData {
  orderNumber: string;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  timeline: TimelineEntry[];
}

// ═══════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════

const statusConfig = [
  { key: "confirmed", icon: CheckCircle, bgColor: "bg-green-500", ringColor: "ring-green-100" },
  { key: "processing", icon: Package, bgColor: "bg-orange-500", ringColor: "ring-orange-100" },
  { key: "shipped", icon: Truck, bgColor: "bg-blue-500", ringColor: "ring-blue-100" },
  { key: "delivered", icon: Home, bgColor: "bg-green-600", ringColor: "ring-green-100" },
] as const;

// ═══════════════════════════════════════════════════════════
// MOCK DATA - Will be replaced with API call
// ═══════════════════════════════════════════════════════════

const getMockOrder = (orderNumber: string): OrderData | null => {
  // Simulate order lookup
  if (!orderNumber.startsWith("ORD-")) {
    return null;
  }

  return {
    orderNumber,
    status: "processing",
    createdAt: "15 Janvier 2024",
    estimatedDelivery: "22-25 Janvier 2024",
    trackingNumber: orderNumber === "ORD-12345" ? "MA123456789" : undefined,
    items: [
      {
        name: "Miroir Bois Sculpté",
        quantity: 1,
        price: 2500,
        image: "/images/products/product-1.jpg",
      },
      {
        name: "Table Basse en Cèdre",
        quantity: 1,
        price: 8500,
        image: "/images/products/product-2.jpg",
      },
    ],
    subtotal: 11000,
    shipping: 0,
    total: 11000,
    shippingAddress: {
      name: "Hassan Alaoui",
      address: "123 Rue Mohammed V",
      city: "Casablanca",
      postalCode: "20000",
      country: "Maroc",
      phone: "+212 6XX XXX XXX",
    },
    timeline: [
      { status: "confirmed", date: "15 Jan 2024 - 10:30" },
      { status: "processing", date: "16 Jan 2024 - 14:00" },
    ],
  };
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function OrderTrackingContent({
  locale,
  initialOrderNumber,
  translations,
}: OrderTrackingContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const theme = useThemeSettings();
  const tracking = theme.boutiqueSuccess;

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Auto-search if order number is in URL
  useEffect(() => {
    if (initialOrderNumber) {
      const mockOrder = getMockOrder(initialOrderNumber);
      if (mockOrder) {
        setOrder(mockOrder);
        setHasSearched(true);
      }
    }
  }, [initialOrderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);

    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundOrder = getMockOrder(orderNumber);
    setOrder(foundOrder);
    setIsSearching(false);
  };

  const handleCopyTracking = async () => {
    if (order?.trackingNumber) {
      try {
        await navigator.clipboard.writeText(order.trackingNumber);
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleNewSearch = () => {
    setOrder(null);
    setOrderNumber("");
    setEmail("");
    setHasSearched(false);
  };

  const currentStatusIndex = order
    ? statusConfig.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <main className="min-h-screen py-8 md:py-12 bg-gradient-to-b from-white to-wood-cream/20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className={cn("mb-8", isRTL && "text-right")}>
          <Link
            href={`/${locale}/boutique`}
            className={cn(
              "inline-flex items-center gap-2 text-wood-primary hover:text-wood-secondary transition-colors mb-4",
              isRTL && "flex-row-reverse"
            )}
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>Retour à la boutique</span>
          </Link>
          <h1 className="font-heading text-2xl md:text-3xl font-bold" style={{ color: tracking.titleColor }}>
            {translations.title}
          </h1>
          <p className="text-wood-muted mt-2">{translations.description}</p>
        </div>

        {/* Search Form - Show when no order found */}
        {!order && (
          <Card className="p-6 md:p-8 mb-8">
            <h2
              className={cn(
                "text-lg font-semibold mb-6",
                isRTL && "text-right"
              )}
              style={{ color: tracking.titleColor }}
            >
              {translations.searchTitle}
            </h2>

            <form onSubmit={(e) => void handleSearch(e)} className="space-y-4">
              <Input
                label={translations.orderNumber}
                placeholder="ORD-XXXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                leftIcon={<Package className="w-5 h-5" />}
              />
              <Input
                label={translations.email}
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={isSearching}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2",
                  "px-6 py-3 rounded-lg font-medium",
                  "bg-gradient-to-r from-wood-primary to-wood-secondary",
                  "text-white shadow-md",
                  "hover:brightness-110 transition-all",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  isRTL && "flex-row-reverse"
                )}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {translations.searching}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {translations.search}
                  </>
                )}
              </button>
            </form>

            {/* Not Found Message */}
            {hasSearched && !order && !isSearching && (
              <div
                className={cn(
                  "mt-6 p-4 bg-red-50 border border-red-100 rounded-xl",
                  "flex items-start gap-4",
                  isRTL && "flex-row-reverse"
                )}
              >
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div className={cn(isRTL && "text-right")}>
                  <p className="font-medium text-red-800">{translations.notFound}</p>
                  <p className="text-sm text-red-600 mt-1">{translations.notFoundDesc}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Order Found */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card className="p-6">
              <div
                className={cn(
                  "flex justify-between items-start flex-wrap gap-4",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn(isRTL && "text-right")}>
                  <span className="text-sm text-wood-muted">{translations.orderNumber}</span>
                  <p className="text-xl font-bold text-wood-primary font-mono">
                    #{order.orderNumber}
                  </p>
                </div>
                <div className={cn(isRTL ? "text-left" : "text-right")}>
                  <span className="text-sm text-wood-muted">{translations.orderDate}</span>
                  <p className="font-medium">{order.createdAt}</p>
                </div>
              </div>
            </Card>

            {/* Status Timeline */}
            <Card className="p-6">
              <h2
                className={cn(
                  "text-lg font-semibold mb-6",
                  isRTL && "text-right"
                )}
                style={{ color: tracking.titleColor }}
              >
                {translations.statusTitle}
              </h2>

              <div className="relative">
                {statusConfig.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = status.icon;
                  const timelineEntry = order.timeline.find((t) => t.status === status.key);

                  return (
                    <div
                      key={status.key}
                      className={cn(
                        "flex gap-4 pb-8 last:pb-0",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      {/* Vertical Line */}
                      {index < statusConfig.length - 1 && (
                        <div
                          className={cn(
                            "absolute w-0.5 h-12",
                            isCompleted && index < currentStatusIndex
                              ? "bg-green-500"
                              : "bg-wood-light",
                            isRTL ? "right-5" : "left-5"
                          )}
                          style={{
                            top: `${index * 80 + 48}px`,
                          }}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                          isCompleted ? status.bgColor : "bg-wood-light",
                          isCompleted ? "text-white" : "text-wood-muted",
                          isCurrent && `ring-4 ${status.ringColor}`
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className={cn("flex-1 pt-1", isRTL && "text-right")}>
                        <p
                          className={cn(
                            "font-medium",
                            isCompleted ? "text-wood-dark" : "text-wood-muted"
                          )}
                        >
                          {translations.statuses[status.key]}
                        </p>
                        {timelineEntry && (
                          <p className="text-sm text-wood-muted mt-1">{timelineEntry.date}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Delivery */}
              <div
                className={cn(
                  "mt-6 pt-6 border-t border-wood-light flex items-center gap-3",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="w-10 h-10 bg-wood-cream rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-wood-primary" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <span className="text-sm text-wood-muted">{translations.estimatedDelivery}</span>
                  <p className="font-medium">{order.estimatedDelivery}</p>
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div
                  className={cn(
                    "mt-4 pt-4 border-t border-wood-light flex items-center gap-3",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <span className="text-sm text-wood-muted">{translations.trackingNumber}</span>
                    <div
                      className={cn("flex items-center gap-2", isRTL && "flex-row-reverse justify-end")}
                    >
                      <p className="font-mono font-medium">
                        {order.trackingNumber}
                      </p>
                      <button
                        onClick={() => void handleCopyTracking()}
                        className="p-1 hover:bg-wood-light/50 rounded transition-colors"
                        title="Copy tracking number"
                      >
                        {copiedTracking ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-wood-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                  <a
                    href={`https://track.example.com/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h2
                className={cn(
                  "text-lg font-semibold mb-4 flex items-center gap-2",
                  isRTL && "flex-row-reverse justify-end"
                )}
                style={{ color: tracking.titleColor }}
              >
                <MapPin className="w-5 h-5 text-wood-primary" />
                {translations.shippingAddress}
              </h2>
              <div className={cn("text-wood-muted leading-relaxed", isRTL && "text-right")}>
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2
                className={cn(
                  "text-lg font-semibold mb-4",
                  isRTL && "text-right"
                )}
                style={{ color: tracking.titleColor }}
              >
                {translations.orderItems}
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-4 py-3 border-b border-wood-light last:border-0 last:pb-0",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-wood-light/30 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className={cn("flex-1", isRTL && "text-right")}>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-wood-muted">x{item.quantity}</p>
                    </div>
                    <div className={cn("shrink-0", isRTL && "text-left")}>
                      <Price amount={item.price * item.quantity} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                className={cn(
                  "mt-4 pt-4 border-t border-wood-light flex justify-between items-center",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span className="text-lg font-semibold" style={{ color: tracking.titleColor }}>{translations.total}</span>
                <Price amount={order.total} size="xl" />
              </div>
            </Card>

            {/* Help Section */}
            <Card className="p-6">
              <div
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-between gap-4",
                  isRTL && "sm:flex-row-reverse"
                )}
              >
                <p className={cn("text-wood-muted", isRTL && "text-right")}>
                  {translations.needHelp}{" "}
                  <Link
                    href={`/${locale}/contact`}
                    className="text-wood-primary hover:text-wood-secondary hover:underline"
                  >
                    {translations.contactUs}
                  </Link>
                </p>

                <a
                  href="https://wa.me/212500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-green-500 text-white hover:bg-green-600 transition-colors",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  {translations.whatsapp}
                </a>
              </div>
            </Card>

            {/* New Search Button */}
            <button
              onClick={handleNewSearch}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2",
                "px-6 py-3 rounded-lg font-medium",
                "border-2 border-wood-light text-wood-dark",
                "hover:bg-wood-light/30 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              <Search className="w-5 h-5" />
              {translations.searchAnother}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

OrderTrackingContent.displayName = "OrderTrackingContent";
