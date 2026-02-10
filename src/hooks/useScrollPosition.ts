"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface ScrollPosition {
  scrollY: number;
  isScrolled: boolean;
}

// ═══════════════════════════════════════════════════════════
// USE SCROLL POSITION HOOK
// ═══════════════════════════════════════════════════════════

/**
 * Hook to track scroll position and scrolled state
 * @param threshold - Scroll threshold to consider "scrolled" (default: 50)
 */
export function useScrollPosition(threshold: number = 50): ScrollPosition {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);
    };

    // Set initial value
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrollY, isScrolled };
}

export default useScrollPosition;
