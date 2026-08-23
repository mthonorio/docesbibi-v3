"use client";

import { useEffect } from "react";
import { CartSheet } from "@/components/molecules/CartSheet";
import Footer from "@/components/molecules/Footer";
import { Header } from "@/components/molecules/Header";
import { BottomNav } from "@/components/molecules/BottomNav";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";
import { useIsClient } from "@/hooks/useIsClient";

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const isHydrated = useIsClient();

  const {
    items: cartItems,
    isOpen: cartOpen,
    setIsOpen: setCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCartStore();

  const {
    mobileMenuOpen,
    scrollShadow,
    setMobileMenuOpen,
    setScrollShadow,
    toggleMobileMenu,
  } = useUIStore();

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrollShadow(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrollShadow]);

  return (
    <>
      <Header
        scrollShadow={scrollShadow}
        onCartOpen={() => setCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={toggleMobileMenu}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        totalItems={isHydrated ? totalItems() : 0}
      />
      <main className="flex-1 flex flex-col pb-24 md:pb-0">{children}</main>
      <CartSheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        totalPrice={isHydrated ? totalPrice() : 0}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
      <Footer />
      <BottomNav />
    </>
  );
}
