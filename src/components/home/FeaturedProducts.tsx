"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useDirection } from "@/hooks/useDirection";
import { useCurrency } from "@/stores/currency";
import { useCartStore } from "@/stores/cart";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import {
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Package,
  Star,
  Check,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Product {
  id: string;
  slug: string;
  name: string;
  category?: {
    slug: string;
    name: string;
  };
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  images?: string[];
  inStock: boolean;
  stockQty: number;
  trackStock: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
  locale: string;
  isRTL: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  format: (amount: number) => string;
  addItem: (item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }) => void;
  isVisible: boolean;
  index: number;
  addedToCart: string | null;
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Fix image URL for production
 */
function fixImageUrl(url: string | undefined): string {
  if (!url) return '/images/placeholder.svg';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return url.replace('/uploads/', '/api/uploads/');
  if (url.startsWith('/api/uploads/')) return url;
  return url;
}

/**
 * Format product name - convert slug to readable name if needed
 * Example: "tajine-decoratif-en-bois" → "Tajine Décoratif En Bois"
 */
function formatProductName(name: string, slug: string): string {
  // If name is the same as slug or looks like a slug (contains hyphens, no spaces)
  if (name === slug || (name.includes('-') && !name.includes(' '))) {
    return slug
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return name;
}

/**
 * Check if product is in stock
 */
function isProductInStock(product: Product): boolean {
  // If stock tracking is disabled, always consider in stock
  if (!product.trackStock) return true;

  // Check stockQty (handle both number and string)
  const qty = typeof product.stockQty === 'string'
    ? parseInt(product.stockQty, 10)
    : product.stockQty;

  return qty > 0;
}

// ═══════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT (Matching Boutique Style)
// ═══════════════════════════════════════════════════════════

function ProductCard({
  product,
  locale,
  isRTL,
  t,
  format,
  addItem,
  isVisible,
  index,
  addedToCart,
}: ProductCardProps) {
  const imageUrl = fixImageUrl(product.thumbnail || product.images?.[0]);
  const displayName = formatProductName(product.name, product.slug);
  const productUrl = `/${locale}/boutique/${product.slug}`;
  const categoryName = product.category?.name || '';

  // Check stock status
  const inStock = isProductInStock(product);
  const stockQty = typeof product.stockQty === 'string'
    ? parseInt(product.stockQty, 10)
    : product.stockQty;
  const showLowStockBadge = inStock && product.trackStock && stockQty > 0 && stockQty <= 10;

  // Calculate discount
  const discountPercent = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  // Rating (use product rating or default to 4.5)
  const rating = product.rating || 4.5;
  const reviewCount = product.reviews || 0;

  // Check if just added to cart
  const justAdded = addedToCart === product.id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || justAdded) return;

    addItem({
      productId: product.id,
      name: displayName,
      price: product.price,
      quantity: 1,
      image: imageUrl,
    });
  };

  return (
    <div
      className={cn(
        "group bg-white rounded-xl overflow-hidden border border-gray-100",
        "shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Product Image */}
      <Link
        href={productUrl}
        className="relative block overflow-hidden bg-gray-100 rounded-t-xl"
        style={{ paddingBottom: '100%' }}
      >
        <img
          src={imageUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading={index < 4 ? 'eager' : 'lazy'}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== '/images/placeholder.svg') {
              target.src = '/images/placeholder.svg';
            }
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className={cn("absolute top-3 flex flex-col gap-2 z-10", isRTL ? "right-3" : "left-3")}>
          {/* New Badge */}
          {product.isNew && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg">
              ✨ {t("badges.new")}
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercent}%
            </span>
          )}

          {/* Out of Stock Badge */}
          {!inStock && (
            <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
              {t("outOfStock")}
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col">
        {/* Category */}
        {categoryName && (
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">
            {categoryName}
          </p>
        )}

        {/* Product Name */}
        <Link href={productUrl}>
          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-2 min-h-[3rem] mb-2">
            {displayName}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {rating.toFixed(1)}
          </span>
          {reviewCount > 0 && (
            <span className="text-xs text-gray-400">
              ({reviewCount})
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-amber-800">
            {format(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {format(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Info - Low Stock Badge */}
        {showLowStockBadge && (
          <div className="flex items-center gap-1.5 text-orange-600 text-xs font-medium mb-3 bg-orange-50 px-3 py-1.5 rounded-lg">
            <Package size={14} />
            <span>
              {t("lowStock", { count: stockQty })}
            </span>
          </div>
        )}

        {/* In Stock Badge (when stock is good) */}
        {inStock && !showLowStockBadge && product.trackStock && (
          <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium mb-3 bg-green-50 px-3 py-1.5 rounded-lg">
            <Check size={14} />
            <span>{t("inStock")}</span>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || justAdded}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform active:scale-95",
            justAdded
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
              : inStock
              ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white hover:from-amber-800 hover:to-amber-900 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          )}
        >
          {justAdded ? (
            <>
              <Check size={18} strokeWidth={3} />
              <span>{t("addedToCart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>{t("addToCart")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FEATURED PRODUCTS COMPONENT
// ═══════════════════════════════════════════════════════════

export function FeaturedProducts() {
  const t = useTranslations("home.featuredProducts");
  const locale = useLocale();
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { format } = useCurrency();
  const { addItem } = useCartStore();
  const { productsBackground: bg } = useThemeSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Fetch ALL active products - no isFeatured filtering
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products?limit=8');
        const json = await res.json();

        // API returns { success, data: { data: [...products], pagination } }
        const items = json?.data?.data || json?.data || json?.products || [];
        console.log('[FeaturedProducts] Loaded:', items.length, 'products');

        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('[FeaturedProducts] Error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Intersection Observer for scroll animation
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle add to cart with visual feedback
  const handleAddToCart = (item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }) => {
    addItem(item);
    setAddedToCart(item.productId);

    // Reset after 2 seconds
    setTimeout(() => {
      setAddedToCart(null);
    }, 2000);
  };

  const isImageBg = bg.type === "image" && bg.image;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28"
      style={
        isImageBg
          ? undefined
          : { background: `linear-gradient(135deg, ${bg.color || "#FAFAF5"}, ${bg.color || "#FAFAF5"}dd)` }
      }
    >
      {/* Image background + overlay */}
      {isImageBg && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg.image})` }}
          />
          {bg.overlayEnabled !== false && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: bg.overlayColor || "#FFFFFF",
                opacity: (bg.overlayOpacity ?? 0) / 100,
              }}
            />
          )}
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div
          className={cn(
            "text-center mb-12",
            isVisible ? "animate-fade-in-up" : "opacity-0",
            bg.cardEnabled && "rounded-2xl p-6 md:p-8 shadow-lg max-w-3xl mx-auto",
            bg.cardEnabled && bg.cardBlur && "backdrop-blur-sm"
          )}
          style={bg.cardEnabled ? { backgroundColor: hexToRgba(bg.cardColor || "#FFFFFF", (bg.cardOpacity ?? 80) / 100) } : undefined}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/10 rounded-full text-sm font-semibold mb-4" style={{ color: bg.titleColor }}>
            <ShoppingCart className="w-4 h-4" />
            {t("badge")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: bg.titleColor }}>
            {t("title")}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: bg.bodyColor }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="relative w-full bg-gray-200" style={{ paddingBottom: '100%' }} />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                isRTL={isRTL}
                t={t}
                format={format}
                addItem={handleAddToCart}
                isVisible={isVisible}
                index={index}
                addedToCart={addedToCart}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-3">
              Nos produits arrivent bientôt!
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Revenez nous visiter prochainement pour découvrir notre collection.
            </p>
          </div>
        )}

        {/* View All Button */}
        {!loading && products.length > 0 && (
          <div
            className={cn(
              "text-center mt-12",
              isVisible ? "animate-fade-in-up" : "opacity-0"
            )}
            style={{ animationDelay: "400ms" }}
          >
            <Link
              href={`/${locale}/boutique`}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4",
                "bg-amber-600 text-white rounded-xl",
                "hover:bg-amber-700 transition-all duration-300",
                "font-semibold text-base",
                "shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40",
                "transform hover:-translate-y-1",
                isRTL && "flex-row-reverse"
              )}
            >
              {t("viewAll")}
              {isRTL ? (
                <ArrowLeft className="w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

FeaturedProducts.displayName = "FeaturedProducts";

export default FeaturedProducts;
