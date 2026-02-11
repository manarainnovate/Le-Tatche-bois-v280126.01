'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageSliderGalleryProps {
  images: string[];
  title?: string;
}

export default function ImageSliderGallery({ images, title }: ImageSliderGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const THUMBNAILS_VISIBLE = 6;
  const MIN_SWIPE_DISTANCE = 50;

  // Handle empty images
  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset
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
      goToNext(); // Swipe left → next image
    }
    if (isRightSwipe) {
      goToPrevious(); // Swipe right → previous image
    }
  };

  // Scroll thumbnails
  const scrollThumbnailsLeft = () => {
    setThumbnailStart((prev) => Math.max(0, prev - 1));
  };

  const scrollThumbnailsRight = () => {
    setThumbnailStart((prev) => Math.min(images.length - THUMBNAILS_VISIBLE, prev + 1));
  };

  // Keep current thumbnail in view
  useEffect(() => {
    if (currentIndex < thumbnailStart) {
      setThumbnailStart(currentIndex);
    } else if (currentIndex >= thumbnailStart + THUMBNAILS_VISIBLE) {
      setThumbnailStart(currentIndex - THUMBNAILS_VISIBLE + 1);
    }
  }, [currentIndex, thumbnailStart]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToPrevious, goToNext]);

  const visibleThumbnails = images.slice(thumbnailStart, thumbnailStart + THUMBNAILS_VISIBLE);
  const showLeftThumbnailArrow = thumbnailStart > 0;
  const showRightThumbnailArrow = thumbnailStart + THUMBNAILS_VISIBLE < images.length;

  return (
    <>
      <div className="w-full">
        {/* Main Image Slider */}
        <div
          className="relative aspect-[4/3] md:aspect-[16/10] bg-stone-100 rounded-lg md:rounded-xl overflow-hidden group border-0 md:border md:border-gray-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Image - COVER on mobile, CONTAIN on desktop */}
          <img
            src={images[currentIndex]}
            alt={`${title || 'Image'} ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          />

          {/* Zoom hint */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-3 right-3 p-2 bg-gray-800/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800/60 text-white text-sm rounded-full font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div className="mt-2 md:mt-4 flex items-center gap-1.5 md:gap-2 justify-center">
            {/* Left thumbnail arrow */}
            <button
              onClick={scrollThumbnailsLeft}
              disabled={!showLeftThumbnailArrow}
              className={`p-2 rounded-lg transition-all ${
                showLeftThumbnailArrow
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-hidden">
              {visibleThumbnails.map((img, idx) => {
                const actualIndex = thumbnailStart + idx;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => goToSlide(actualIndex)}
                    className={`relative flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-lg overflow-hidden bg-white border-2 transition-all ${
                      actualIndex === currentIndex
                        ? 'border-amber-500 ring-2 ring-amber-500 ring-offset-2'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${actualIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Number badge */}
                    <span className={`absolute bottom-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded ${
                      actualIndex === currentIndex
                        ? 'bg-amber-500 text-white'
                        : 'bg-black/50 text-white'
                    }`}>
                      {actualIndex + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right thumbnail arrow */}
            <button
              onClick={scrollThumbnailsRight}
              disabled={!showRightThumbnailArrow}
              className={`p-2 rounded-lg transition-all ${
                showRightThumbnailArrow
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal - Keep dark for focus */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Main image */}
          <img
            src={images[currentIndex]}
            alt={`${title || 'Image'} ${currentIndex + 1}`}
            className="max-w-[90vw] max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-lg font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Thumbnail strip in lightbox */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
            {images.slice(0, 12).map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(idx);
                }}
                className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
                  idx === currentIndex ? 'ring-2 ring-amber-500' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {images.length > 12 && (
              <span className="text-white/70 text-sm self-center ml-2 flex-shrink-0">
                +{images.length - 12}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
