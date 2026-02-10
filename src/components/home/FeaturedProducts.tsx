"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
  Sparkles,
} from "lucide-react";
import ProductCardSlider from "@/components/public/ProductCardSlider";
import {
  products as allProducts,
  productCategories,
  type Product,
  type Locale,
  calculateDiscount,
} from "@/data/products";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

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
}

// ═══════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
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
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name[locale as Locale],
      price: product.price,
      quantity: 1,
      image: product.images[0] ?? "/images/placeholder.jpg",
    });
  };

  const discountPercent = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const productUrl = `/${locale}/boutique/${product.slug}`;
  const categoryName =
    productCategories.find((c) => c.id === product.category)?.[
      locale as Locale
    ] || product.category;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl overflow-hidden",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "border border-gray-100",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Product Image Slider */}
      <Link href={productUrl}>
        <div className="relative">
          <ProductCardSlider
            images={product.images}
            productName={product.name[locale as Locale]}
            category={categoryName}
          />

          {/* Sale Badge */}
          {product.isSale && discountPercent > 0 && (
            <span
              className={cn(
                "absolute top-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full z-20",
                isRTL ? "right-3" : "left-3"
              )}
            >
              -{discountPercent}%
            </span>
          )}

          {/* New Badge */}
          {product.isNew && (
            <span
              className={cn(
                "absolute px-3 py-1 bg-gradient-to-r from-wood-primary to-wood-accent text-white text-xs font-bold rounded-full flex items-center gap-1 z-20",
                isRTL ? "right-3" : "left-3",
                product.isSale && discountPercent > 0 ? "top-10" : "top-3"
              )}
            >
              <Sparkles className="w-3 h-3" />
              {t("badges.new")}
            </span>
          )}

          {/* Low Stock Badge */}
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span
              className={cn(
                "absolute top-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full z-20",
                isRTL ? "left-3" : "right-3"
              )}
            >
              {t("lowStock", { count: product.stockQuantity })}
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className={cn("p-4", isRTL && "text-right")}>
        {/* Category */}
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
          {categoryName}
        </p>

        {/* Title */}
        <Link href={productUrl}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name[locale as Locale]}
          </h3>
        </Link>

        {/* Price */}
        <div
          className={cn(
            "flex items-center gap-2 mb-4",
            isRTL && "flex-row-reverse justify-end"
          )}
        >
          <span className="text-xl font-bold text-amber-600">
            {format(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {format(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Out of Stock */}
        {!product.inStock && (
          <p className="text-xs text-red-500 mb-3 font-medium">
            {t("outOfStock")}
          </p>
        )}

        {/* Add to Cart Button - Always visible */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={cn(
            "w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2",
            product.inStock
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CATEGORY TAB COMPONENT
// ═══════════════════════════════════════════════════════════

function CategoryTab({
  category,
  isActive,
  onClick,
  locale,
}: {
  category: (typeof productCategories)[0];
  isActive: boolean;
  onClick: () => void;
  locale: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap",
        "transition-all duration-300 transform",
        isActive
          ? "bg-wood-primary text-white shadow-lg shadow-wood-primary/30 scale-105"
          : "bg-wood-light/50 text-wood-dark hover:bg-wood-light hover:scale-102"
      )}
    >
      {category[locale as Locale]}
    </button>
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
  const [activeCategory, setActiveCategory] = useState("all");

  // Limit categories shown in tabs
  const displayedCategories = useMemo(() => {
    return productCategories.slice(0, 5); // all + 4 main categories
  }, []);

  // Filter and limit products
  const filteredProducts = useMemo(() => {
    const filtered =
      activeCategory === "all"
        ? allProducts.filter((p) => p.featured)
        : allProducts.filter((p) => p.category === activeCategory);

    // If filtering by category returns less than 8, fill with featured products
    if (filtered.length < 8 && activeCategory === "all") {
      // Just return all featured
      return filtered.slice(0, 8);
    }

    return filtered.slice(0, 8);
  }, [activeCategory]);

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
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-wood-primary/10 rounded-full text-sm font-semibold mb-4" style={{ color: bg.titleColor }}>
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

        {/* Category Tabs */}
        <div
          className={cn(
            "flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide",
            isVisible ? "animate-fade-in-up" : "opacity-0"
          )}
          style={{ animationDelay: "100ms" }}
        >
          {displayedCategories.map((category) => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              locale={locale}
            />
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              isRTL={isRTL}
              t={t}
              format={format}
              addItem={addItem}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
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
              "bg-wood-primary text-white rounded-xl",
              "hover:bg-wood-dark transition-all duration-300",
              "font-semibold text-base",
              "shadow-lg shadow-wood-primary/30 hover:shadow-xl hover:shadow-wood-primary/40",
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
      </div>
    </section>
  );
}

FeaturedProducts.displayName = "FeaturedProducts";

export default FeaturedProducts;
