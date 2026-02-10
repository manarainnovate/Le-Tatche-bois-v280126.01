"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Optimized Image Component with Loading States
// ═══════════════════════════════════════════════════════════

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
  showSkeleton?: boolean;
  wrapperClassName?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  auto: "",
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.jpg",
  aspectRatio = "auto",
  showSkeleton = true,
  className,
  wrapperClassName,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const imageSrc = error ? fallbackSrc : src;

  // If using fill prop, we need a wrapper with relative positioning
  if (fill) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatioClasses[aspectRatio],
          wrapperClassName
        )}
      >
        {showSkeleton && isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatioClasses[aspectRatio],
        wrapperClassName
      )}
    >
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Background Image Component (for hero sections, etc.)
// ═══════════════════════════════════════════════════════════

interface BackgroundImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
}

export function BackgroundImage({
  src,
  alt,
  priority = false,
  quality = 85,
  className,
  overlayClassName,
  children,
}: BackgroundImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        className="object-cover"
        sizes="100vw"
      />
      {overlayClassName && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Product Image Component
// ═══════════════════════════════════════════════════════════

interface ProductImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, height: 80 },
  md: { width: 200, height: 200 },
  lg: { width: 400, height: 400 },
  xl: { width: 600, height: 600 },
};

export function ProductImage({
  src,
  alt,
  size = "md",
  className,
}: ProductImageProps) {
  const { width, height } = sizeConfig[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      aspectRatio="square"
      className={cn("rounded-lg", className)}
      sizes={`(max-width: 768px) ${width / 2}px, ${width}px`}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// Avatar Image Component
// ═══════════════════════════════════════════════════════════

interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  fallback,
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    // Show initials fallback
    const initials = fallback ?? alt.charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-wood-primary text-white font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
