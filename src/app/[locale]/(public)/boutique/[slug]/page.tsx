'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { useToast } from '@/hooks/useToast';
import { useThemeSettings } from '@/stores/themeSettings';
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

// Product database
const productsData: Record<string, {
  id: number;
  name: string;
  nameAr: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionAr: string;
  longDescription: string;
  images: string[];
  category: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  stock: number;
  material: string;
  dimensions: string;
  weight: string;
  features: string[];
  isNew?: boolean;
}> = {
  'miroir-bois-sculpte': {
    id: 1,
    name: 'Miroir Bois Sculpté',
    nameAr: 'مرآة خشبية منحوتة',
    slug: 'miroir-bois-sculpte',
    price: 2500,
    originalPrice: 3000,
    description: 'Magnifique miroir avec cadre en bois de cèdre sculpté à la main.',
    descriptionAr: 'مرآة رائعة بإطار خشب الأرز المنحوت يدوياً.',
    longDescription: 'Ce miroir exceptionnel est une véritable œuvre d\'art artisanale. Le cadre en bois de cèdre de l\'Atlas est sculpté à la main par nos maîtres artisans avec des motifs géométriques traditionnels marocains.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop',
    ],
    category: 'decoration',
    categoryLabel: 'Décoration',
    rating: 4.8,
    reviews: 24,
    stock: 5,
    material: 'Bois de Cèdre',
    dimensions: '80 x 60 x 5 cm',
    weight: '4.5 kg',
    features: ['Cadre en bois massif', 'Sculpté à la main', 'Motifs traditionnels', 'Miroir haute qualité'],
    isNew: true,
  },
  'coffret-thuya': {
    id: 2,
    name: 'Coffret en Thuya',
    nameAr: 'صندوق من خشب العرعار',
    slug: 'coffret-thuya',
    price: 850,
    description: 'Coffret artisanal en bois de thuya avec motifs traditionnels.',
    descriptionAr: 'صندوق حرفي من خشب العرعار بزخارف تقليدية.',
    longDescription: 'Ce coffret en bois de thuya est fabriqué à Essaouira, capitale mondiale du travail du thuya.',
    images: [
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
    ],
    category: 'accessoires',
    categoryLabel: 'Accessoires',
    rating: 5,
    reviews: 18,
    stock: 12,
    material: 'Bois de Thuya',
    dimensions: '20 x 15 x 10 cm',
    weight: '0.8 kg',
    features: ['Bois de thuya authentique', 'Intérieur velours', 'Charnières laiton'],
    isNew: true,
  },
  'console-style-arabe': {
    id: 3,
    name: 'Console Style Arabe',
    nameAr: 'كونسول بالطراز العربي',
    slug: 'console-style-arabe',
    price: 12000,
    originalPrice: 15000,
    description: 'Console d\'entrée en bois massif avec gravures arabesques.',
    descriptionAr: 'كونسول مدخل من الخشب الصلب مع نقوش أرابيسك.',
    longDescription: 'Cette console majestueuse est le fruit de plusieurs semaines de travail artisanal. Sculptée dans du noyer massif, elle présente des motifs arabesques complexes gravés à la main.',
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop',
    ],
    category: 'mobilier',
    categoryLabel: 'Mobilier',
    rating: 4.9,
    reviews: 12,
    stock: 1,
    material: 'Noyer Massif',
    dimensions: '120 x 40 x 85 cm',
    weight: '25 kg',
    features: ['Noyer massif', 'Gravures arabesques', 'Tiroir avec poignée laiton', 'Pièce unique'],
  },
  'table-basse-cedre': {
    id: 4,
    name: 'Table Basse en Cèdre',
    nameAr: 'طاولة قهوة من خشب الأرز',
    slug: 'table-basse-cedre',
    price: 8500,
    description: 'Table basse en cèdre massif avec plateau sculpté de motifs traditionnels.',
    descriptionAr: 'طاولة قهوة من خشب الأرز الصلب مع سطح منحوت بزخارف تقليدية.',
    longDescription: 'Table basse élégante en cèdre massif, avec un plateau sculpté de motifs traditionnels marocains. Cette pièce unique allie l\'artisanat ancestral à un design contemporain.',
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop',
    ],
    category: 'mobilier',
    categoryLabel: 'Mobilier',
    rating: 4.7,
    reviews: 31,
    stock: 3,
    material: 'Cèdre de l\'Atlas',
    dimensions: '120 x 70 x 45 cm',
    weight: '18 kg',
    features: ['Cèdre massif', 'Plateau sculpté', 'Motifs géométriques', 'Pieds tournés'],
  },
  'lampe-zellige': {
    id: 5,
    name: 'Lampe Zellige Artisanale',
    nameAr: 'مصباح زليج حرفي',
    slug: 'lampe-zellige',
    price: 1200,
    originalPrice: 1500,
    description: 'Lampe de table avec base en bois et abat-jour zellige.',
    descriptionAr: 'مصباح طاولة بقاعدة خشبية وغطاء زليج.',
    longDescription: 'Cette lampe artisanale combine le savoir-faire du travail du bois et l\'art traditionnel du zellige marocain.',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
    ],
    category: 'decoration',
    categoryLabel: 'Décoration',
    rating: 4.6,
    reviews: 45,
    stock: 8,
    material: 'Bois & Zellige',
    dimensions: '25 x 25 x 45 cm',
    weight: '2 kg',
    features: ['Base en bois', 'Abat-jour zellige', 'Éclairage ambiant'],
  },
  'chaise-traditionnelle': {
    id: 6,
    name: 'Chaise Traditionnelle',
    nameAr: 'كرسي تقليدي',
    slug: 'chaise-traditionnelle',
    price: 4500,
    description: 'Chaise en bois massif avec assise en cuir tressé.',
    descriptionAr: 'كرسي من الخشب الصلب مع مقعد من الجلد المضفر.',
    longDescription: 'Cette chaise traditionnelle marocaine allie confort et élégance avec son assise en cuir tressé à la main.',
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
    ],
    category: 'mobilier',
    categoryLabel: 'Mobilier',
    rating: 4.8,
    reviews: 22,
    stock: 2,
    material: 'Chêne & Cuir',
    dimensions: '45 x 45 x 90 cm',
    weight: '8 kg',
    features: ['Chêne massif', 'Cuir tressé main', 'Design ergonomique'],
  },
};

