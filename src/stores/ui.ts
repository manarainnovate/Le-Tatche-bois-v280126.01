import { create } from "zustand";

// ═══════════════════════════════════════════════════════════
// UI STATE INTERFACE
// ═══════════════════════════════════════════════════════════

interface UIState {
  // Mobile Menu
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Search Modal (future use)
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Cart Drawer (future use)
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;

  // Quick View Modal (future use)
  quickViewProductId: string | null;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
}

// ═══════════════════════════════════════════════════════════
// UI STORE
// ═══════════════════════════════════════════════════════════

export const useUIStore = create<UIState>((set) => ({
  // Mobile Menu
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Search Modal
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // Cart Drawer
  isCartDrawerOpen: false,
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),

  // Quick View Modal
  quickViewProductId: null,
  openQuickView: (productId: string) => set({ quickViewProductId: productId }),
  closeQuickView: () => set({ quickViewProductId: null }),
}));

export default useUIStore;
