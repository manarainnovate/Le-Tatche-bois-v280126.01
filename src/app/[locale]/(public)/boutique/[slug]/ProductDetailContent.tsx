"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { ImageGallery, type GalleryImage } from "@/components/ui/ImageGallery";
import { useCartStore } from "@/stores/cart";
import { useToast } from "@/hooks/useToast";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  galleryImages: GalleryImage[];
  description: string;
  shortDescription: string;
  specifications: { key: string; value: string }[];
  inStock: boolean;
  stockCount: number;
  category: string;
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  inStock: boolean;
  isNew?: boolean;
}

interface ProductDetailContentProps {
  locale: string;
  product: ProductData;
  relatedProducts: RelatedProduct[];
  translations: {
    backToBoutique: string;
    inStock: string;
    outOfStock: string;
    lowStock: string;
    addToCart: string;
    addedToCart: string;
    addToWishlist: string;
    removeFromWishlist: string;
    freeShipping: string;
    warranty: string;
    returns: string;
    tabs: {
      description: string;
      specifications: string;
      shipping: string;
    };
    specs: Record<string, string>;
    shipping: {
      standard: string;
      express: string;
      pickup: string;
    };
    relatedProducts: string;
    viewProduct: string;
  };
}

// ═══════════════════════════════════════════════════════════
// TABS COMPONENT
// ═══════════════════════════════════════════════════════════

type TabValue = "description" | "specifications" | "shipping";

