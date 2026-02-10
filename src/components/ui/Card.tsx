"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// CARD ROOT
// ═══════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "horizontal";
  href?: string;
  onClick?: () => void;
  className?: string;
}

function CardRoot({
  children,
  variant = "default",
  href,
  onClick,
  className,
}: CardProps) {
  const cardClasses = cn(
    // Base styles
    "group bg-white rounded-xl overflow-hidden",
    "border border-wood-light/50",
    "shadow-sm hover:shadow-md",
    "transition-all duration-300",
    // Hover lift effect
    "hover:-translate-y-1",
    // Layout based on variant
    variant === "horizontal" && "flex flex-row",
    variant === "default" && "flex flex-col",
    // Clickable styles
    (href || onClick) && "cursor-pointer",
    className
  );

  // When used with href, we need to avoid nesting block elements inside <a>
  // So we use the Link directly with the card styles
  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {children}
      </Link>
    );
  }

  const content = <div className={cardClasses}>{children}</div>;

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}>
        {content}
      </div>
    );
  }

  return content;
}

// ═══════════════════════════════════════════════════════════
// CARD.IMAGE
// ═══════════════════════════════════════════════════════════

interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait";
  children?: React.ReactNode;
  className?: string;
}

function CardImage({
  src,
  alt,
  aspectRatio = "video",
  children,
  className,
}: CardImageProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-100",
        aspectClasses[aspectRatio],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "object-cover",
          "transition-transform duration-500",
          "group-hover:scale-105"
        )}
      />
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.BADGE
// ═══════════════════════════════════════════════════════════

interface CardBadgeProps {
  children: React.ReactNode;
  variant?: "new" | "sale" | "featured" | "soldout";
  className?: string;
}

function CardBadge({
  children,
  variant = "new",
  className,
}: CardBadgeProps) {
  const variantClasses = {
    new: "bg-green-500 text-white",
    sale: "bg-red-500 text-white",
    featured: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
    soldout: "bg-gray-500 text-white",
  };

  return (
    <span
      className={cn(
        "absolute top-2 start-2 z-10",
        "px-2 py-1",
        "text-xs font-semibold uppercase",
        "rounded-md",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.CONTENT
// ═══════════════════════════════════════════════════════════

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("p-4 flex flex-col gap-2 flex-1", className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.TITLE
// ═══════════════════════════════════════════════════════════

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "font-semibold text-lg text-wood-dark",
        "line-clamp-2",
        "transition-colors duration-200",
        "group-hover:text-wood-primary",
        className
      )}
    >
      {children}
    </h3>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.SUBTITLE
// ═══════════════════════════════════════════════════════════

interface CardSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

function CardSubtitle({ children, className }: CardSubtitleProps) {
  return (
    <p className={cn("text-sm text-gray-500", className)}>
      {children}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.DESCRIPTION
// ═══════════════════════════════════════════════════════════

interface CardDescriptionProps {
  children: React.ReactNode;
  lines?: 1 | 2 | 3;
  className?: string;
}

function CardDescription({
  children,
  lines = 2,
  className,
}: CardDescriptionProps) {
  const lineClampClasses = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
  };

  return (
    <p
      className={cn(
        "text-sm text-gray-600",
        lineClampClasses[lines],
        className
      )}
    >
      {children}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.PRICE
// ═══════════════════════════════════════════════════════════

interface CardPriceProps {
  amount: number;
  compareAmount?: number;
  currency?: string;
  className?: string;
}

function CardPrice({
  amount,
  compareAmount,
  currency = "MAD",
  className,
}: CardPriceProps) {
  // Calculate discount percentage
  const discount = compareAmount
    ? Math.round(((compareAmount - amount) / compareAmount) * 100)
    : null;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Current Price */}
      <span className="font-bold text-lg text-wood-primary">
        {formatPrice(amount, currency)}
      </span>

      {/* Compare Price (strikethrough) */}
      {compareAmount && (
        <span className="text-sm text-gray-400 line-through">
          {formatPrice(compareAmount, currency)}
        </span>
      )}

      {/* Discount Badge */}
      {discount && discount > 0 && (
        <span className="px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded">
          -{discount}%
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CARD.FOOTER
// ═══════════════════════════════════════════════════════════

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("px-4 pb-4 flex gap-2", className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOUND COMPONENT EXPORT
// ═══════════════════════════════════════════════════════════

const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Badge: CardBadge,
  Content: CardContent,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Description: CardDescription,
  Price: CardPrice,
  Footer: CardFooter,
});

// ═══════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════

export type {
  CardProps,
  CardImageProps,
  CardBadgeProps,
  CardContentProps,
  CardTitleProps,
  CardSubtitleProps,
  CardDescriptionProps,
  CardPriceProps,
  CardFooterProps,
};

export { Card };
