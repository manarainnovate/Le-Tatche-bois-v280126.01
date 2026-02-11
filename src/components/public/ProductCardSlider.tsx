'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardSliderProps {
  images: string[];
  productName: string;
  category?: string;
}

// Demo images for products without real images
const DEMO_IMAGES: Record<string, string[]> = {
  tables: [
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&h=400&fit=crop',
  ],
  chaises: [
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&h=400&fit=crop',
  ],
  rangement: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=400&fit=crop',
  ],
  decoration: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=400&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
  ],
};

function getCategoryKey(cat?: string): string {
  if (!cat) return 'default';
  const lower = cat.toLowerCase();
  if (lower.includes('table')) return 'tables';
  if (lower.includes('chaise') || lower.includes('fauteuil')) return 'chaises';
  if (lower.includes('rangement') || lower.includes('armoire') || lower.includes('biblioth')) return 'rangement';
  if (lower.includes('décor') || lower.includes('miroir') || lower.includes('decor')) return 'decoration';
  return 'default';
}

export default function ProductCardSlider({ images, productName, category }: ProductCardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const MIN_SWIPE_DISTANCE = 50;

  const displayImages = images && images.length > 0
    ? images
    : DEMO_IMAGES[getCategoryKey(category)] || DEMO_IMAGES.default;

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50"
      style={{ paddingBottom: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      {displayImages.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${productName} - ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Navigation Arrows - Always visible on mobile, show on hover on desktop */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot Indicators - Clickable with proper touch targets */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 py-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToSlide(index, e)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Count Badge */}
      {displayImages.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full z-10">
          {currentIndex + 1}/{displayImages.length}
        </div>
      )}
    </div>
  );
}
