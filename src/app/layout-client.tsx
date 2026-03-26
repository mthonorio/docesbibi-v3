"use client";

import { useEffect } from "react";
import { CartSheet } from "@/components/molecules/CartSheet";
import Footer from "@/components/molecules/Footer";
import { Header } from "@/components/molecules/Header";
import { useCartStore } from "@/store/cart.store";
import { useUIStore } from "@/store/ui.store";

interface LayoutClientProps {
  children: React.ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
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
        totalItems={totalItems()}
      />
      <main className="flex-1 flex flex-col">{children}</main>
      <CartSheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        totalPrice={totalPrice()}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
      <Footer />
    </>
  );
}
