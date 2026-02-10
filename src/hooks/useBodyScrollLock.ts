"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to lock body scroll when a modal or overlay is open.
 * Handles iOS quirks by using position: fixed approach.
 * Preserves and restores scroll position on unlock.
 *
 * @param isLocked - Whether body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean): void {
  const scrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isLocked) return;

    // Save current scroll position
    scrollY.current = window.scrollY;

    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Apply scroll lock styles
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.width = "100%";

    // Add padding to compensate for scrollbar
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Cleanup: restore original styles and scroll position
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.paddingRight = originalPaddingRight;

      // Restore scroll position
      window.scrollTo(0, scrollY.current);
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