function ProductTabs({
  product,
  translations,
  isRTL,
}: {
  product: ProductData;
  translations: ProductDetailContentProps["translations"];
  isRTL: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("description");

  const tabs: { value: TabValue; label: string }[] = [
    { value: "description", label: translations.tabs.description },
    { value: "specifications", label: translations.tabs.specifications },
    { value: "shipping", label: translations.tabs.shipping },
  ];

  return (
    <div className="mt-8">
      {/* Tab List */}
      <div
        className={cn(
          "flex border-b border-wood-light",
          isRTL && "flex-row-reverse"
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors",
              "border-b-2 -mb-px",
              activeTab === tab.value
                ? "border-wood-primary text-wood-primary"
                : "border-transparent text-wood-muted hover:text-wood-dark"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === "description" && (
          <div className={cn("prose prose-wood max-w-none", isRTL && "text-right")}>
            <p className="text-wood-muted leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="space-y-3">
            {product.specifications.map((spec) => (
              <div
                key={spec.key}
                className={cn(
                  "flex justify-between items-center py-3 border-b border-wood-light/50",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span className="text-wood-muted">
                  {translations.specs[spec.key] ?? spec.key}
                </span>
                <span className="font-medium text-wood-dark">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className={cn("space-y-4 text-wood-muted", isRTL && "text-right")}>
            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
              <Truck className="w-5 h-5 text-wood-primary shrink-0 mt-0.5" />
              <p>{translations.shipping.standard}</p>
            </div>
            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
              <Truck className="w-5 h-5 text-wood-primary shrink-0 mt-0.5" />
              <p>{translations.shipping.express}</p>
            </div>
            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
              <Truck className="w-5 h-5 text-wood-primary shrink-0 mt-0.5" />
              <p>{translations.shipping.pickup}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RELATED PRODUCT CARD
// ═══════════════════════════════════════════════════════════

function RelatedProductCard({
  product,
  locale,
  isRTL,
  viewProductLabel,
}: {
  product: RelatedProduct;
  locale: string;
  isRTL: boolean;
  viewProductLabel: string;
}) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden">
      <Link href={`/${locale}/boutique/${product.slug}`}>
        {/* MUST have explicit height for Next.js Image fill to work properly */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, 25vw"
          />

          {/* Badges */}
          <div
            className={cn(
              "absolute top-3 flex flex-col gap-2",
              isRTL ? "right-3" : "left-3"
            )}
          >
            {product.isNew && (
              <Badge variant="success" size="sm">
                NEW
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="error" size="sm">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Out of Stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Rupture</Badge>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-wood-primary rounded-full font-medium text-sm">
              <Eye className="w-4 h-4" />
              {viewProductLabel}
            </span>
          </div>
        </div>

        <div className={cn("p-4", isRTL && "text-right")}>
          <h3 className="font-medium text-wood-dark group-hover:text-wood-primary transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
          <Price amount={product.price} compareAmount={product.comparePrice} />
        </div>
      </Link>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function ProductDetailContent({
  locale,
  product,
  relatedProducts,
  translations,
}: ProductDetailContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { addItem } = useCartStore();
  const { success } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.galleryImages[0]?.src ?? "",
    });
    success(translations.addedToCart, `${quantity}x ${product.name}`);
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isLowStock = product.inStock && product.stockCount <= 5;

  return (
    <main className="min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href={`/${locale}/boutique`}
            className={cn(
              "inline-flex items-center gap-2 text-wood-primary hover:text-wood-secondary transition-colors",
              isRTL && "flex-row-reverse"
            )}
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{translations.backToBoutique}</span>
          </Link>
        </div>

        {/* Main Content */}
        <div
          ref={contentRef}
          className={cn(
            "grid lg:grid-cols-2 gap-12",
            "transform transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}
        >
          {/* Gallery */}
          <div className="relative">
            {discount > 0 && (
              <div className={cn("absolute top-4 z-10", isRTL ? "right-4" : "left-4")}>
                <Badge variant="error" size="lg">
                  -{discount}%
                </Badge>
              </div>
            )}
            <ImageGallery
              images={product.galleryImages}
              aspectRatio="square"
              showThumbnails
              enableLightbox
              enableZoom
            />
          </div>

          {/* Product Info */}
          <div className={cn("space-y-6", isRTL && "text-right")}>
            {/* Name */}
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-wood-dark">
              {product.name}
            </h1>

            {/* Price */}
            <Price
              amount={product.price}
              compareAmount={product.comparePrice}
              size="xl"
              showSaleBadge
            />

            {/* Stock Status */}
            <div>
              {product.inStock ? (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isLowStock ? "text-orange-600" : "text-green-600",
                    isRTL && "flex-row-reverse justify-end"
                  )}
                >
                  {isLowStock ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isLowStock
                      ? translations.lowStock.replace("{count}", String(product.stockCount))
                      : `${translations.inStock} (${product.stockCount})`}
                  </span>
                </div>
              ) : (
                <Badge variant="secondary" size="lg">
                  {translations.outOfStock}
                </Badge>
              )}
            </div>

            {/* Short Description */}
            <p className="text-wood-muted text-lg leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity & Add to Cart */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-4",
                isRTL && "flex-row-reverse justify-end"
              )}
            >
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stockCount || 1}
                disabled={!product.inStock}
              />

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={cn(
                  "flex-1 min-w-[200px] inline-flex items-center justify-center gap-2",
                  "px-8 py-3 rounded-lg font-medium text-lg",
                  "bg-gradient-to-r from-wood-primary to-wood-secondary",
                  "text-white shadow-md",
                  "hover:brightness-110 transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                {translations.addToCart}
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 border-wood-light",
                  "flex items-center justify-center",
                  "hover:border-wood-primary hover:text-wood-primary transition-colors",
                  isWishlisted && "border-red-500 text-red-500"
                )}
                aria-label={isWishlisted ? translations.removeFromWishlist : translations.addToWishlist}
              >
                <Heart
                  className={cn("w-5 h-5", isWishlisted && "fill-red-500")}
                />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-wood-light">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-wood-primary" />
                <span className="text-sm text-wood-muted">{translations.freeShipping}</span>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-wood-primary" />
                <span className="text-sm text-wood-muted">{translations.warranty}</span>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-wood-primary" />
                <span className="text-sm text-wood-muted">{translations.returns}</span>
              </div>
            </div>

            {/* Tabs */}
            <ProductTabs product={product} translations={translations} isRTL={isRTL} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-wood-light">
            <h2
              className={cn(
                "font-heading text-2xl md:text-3xl font-bold text-wood-primary mb-8",
                isRTL && "text-right"
              )}
            >
              {translations.relatedProducts}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <RelatedProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                  isRTL={isRTL}
                  viewProductLabel={translations.viewProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

ProductDetailContent.displayName = "ProductDetailContent";
