"use client";

import { useEffect, useState } from "react";
import { CartSheet } from "@/components/molecules/CartSheet";
import Footer from "@/components/molecules/Footer";
import { Header } from "@/components/molecules/Header";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [isHydrated, setIsHydrated] = useState(false);

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

  // Set hydrated flag after mount to prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
      <main className="flex-1 flex flex-col">{children}</main>
      <CartSheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        totalPrice={isHydrated ? totalPrice() : 0}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
      <Footer />
    </>
  );
}
