'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlideshowProps {
  images: string[];
  interval?: number; // in milliseconds
  children?: React.ReactNode; // Content to overlay on hero
}

export default function HeroSlideshow({
  images,
  interval = 3000,
  children
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter out empty images
  const validImages = images.filter(img => img && img.trim());

  // Auto-advance slides
  useEffect(() => {
    if (validImages.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [validImages.length, interval, isHovered]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (validImages.length === 0) {
    return (
      <section className="relative h-[50vh] md:h-[60vh] bg-gradient-to-r from-amber-700 to-amber-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        {children}
      </section>
    );
  }

  return (
    <section
      className="relative h-[50vh] md:h-[70vh] overflow-hidden bg-white group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* WHITE BACKGROUND + NATURAL SIZE IMAGES */}
      {validImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 bg-white flex items-center justify-center ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ))}

      {/* Gradient Overlay - Only at bottom for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Navigation Arrows - Show on hover */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validImages.length > 1 && validImages.length <= 15 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/80 w-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 text-white text-sm rounded-full font-medium z-10">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}

      {/* Content Overlay */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none z-10">
          <div className="pointer-events-auto">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
