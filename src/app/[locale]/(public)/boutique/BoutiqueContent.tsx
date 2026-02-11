"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/stores/currency";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Eye,
  Heart,
  Package,
  Filter,
  Grid3X3,
  LayoutList,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const PRODUCTS_PER_PAGE = 12;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categoryName?: string;
  price: number;
  comparePrice?: number;
  image: string;
  images?: string[];
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviews: number;
  material: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface BoutiqueContentProps {
  locale: string;
  translations: {
    search: string;
    filterByCategory: string;
    sortBy: string;
    filters: string;
    productsFound: string;
    noProducts: string;
    resetFilters: string;
    addToCart: string;
    addedToCart: string;
    outOfStock: string;
    lowStock: string;
    viewProduct: string;
    categories: Record<string, string>;
    sortOptions: Record<string, string>;
  };
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Converts a slug to a human-readable name
 * Example: "tajine-decoratif-en-bois" → "Tajine Décoratif En Bois"
 */
const formatSlugAsName = (slug: string): string => {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ═══════════════════════════════════════════════════════════
// DATA - Categories and Sort Options
// ═══════════════════════════════════════════════════════════

const categoriesData = [
  { id: "all", name: "Toutes", count: 0 },
  { id: "decoration", name: "Décoration", count: 0 },
  { id: "mobilier", name: "Mobilier", count: 0 },
  { id: "accessoires", name: "Accessoires", count: 0 },
];

const sortOptionsData = [
  { id: "newest", name: "Plus récents" },
  { id: "priceAsc", name: "Prix: Croissant" },
  { id: "priceDesc", name: "Prix: Décroissant" },
  { id: "popular", name: "Populaires" },
];

// ═══════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

interface ProductCardProps {
  product: Product;
  locale: string;
  isRTL: boolean;
  translations: any;
  onAddToCart: () => void;
  isVisible: boolean;
  index: number;
  viewMode: "grid" | "list";
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  addedToCart: string | null;
}

function ProductCard({ product, locale, isRTL, translations, onAddToCart, isVisible, index, viewMode, wishlist, onToggleWishlist, addedToCart }: ProductCardProps) {
  const { format: formatPrice } = useCurrency();
  const isInWishlist = wishlist.includes(product.id);
  const justAdded = addedToCart === product.id;

  // Format display name - use product name or convert slug to readable name
  const displayName = product.name && product.name !== product.slug
    ? product.name
    : formatSlugAsName(product.slug);

  // Calculate discount percentage
  const discountPercent = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        "group bg-white rounded-xl overflow-hidden border border-gray-100",
        "shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1",
        viewMode === "list" && "flex gap-6"
      )}
    >
      {/* Product Image */}
      <Link
        href={`/${locale}/boutique/${product.slug}`}
        className={cn(
          "relative block overflow-hidden bg-gray-100 rounded-t-xl",
          viewMode === "grid" ? "w-full" : "w-56 flex-shrink-0"
        )}
        style={viewMode === "grid" ? { paddingBottom: '100%' } : { paddingBottom: '224px' }}
      >
        <img
          src={product.image || product.images?.[0] || '/images/placeholder.svg'}
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
          {product.isNew && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-lg">
              ✨ NOUVEAU
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg">
              ⭐ POPULAIRE
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
              -{discountPercent}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
              {translations.outOfStock}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
          className={cn(
            "absolute top-3 p-2.5 rounded-full transition-all z-10 shadow-lg",
            "opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100",
            isRTL ? "left-3" : "right-3",
            isInWishlist
              ? "bg-red-500 text-white"
              : "bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white"
          )}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
        </button>

        {/* Quick View Button (on hover) */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-800 rounded-lg text-sm font-medium shadow-lg hover:bg-amber-50 transition-colors">
            <Eye size={16} />
            Voir détails
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className={cn("p-5 flex flex-col flex-1", viewMode === "list" && "justify-between")}>
        {/* Category */}
        {product.categoryName && (
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">
            {product.categoryName}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/${locale}/boutique/${product.slug}`}>
          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-2 min-h-[3rem] mb-2">
            {displayName}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 mb-3 flex-grow">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({product.reviews})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-amber-800">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Info */}
        {product.inStock && product.stockCount > 0 && product.stockCount <= 10 && (
          <div className="flex items-center gap-1.5 text-orange-600 text-xs font-medium mb-3 bg-orange-50 px-3 py-1.5 rounded-lg">
            <Package size={14} />
            <span>
              {product.stockCount} {product.stockCount === 1 ? 'restant' : 'restants'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-auto">
          <button
            onClick={onAddToCart}
            disabled={!product.inStock || justAdded}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all transform active:scale-95",
              justAdded
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                : product.inStock
                ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white hover:from-amber-800 hover:to-amber-900 shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            )}
          >
            {justAdded ? (
              <>
                <Check size={18} strokeWidth={3} />
                <span>{translations.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>{translations.addToCart}</span>
              </>
            )}
          </button>

          <Link
            href={`/${locale}/boutique/${product.slug}`}
            className="p-3 border-2 border-gray-200 rounded-lg hover:border-amber-700 hover:text-amber-700 hover:bg-amber-50 transition-all"
            aria-label="View product details"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function BoutiqueContent({ locale, translations }: BoutiqueContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { toastSuccess, toastError } = useToast();
  const { addItem } = useCartStore();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Animation state
  const gridRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?limit=100&isActive=true`, {
          headers: { 'Accept-Language': locale },
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        if (data.success && data.data && data.data.data) {
          // Transform API products to match component format
          const transformed = data.data.data.map((p: any) => {
            // Ensure we have a valid name - use translation name or format the slug
            const displayName = p.name && p.name.trim() && p.name !== p.slug
              ? p.name
              : formatSlugAsName(p.slug);

            return {
              id: p.id,
              slug: p.slug,
              name: displayName,
              description: p.shortDescription || p.description || '',
              category: p.category?.slug || 'other',
              categoryName: p.category?.name || '',
              price: Number(p.price) || 0,
              comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
              image: p.thumbnail || (p.images && p.images[0]) || '/images/placeholder.svg',
              images: p.images || [],
              inStock: p.trackStock ? (p.stockQty > 0) : true,
              stockCount: p.stockQty || 0,
              isNew: p.isNew || false,
              isBestSeller: p.isFeatured || false,
              rating: 4.5,
              reviews: p.soldCount || 0,
              material: '',
            };
          });

          setProducts(transformed);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toastError('Erreur', 'Impossible de charger les produits');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locale, toastError]);

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

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
      const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // Sort
    switch (sortBy) {
      case "priceAsc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Generate page numbers for pagination UI
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Handlers
  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });

    setAddedToCart(product.id);
    toastSuccess(translations.addedToCart, product.name);

    setTimeout(() => {
      setAddedToCart(null);
    }, 2000);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  return (
    <main className="min-h-screen py-8 md:py-12 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className={cn("text-center mb-12", isRTL && "text-right")}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Boutique Artisanale
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez notre collection d'objets en bois massif, fabriqués à la main avec passion
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400", isRTL ? "right-4" : "left-4")} size={20} />
            <input
              type="text"
              placeholder={translations.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full py-3 px-12 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none",
                isRTL && "text-right"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isRTL ? "left-4" : "right-4")}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  "w-full sm:w-64 py-2.5 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none appearance-none bg-white",
                  isRTL && "text-right"
                )}
              >
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={cn("absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400", isRTL ? "left-4" : "right-4")} size={20} />
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === "grid" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === "list" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                  aria-label="List view"
                >
                  <LayoutList size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={cn(
                    "py-2.5 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none appearance-none bg-white",
                    isRTL && "text-right"
                  )}
                >
                  {sortOptionsData.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className={cn("absolute top-1/2 -translate-y-1/2 pointer-events-none text-gray-400", isRTL ? "left-4" : "right-4")} size={20} />
              </div>
            </div>
          </div>

          {/* Mobile Category Filters (Pills) */}
          {!loading && (
            <div className="lg:hidden">
              <div className="flex flex-wrap gap-2 justify-center">
                {categoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      selectedCategory === cat.id
                        ? "bg-amber-700 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {totalProducts > 0 ? (
                <>
                  <span className="font-semibold text-amber-800">{startIndex + 1}-{endIndex}</span>
                  {" "}sur{" "}
                  <span className="font-semibold text-amber-800">{totalProducts}</span>
                  {" "}produits trouvés
                </>
              ) : (
                <span className="text-gray-500">Aucun produit trouvé</span>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div
              ref={gridRef}
              className={cn(
                "grid gap-6 mb-12",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {paginatedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  isRTL={isRTL}
                  translations={translations}
                  onAddToCart={() => handleAddToCart(product)}
                  isVisible={isVisible}
                  index={index}
                  viewMode={viewMode}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  addedToCart={addedToCart}
                />
              ))}
            </div>

            {/* No Products Message */}
            {paginatedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <Package size={80} className="mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-3">
                  {translations.noProducts}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres.
                </p>
                <button
                  onClick={resetFilters}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3",
                    "bg-amber-700 text-white rounded-lg font-semibold shadow-md",
                    "hover:bg-amber-800 transition-all transform hover:scale-105",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <RotateCcw size={18} />
                  {translations.resetFilters}
                </button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className={cn(
            "mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-5 shadow-md",
            isRTL && "flex-row-reverse"
          )}>
            {/* Results Info */}
            <p className="text-sm text-gray-600">
              Affichage de <span className="font-semibold">{startIndex + 1}</span> à <span className="font-semibold">{endIndex}</span> sur <span className="font-semibold">{totalProducts}</span> produits
            </p>

            {/* Page Numbers */}
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                aria-label="First page"
              >
                {isRTL ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                aria-label="Previous page"
              >
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-2">
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(Number(page))}
                      className={cn(
                        "min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all",
                        currentPage === page
                          ? "bg-amber-700 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Current Page (Mobile) */}
              <div className="sm:hidden px-4 py-2 bg-amber-700 text-white rounded-lg font-semibold">
                {currentPage} / {totalPages}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                aria-label="Next page"
              >
                {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                aria-label="Last page"
              >
                {isRTL ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="text-amber-700" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Livraison Gratuite</h3>
            <p className="text-gray-600 text-sm">Pour toute commande supérieure à 1000 DH</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-amber-700" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Paiement Sécurisé</h3>
            <p className="text-gray-600 text-sm">Transactions 100% sécurisées</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Award className="text-amber-700" size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Qualité Artisanale</h3>
            <p className="text-gray-600 text-sm">Fabriqué main avec passion</p>
          </div>
        </div>
      </div>
    </main>
  );
}