// Related products
const relatedProducts = [
  {
    id: 3,
    slug: 'console-style-arabe',
    name: 'Console Style Arabe',
    price: 12000,
    originalPrice: 15000,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&h=400&fit=crop',
    rating: 4.9,
  },
  {
    id: 6,
    slug: 'chaise-traditionnelle',
    name: 'Chaise Traditionnelle',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop',
    rating: 4.8,
  },
  {
    id: 5,
    slug: 'lampe-zellige',
    name: 'Lampe Zellige',
    price: 1200,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop',
    rating: 4.6,
    isNew: true,
  },
  {
    id: 2,
    slug: 'coffret-thuya',
    name: 'Coffret en Thuya',
    price: 850,
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop',
    rating: 5,
    isNew: true,
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const isRTL = locale === 'ar';

  // Cart store integration
  const { addItem } = useCartStore();
  const { success } = useToast();
  const theme = useThemeSettings();

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

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Get product data - fallback to table-basse-cedre if not found
  const productData = productsData[slug] ?? productsData['table-basse-cedre'];
  const product = productData as NonNullable<typeof productData>;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA').format(price);
  };

  // Add to cart handler - connected to Zustand store
  const handleAddToCart = () => {
    addItem({
      productId: String(product.id),
      name: isRTL ? product.nameAr : product.name,
      price: product.price,
      quantity,
      image: product.images[0] ?? '',
    });

    setAddedToCart(true);
    success(
      isRTL ? 'تمت الإضافة للسلة!' : 'Ajouté au panier !',
      `${quantity}x ${isRTL ? product.nameAr : product.name}`
    );
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Buy now - add to cart and go to checkout
  const handleBuyNow = () => {
    addItem({
      productId: String(product.id),
      name: isRTL ? product.nameAr : product.name,
      price: product.price,
      quantity,
      image: product.images[0] ?? '',
    });
    router.push(`/${locale}/checkout`);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

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
              {isRTL ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight size={14} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
            <Link href={`/${locale}/boutique`} className="text-gray-500 hover:text-wood-primary">
              {isRTL ? 'المتجر' : 'Boutique'}
            </Link>
            <ChevronRight size={14} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-wood-dark font-medium truncate max-w-[200px]">
              {isRTL ? product.nameAr : product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* LEFT: Product Images - FIXED LAYOUT                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              {/* MAIN IMAGE - Large with fixed aspect ratio */}
              <div
                className="relative w-full bg-white rounded-2xl overflow-hidden shadow-lg cursor-zoom-in group"
                style={{ aspectRatio: '1/1' }}
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={product.images[selectedImage] ?? product.images[0] ?? ''}
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
                      {isRTL ? 'جديد' : 'NOUVEAU'}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Navigation Arrows */}
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

                {/* Zoom Icon */}
                <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} p-3 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                  <ZoomIn size={20} className="text-wood-dark" />
                </div>

                {/* Image Counter */}
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1.5 bg-black/60 text-white text-sm rounded-full z-10`}>
                  {selectedImage + 1} / {product.images.length}
                </div>
              </div>

              {/* THUMBNAILS - Fixed height */}
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
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* RIGHT: Product Info                                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:py-4">
              {/* Category */}
              <Link
                href={`/${locale}/boutique?category=${product.category}`}
                className="inline-block px-4 py-1.5 bg-wood-cream text-wood-primary text-sm font-medium rounded-full hover:bg-wood-primary hover:text-white transition-colors"
              >
                {product.categoryLabel}
              </Link>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mt-4 leading-tight" style={{ color: theme.boutiqueProduct.titleColor }}>
                {isRTL ? product.nameAr : product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
                <span className="font-medium" style={{ color: theme.boutiqueProduct.titleColor }}>{product.rating}</span>
                <span className="text-gray-400">|</span>
                <span className="text-wood-primary">{product.reviews} {isRTL ? 'تقييم' : 'avis'}</span>
                {product.stock > 0 && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Check size={16} />
                      {isRTL ? 'متوفر' : 'En stock'}
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-4 mt-6 flex-wrap">
                <span className="text-4xl font-bold text-wood-primary">
                  {formatPrice(product.price)} {isRTL ? 'د.م' : 'DH'}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)} {isRTL ? 'د.م' : 'DH'}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                      {isRTL ? 'وفر' : 'Économisez'} {formatPrice(product.originalPrice - product.price)} {isRTL ? 'د.م' : 'DH'}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="mt-6 text-lg leading-relaxed" style={{ color: theme.boutiqueProduct.bodyColor }}>
                {isRTL ? product.descriptionAr : product.description}
              </p>

              {/* Stock Warning */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="mt-6 flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <Clock size={20} className="text-orange-500 flex-shrink-0" />
                  <span className="text-orange-700 font-medium">
                    {isRTL
                      ? `أسرع! بقي ${product.stock} فقط في المخزون`
                      : `Dépêchez-vous ! Seulement ${product.stock} restant(s)`
                    }
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
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-16 text-center text-xl font-bold" style={{ color: theme.boutiqueProduct.titleColor }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-4 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-bold text-lg transition-all ${
                      addedToCart
                        ? 'bg-green-500 text-white'
                        : product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-wood-primary text-white hover:bg-wood-secondary hover:shadow-lg hover:shadow-wood-primary/30'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={24} />
                        {isRTL ? 'تمت الإضافة!' : 'Ajouté !'}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={24} />
                        {isRTL ? 'أضف إلى السلة' : 'Ajouter au panier'}
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
                  disabled={product.stock === 0}
                  className="w-full py-4 px-8 bg-wood-dark text-white font-bold text-lg rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRTL ? 'اشتر الآن' : 'Acheter maintenant'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <Truck className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {isRTL ? 'شحن مجاني' : 'Livraison gratuite'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'من 1000 د.م' : 'Dès 1000 DH'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <Shield className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {isRTL ? 'ضمان سنتين' : 'Garantie 2 ans'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'قطع وعمل' : 'Pièces et main d\'œuvre'}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm">
                  <RotateCcw className="w-8 h-8 text-wood-primary mb-2" />
                  <span className="text-sm font-medium text-wood-dark">
                    {isRTL ? 'إرجاع 14 يوم' : 'Retour 14 jours'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'مضمون' : 'Satisfait ou remboursé'}
                  </span>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <span className="text-gray-500 font-medium">
                  {isRTL ? 'شارك:' : 'Partager:'}
                </span>
                <button className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className="p-2 hover:bg-sky-50 rounded-full text-sky-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </button>
                <button className="p-2 hover:bg-green-50 rounded-full text-green-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
              { id: 'description', label: isRTL ? 'الوصف' : 'Description' },
              { id: 'specifications', label: isRTL ? 'المواصفات' : 'Caractéristiques' },
              { id: 'shipping', label: isRTL ? 'الشحن' : 'Livraison' },
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
                <p className="text-lg leading-relaxed mb-6" style={{ color: theme.boutiqueTabs.bodyColor }}>
                  {product.longDescription}
                </p>
                <h3 className="text-xl font-bold mb-4" style={{ color: theme.boutiqueTabs.titleColor }}>
                  {isRTL ? 'المميزات' : 'Caractéristiques principales'}
                </h3>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span style={{ color: theme.boutiqueTabs.bodyColor }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 font-medium w-1/3" style={{ color: theme.boutiqueTabs.titleColor }}>
                      {isRTL ? 'المادة' : 'Matériau'}
                    </td>
                    <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{product.material}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium" style={{ color: theme.boutiqueTabs.titleColor }}>
                      {isRTL ? 'الأبعاد' : 'Dimensions'}
                    </td>
                    <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{product.dimensions}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium" style={{ color: theme.boutiqueTabs.titleColor }}>
                      {isRTL ? 'الوزن' : 'Poids'}
                    </td>
                    <td className="py-4" style={{ color: theme.boutiqueTabs.bodyColor }}>{product.weight}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl">
                  <Truck className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-800 mb-1">
                      {isRTL ? 'شحن مجاني' : 'Livraison gratuite'}
                    </h4>
                    <p className="text-green-700">
                      {isRTL
                        ? 'شحن مجاني للطلبات فوق 1000 د.م. التوصيل خلال 3-5 أيام عمل.'
                        : 'Livraison gratuite pour les commandes supérieures à 1000 DH. Délai: 3-5 jours ouvrés.'
                      }
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
                      {isRTL
                        ? 'كل منتج مغلف بعناية لضمان وصوله في حالة ممتازة.'
                        : 'Chaque produit est soigneusement emballé pour garantir une livraison en parfait état.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 relative" style={sectionBg(theme.boutiqueRelated)}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ color: theme.boutiqueRelated.titleColor }}>
            {isRTL ? 'منتجات مشابهة' : 'Produits similaires'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/boutique/${item.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                {/* IMAGE - FIXED */}
                <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {item.originalPrice && (
                    <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full`}>
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </span>
                  )}
                  {item.isNew && (
                    <span className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full`}>
                      {isRTL ? 'جديد' : 'NEW'}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold group-hover:text-wood-primary transition-colors line-clamp-1" style={{ color: theme.boutiqueRelated.titleColor }}>
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="font-bold text-wood-primary">{formatPrice(item.price)} DH</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)} DH</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Shop */}
      <div className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <Link
            href={`/${locale}/boutique`}
            className="inline-flex items-center gap-2 text-wood-primary font-medium hover:underline"
          >
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'العودة للمتجر' : 'Retour à la boutique'}
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>

          {/* Main Image */}
          <div className="relative w-full max-w-4xl mx-4" style={{ aspectRatio: '1/1', maxHeight: '80vh' }}>
            <Image
              src={product.images[selectedImage] ?? product.images[0] ?? ''}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={32} className="text-white" />
          </button>

          {/* Thumbnails */}
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
        </div>
      )}
    </div>
  );
}
