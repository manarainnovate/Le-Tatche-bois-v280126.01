"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  aspectRatio?: "square" | "video" | "portrait";
  showThumbnails?: boolean;
  enableLightbox?: boolean;
  enableZoom?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// ASPECT RATIO CLASSES
// ═══════════════════════════════════════════════════════════

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
};

// ═══════════════════════════════════════════════════════════
// LIGHTBOX COMPONENT
// ═══════════════════════════════════════════════════════════

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  enableZoom?: boolean;
}

function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
  enableZoom = false,
}: LightboxProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isRtl, setIsRtl] = React.useState(false);

  // Lock body scroll
  useBodyScrollLock(true);

  // Handle client-side mounting
  React.useEffect(() => {
    setIsMounted(true);
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (isRtl) {
            onNext();
          } else {
            onPrevious();
          }
          break;
        case "ArrowRight":
          if (isRtl) {
            onPrevious();
          } else {
            onNext();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevious, onNext, isRtl]);

  // Handle swipe gestures
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > velocityThreshold
    ) {
      // Swipe right
      if (isRtl) {
        onNext();
      } else {
        onPrevious();
      }
    } else if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      // Swipe left
      if (isRtl) {
        onPrevious();
      } else {
        onNext();
      }
    }
  };

  // Toggle zoom
  const handleDoubleClick = () => {
    if (enableZoom) {
      setIsZoomed((prev) => !prev);
    }
  };

  // Reset zoom on image change
  React.useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  if (!isMounted || !currentImage) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 z-10 p-2 rounded-full",
            "text-white hover:opacity-80 transition-opacity",
            "focus:outline-none focus:ring-2 focus:ring-white/50",
            isRtl ? "left-4" : "right-4"
          )}
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            {/* Previous button */}
            <button
              type="button"
              onClick={onPrevious}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10",
                "w-12 h-12 rounded-full",
                "bg-white/20 hover:bg-white/30",
                "flex items-center justify-center",
                "text-white transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50",
                isRtl ? "right-4" : "left-4"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              type="button"
              onClick={onNext}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10",
                "w-12 h-12 rounded-full",
                "bg-white/20 hover:bg-white/30",
                "flex items-center justify-center",
                "text-white transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50",
                isRtl ? "left-4" : "right-4"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          drag={!isZoomed ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleClick}
          className={cn(
            "relative max-w-[90vw] max-h-[90vh]",
            "cursor-grab active:cursor-grabbing",
            enableZoom && "cursor-zoom-in",
            isZoomed && "cursor-zoom-out"
          )}
        >
          <motion.div
            animate={{ scale: isZoomed ? 2 : 1 }}
            transition={{ duration: 0.3 }}
            drag={isZoomed}
            dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
            className="relative"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={currentImage.width || 1200}
              height={currentImage.height || 800}
              className="object-contain max-h-[90vh] w-auto h-auto"
              priority
              draggable={false}
            />
          </motion.div>
        </motion.div>

        {/* Counter */}
        {hasMultipleImages && (
          <div
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2",
              "text-white text-sm bg-black/50 px-3 py-1 rounded-full"
            )}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Zoom hint */}
        {enableZoom && (
          <div
            className={cn(
              "absolute bottom-4 text-white/60 text-xs",
              isRtl ? "left-4" : "right-4"
            )}
          >
            {isZoomed ? "Click to zoom out" : "Double-click to zoom"}
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════
// IMAGE GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════

function ImageGallery({
  images,
  aspectRatio = "square",
  showThumbnails = true,
  enableLightbox = true,
  enableZoom = false,
  className,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [isRtl, setIsRtl] = React.useState(false);
  const thumbnailsRef = React.useRef<HTMLDivElement>(null);

  // Detect RTL
  React.useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  // Navigation handlers
  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Scroll selected thumbnail into view
  React.useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const container = thumbnailsRef.current;
      const thumbnail = container.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, showThumbnails]);

  // Open lightbox
  const openLightbox = () => {
    if (enableLightbox) {
      setLightboxOpen(true);
    }
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  if (!currentImage) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Main Image */}
      <div
        className={cn(
          "relative rounded-lg overflow-hidden bg-wood-light/10",
          aspectRatioClasses[aspectRatio],
          enableLightbox && "cursor-pointer group"
        )}
        onClick={openLightbox}
        role={enableLightbox ? "button" : undefined}
        tabIndex={enableLightbox ? 0 : undefined}
        onKeyDown={(e) => {
          if (enableLightbox && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openLightbox();
          }
        }}
        aria-label={enableLightbox ? "Open image in lightbox" : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom icon overlay */}
        {enableLightbox && (
          <div
            className={cn(
              "absolute bottom-3 p-2 rounded-full",
              "bg-black/50 text-white",
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              isRtl ? "left-3" : "right-3"
            )}
          >
            <ZoomIn className="w-5 h-5" />
          </div>
        )}

        {/* Gallery navigation arrows (on main image) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                "w-10 h-10 rounded-full",
                "bg-white/80 hover:bg-white shadow-md",
                "flex items-center justify-center",
                "text-wood-dark transition-all",
                "focus:outline-none focus:ring-2 focus:ring-wood-primary",
                isRtl ? "right-2" : "left-2"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                "w-10 h-10 rounded-full",
                "bg-white/80 hover:bg-white shadow-md",
                "flex items-center justify-center",
                "text-wood-dark transition-all",
                "focus:outline-none focus:ring-2 focus:ring-wood-primary",
                isRtl ? "left-2" : "right-2"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && hasMultipleImages && (
        <div
          ref={thumbnailsRef}
          className={cn(
            "flex gap-2 mt-4 overflow-x-auto pb-2",
            "scrollbar-hide",
            isRtl && "flex-row-reverse"
          )}
          role="tablist"
          aria-label="Image thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`View ${image.alt}`}
              className={cn(
                "relative shrink-0",
                "w-16 h-16 md:w-20 md:h-20",
                "rounded-md overflow-hidden",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-wood-primary focus:ring-offset-2",
                currentIndex === index
                  ? "ring-2 ring-wood-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots indicator (alternative to thumbnails on mobile) */}
      {!showThumbnails && hasMultipleImages && (
        <div
          className="flex justify-center gap-2 mt-4"
          role="tablist"
          aria-label="Image indicators"
        >
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Go to image ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-wood-primary focus:ring-offset-2",
                currentIndex === index
                  ? "bg-wood-primary w-4"
                  : "bg-wood-light hover:bg-wood-accent"
              )}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          enableZoom={enableZoom}
        />
      )}
    </div>
  );
}

ImageGallery.displayName = "ImageGallery";

export { ImageGallery };
