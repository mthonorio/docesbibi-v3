"use client";
import { Menu, X, ShoppingBag } from "lucide-react";

interface HeaderProps {
  scrollShadow: boolean;
  onCartOpen: () => void;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onMobileMenuClose: () => void;
  totalItems: number;
}

export function Header({
  scrollShadow,
  onCartOpen,
  mobileMenuOpen,
  onMobileMenuToggle,
  onMobileMenuClose,
  totalItems,
}: HeaderProps) {
  return (
    <nav
      className={`fixed w-full bg-white/90 backdrop-blur-md z-50 transition-all duration-300 ${
        scrollShadow ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer text-2xl font-serif font-bold text-gradient"
            onClick={() => window.scrollTo(0, 0)}
          >
            Doces Bibi
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#home"
              className="text-marrom-700 hover:text-rosa-800 font-medium"
            >
              Início
            </a>
            <a
              href="#produtos"
              className="text-marrom-700 hover:text-rosa-800 font-medium"
            >
              Produtos
            </a>
            <a
              href="#sobre"
              className="text-marrom-700 hover:text-rosa-800 font-medium"
            >
              Nossa História
            </a>
            <a
              href="#contato"
              className="text-marrom-700 hover:text-rosa-800 font-medium"
            >
              Contato
            </a>
            <button
              onClick={onCartOpen}
              className="relative bg-rosa-800 text-white p-2 rounded-full hover:bg-vermelho-700 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-vermelho-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={onCartOpen}
              className="relative bg-rosa-800 text-white p-2 rounded-full hover:bg-vermelho-700"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-vermelho-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button onClick={onMobileMenuToggle} className="text-marrom-700">
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-rosa-100">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a
              href="#home"
              className="block px-3 py-2 text-marrom-700 hover:bg-rosa-50 rounded-md"
              onClick={onMobileMenuClose}
            >
              Início
            </a>
            <a
              href="#produtos"
              className="block px-3 py-2 text-marrom-700 hover:bg-rosa-50 rounded-md"
              onClick={onMobileMenuClose}
            >
              Produtos
            </a>
            <a
              href="#sobre"
              className="block px-3 py-2 text-marrom-700 hover:bg-rosa-50 rounded-md"
              onClick={onMobileMenuClose}
            >
              Nossa História
            </a>
            <a
              href="#contato"
              className="block px-3 py-2 text-marrom-700 hover:bg-rosa-50 rounded-md"
              onClick={onMobileMenuClose}
            >
              Contato
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
