'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/hooks/useToast';
import { useThemeSettings } from '@/stores/themeSettings';
import { useCurrency } from '@/stores/currency';
import { hexToRgba } from '@/lib/utils';
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  ArrowLeft,
  X,
  ZoomIn
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Product {
  id: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stockQty: number;
  lowStockQty: number;
  trackStock: boolean;
  allowBackorder: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  images: string[];
  thumbnail: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number;
  soldCount: number;
  // Localized fields
  name: string;
  description: string;
  shortDescription: string;
  features: string[];
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
  relatedProducts: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stockQty: number;
    trackStock: boolean;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// Product Detail Page Component
// ═══════════════════════════════════════════════════════════════

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const isRTL = locale === 'ar';

  // Store hooks
  const { addItem } = useCartStore();
  const { success } = useToast();
  const theme = useThemeSettings();
  const { format: formatPrice } = useCurrency();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/products/${slug}`, {
          headers: {
            'Accept-Language': locale,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          setError('Invalid response');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, locale]);

  // Helper: build style object from a section's theme settings
  const sectionBg = (section: typeof theme.boutiqueProduct) => {
    const style: React.CSSProperties = {};
    if (section.type === 'color') {
      style.backgroundColor = section.color;
    } else if (section.type === 'image' && section.image) {
      style.backgroundImage = `url(${section.image})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    return style;
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.thumbnail || product.images[0] || '',
    });

    setAddedToCart(true);
    success(
      isRTL ? 'تمت الإضافة للسلة!' : 'Ajouté au panier !',
      `${quantity}x ${product.name}`
    );
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Buy now - add to cart and go to checkout
  const handleBuyNow = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.thumbnail || product.images[0] || '',
    });
    router.push(`/${locale}/checkout`);
  };

  const nextImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : `${locale}-MA`).format(num);
  };

  // Translations
  const t = {
    home: isRTL ? 'الرئيسية' : 'Accueil',
    shop: isRTL ? 'المتجر' : 'Boutique',
    new: isRTL ? 'جديد' : 'NOUVEAU',
    inStock: isRTL ? 'متوفر' : 'En stock',
    outOfStock: isRTL ? 'نفذ' : 'Rupture de stock',
    reviews: isRTL ? 'تقييم' : 'avis',
    save: isRTL ? 'وفر' : 'Économisez',
    hurryOnly: isRTL ? 'أسرع! بقي' : 'Dépêchez-vous ! Seulement',
    remaining: isRTL ? 'فقط في المخزون' : 'restant(s)',
    added: isRTL ? 'تمت الإضافة!' : 'Ajouté !',
    addToCart: isRTL ? 'أضف إلى السلة' : 'Ajouter au panier',
    buyNow: isRTL ? 'اشتر الآن' : 'Acheter maintenant',
    freeShipping: isRTL ? 'شحن مجاني' : 'Livraison gratuite',
    from: isRTL ? 'من' : 'Dès',
    warranty: isRTL ? 'ضمان سنتين' : 'Garantie 2 ans',
    return: isRTL ? 'إرجاع 14 يوم' : 'Retour 14 jours',
    satisfactionGuaranteed: isRTL ? 'مضمون' : 'Satisfait ou remboursé',
    share: isRTL ? 'شارك:' : 'Partager:',
    description: isRTL ? 'الوصف' : 'Description',
    specifications: isRTL ? 'المواصفات' : 'Caractéristiques',
    shipping: isRTL ? 'الشحن' : 'Livraison',
    features: isRTL ? 'المميزات' : 'Caractéristiques principales',
    material: isRTL ? 'المادة' : 'Matériau',
    dimensions: isRTL ? 'الأبعاد' : 'Dimensions',
    weight: isRTL ? 'الوزن' : 'Poids',
    shippingInfo: isRTL
      ? 'شحن مجاني للطلبات فوق 1000 د.م. التوصيل خلال 3-5 أيام عمل.'
      : 'Livraison gratuite pour les commandes supérieures à 1000 DH. Délai: 3-5 jours ouvrés.',
    packagingInfo: isRTL
      ? 'كل منتج مغلف بعناية لضمان وصوله في حالة ممتازة.'
      : 'Chaque produit est soigneusement emballé pour garantir une livraison en parfait état.',
    relatedProducts: isRTL ? 'منتجات مشابهة' : 'Produits similaires',
    backToShop: isRTL ? 'العودة للمتجر' : 'Retour à la boutique',
    loading: isRTL ? 'جاري التحميل...' : 'Chargement...',
    notFound: isRTL ? 'المنتج غير موجود' : 'Produit non trouvé',
    errorLoading: isRTL ? 'خطأ في تحميل المنتج' : 'Erreur lors du chargement',
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || t.notFound}</p>
          <Link
            href={`/${locale}/boutique`}
            className="inline-flex items-center gap-2 text-wood-primary font-medium hover:underline"
          >
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            {t.backToShop}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercent = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  // Calculate savings
  const savings = product.comparePrice
    ? product.comparePrice - product.price
    : 0;

  // Stock status
  const inStock = product.trackStock ? product.stockQty > 0 : true;
  const lowStock = product.trackStock && product.stockQty <= product.lowStockQty && product.stockQty > 0;

  // Dimensions string
  const dimensionsStr = [product.length, product.width, product.height]
    .filter(Boolean)
    .join(' x ') + (product.length ? ' cm' : '');

  return (
    <div className="min-h-screen" style={sectionBg(theme.boutiqueProduct)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overlay for product background */}
      {theme.boutiqueProduct.type === 'image' && theme.boutiqueProduct.overlayEnabled && (
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: hexToRgba(theme.boutiqueProduct.overlayColor, theme.boutiqueProduct.overlayOpacity / 100), zIndex: 0 }} />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b relative" style={{ zIndex: 1 }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/${locale}`} className="text-gray-500 hover:text-wood-primary">
              {t.home}
            </Link>
            <ChevronRight size={14} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
            <Link href={`/${locale}/boutique`} className="text-gray-500 hover:text-wood-primary">
              {t.shop}
            </Link>
            <ChevronRight size={14} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-wood-dark font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* LEFT: Product Images */}
            <div className="space-y-4">
              {/* MAIN IMAGE */}
              <div
                className="relative w-full bg-white rounded-2xl overflow-hidden shadow-lg cursor-zoom-in group"
                style={{ aspectRatio: '1/1' }}
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={product.images[selectedImage] || product.thumbnail || product.images[0] || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                {/* Badges */}
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-col gap-2 z-10`}>
                  {product.isNew && (
                    <span className="px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                      {t.new}
                    </span>
                  )}
                  {product.comparePrice && discountPercent > 0 && (
                    <span className="px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20`}
                    >
                      <ChevronLeft size={24} className={`text-wood-dark ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20`}
                    >
                      <ChevronRight size={24} className={`text-wood-dark ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </>
                )}

                {/* Zoom Icon */}
                <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                  <ZoomIn size={20} className="text-wood-dark" />
                </div>

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1.5 bg-black/60 text-white text-sm rounded-full z-10`}>
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* THUMBNAILS */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative overflow-hidden rounded-xl transition-all ${
                        idx === selectedImage
                          ? 'ring-3 ring-wood-primary ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{ aspectRatio: '1/1' }}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info */}
            <div className="lg:py-4">
              {/* Category */}
              {product.category && (
                <Link
                  href={`/${locale}/boutique?category=${product.category.slug}`}
                  className="inline-block px-4 py-1.5 bg-wood-cream text-wood-primary text-sm font-medium rounded-full hover:bg-wood-primary hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mt-4 leading-tight" style={{ color: theme.boutiqueProduct.titleColor }}>
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <span className="font-medium" style={{ color: theme.boutiqueProduct.titleColor }}>4.5</span>
                <span className="text-gray-400">|</span>
                <span className="text-wood-primary">{product.soldCount} {t.reviews}</span>
                {inStock ? (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Check size={16} />
                      {t.inStock}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-600 font-medium">
                      {t.outOfStock}
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-4 mt-6 flex-wrap">
                <span className="text-4xl font-bold text-wood-primary">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                      {t.save} {formatPrice(savings)}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="mt-6 text-lg leading-relaxed" style={{ color: theme.boutiqueProduct.bodyColor }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Stock Warning */}
              {lowStock && (
                <div className="mt-6 flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <Clock size={20} className="text-orange-500 flex-shrink-0" />
                  <span className="text-orange-700 font-medium">
                    {t.hurryOnly} {product.stockQty} {t.remaining}
                  </span>
                </div>
              )}

              {/* Divider */}
              <hr className="my-8 border-gray-200" />

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Quantity Selector */}
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 hover:bg-gray-100 transition-colors"
                      disabled={!inStock}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-16 text-center text-xl font-bold" style={{ color: theme.boutiqueProduct.titleColor }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.trackStock ? product.stockQty : 999, quantity + 1))}
                      className="p-4 hover:bg-gray-100 transition-colors"
                      disabled={!inStock}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock && !product.allowBackorder}
                    className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all ${
                      addedToCart
                        ? 'bg-green-500 text-white'
                        : !inStock && !product.allowBackorder
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-wood-primary text-white hover:bg-wood-secondary hover:shadow-lg hover:shadow-wood-primary/30'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={24} />
                        {t.added}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={24} />
                        {t.addToCart}
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isWishlisted
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock && !product.allowBackorder}
                  className="w-full py-4 px-8 bg-wood-dark text-white font-bold text-lg rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.buyNow}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <Truck className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {t.freeShipping}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.from} 1000 DH
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <Shield className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {t.warranty}
                  </span>
                  <span className="text-xs text-gray-500">
                    Pièces et main d'œuvre
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <RotateCcw className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {t.return}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.satisfactionGuaranteed}
                  </span>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <span className="text-gray-500 font-medium">
                  {t.share}
                </span>
                <button className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-12 relative" style={sectionBg(theme.boutiqueTabs)}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'description', label: t.description },
              { id: 'specifications', label: t.specifications },
              { id: 'shipping', label: t.shipping },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-4 font-medium whitespace-nowrap transition-all relative"
                style={{ color: activeTab === tab.id ? theme.boutiqueTabs.titleColor : theme.boutiqueTabs.bodyColor }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: theme.boutiqueTabs.titleColor }} />
                )}
              </button>
            ))}
          </div>

          <div className="py-8 max-w-3xl">
            {activeTab === 'description' && (
              <div>
                {product.description && (
                  <div
                    className="prose max-w-none mb-6"
                    style={{ color: theme.boutiqueTabs.bodyColor }}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}
                {product.features && product.features.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold mb-4" style={{ color: theme.boutiqueTabs.titleColor }}>
                      {t.features}
                    </h3>
                    <ul className="space-y-3">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span style={{ color: theme.boutiqueTabs.bodyColor }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 font-medium w-1/3" style={{ color: theme.boutiqueTabs.titleColor }}>
                      SKU
                    </td>
                    <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{product.sku}</td>
                  </tr>
                  {dimensionsStr && (
                    <tr>
                      <td className="py-4 font-medium" style={{ color: theme.boutiqueTabs.titleColor }}>
                        {t.dimensions}
                      </td>
                      <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{dimensionsStr}</td>
                    </tr>
                  )}
                  {product.weight && (
                    <tr>
                      <td className="py-4 font-medium" style={{ color: theme.boutiqueTabs.titleColor }}>
                        {t.weight}
                      </td>
                      <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{product.weight} kg</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl">
                  <Truck className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-800 mb-1">
                      {t.freeShipping}
                    </h4>
                    <p className="text-green-700">
                      {t.shippingInfo}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl">
                  <Package className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">
                      {isRTL ? 'تغليف آمن' : 'Emballage soigné'}
                    </h4>
                    <p className="text-blue-700">
                      {t.packagingInfo}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="py-16 relative" style={sectionBg(theme.boutiqueRelated)}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: theme.boutiqueRelated.titleColor }}>
              {t.relatedProducts}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/boutique/${item.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
                    <Image
                      src={item.images[0] || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {item.comparePrice && (
                      <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full`}>
                        -{Math.round((1 - item.price / item.comparePrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold group-hover:text-wood-primary transition-colors line-clamp-1" style={{ color: theme.boutiqueRelated.titleColor }}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="font-bold text-wood-primary">{formatPrice(item.price)}</span>
                      {item.comparePrice && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(item.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Shop */}
      <div className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <Link
            href={`/${locale}/boutique`}
            className="inline-flex items-center gap-2 text-wood-primary font-medium hover:underline"
          >
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            {t.backToShop}
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && product.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
          >
            <X size={24} className="text-white" />
          </button>

          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl mx-4" style={{ aspectRatio: '1/1', maxHeight: '80vh' }}>
            <Image
              src={product.images[selectedImage] || product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === selectedImage ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
