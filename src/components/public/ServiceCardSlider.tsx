'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceCardSliderProps {
  images: string[];
  serviceName: string;
}

// Demo images for each service type (free Unsplash)
const SERVICE_IMAGES: Record<string, string[]> = {
  portes: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=500&h=350&fit=crop',
  ],
  fenetres: [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500&h=350&fit=crop',
  ],
  mobilier: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&h=350&fit=crop',
  ],
  escaliers: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=500&h=350&fit=crop',
  ],
  plafonds: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=350&fit=crop',
  ],
  restauration: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500&h=350&fit=crop',
    'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=500&h=350&fit=crop',
  ],
};

function getImagesForService(serviceName: string): string[] {
  const name = serviceName.toLowerCase();
  if (name.includes('porte') || name.includes('door')) return SERVICE_IMAGES.portes;
  if (name.includes('fenêtre') || name.includes('fenetre') || name.includes('window')) return SERVICE_IMAGES.fenetres;
  if (name.includes('mobili') || name.includes('meuble') || name.includes('furniture')) return SERVICE_IMAGES.mobilier;
  if (name.includes('escalier') || name.includes('stair')) return SERVICE_IMAGES.escaliers;
  if (name.includes('plafond') || name.includes('ceiling')) return SERVICE_IMAGES.plafonds;
  if (name.includes('restaur') || name.includes('restor')) return SERVICE_IMAGES.restauration;
  return SERVICE_IMAGES.mobilier;
}

export default function ServiceCardSlider({ images, serviceName }: ServiceCardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const displayImages = images && images.length > 0 ? images : getImagesForService(serviceName);

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [displayImages.length]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayImages.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${serviceName} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Navigation Arrows */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-10 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-white w-4' : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
