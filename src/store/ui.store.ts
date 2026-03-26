import { create } from "zustand";

interface UIStore {
  // State
  mobileMenuOpen: boolean;
  scrollShadow: boolean;

  // Actions
  setMobileMenuOpen: (open: boolean) => void;
  setScrollShadow: (shadow: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  mobileMenuOpen: false,
  scrollShadow: false,

  // Actions
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setScrollShadow: (shadow) => set({ scrollShadow: shadow }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}));
