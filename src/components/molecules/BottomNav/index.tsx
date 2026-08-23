"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Package } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

const LINK_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/products", label: "Produtos", icon: LayoutGrid },
];

/**
 * Nav fixa mobile do comprador. Some no desktop (md:hidden) — lá a
 * navegação continua pelo Header. "Carrinho" abre o CartSheet (drawer) em
 * vez de navegar — não existe uma rota /cart, o carrinho nunca virou página.
 */
export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.totalItems());
  const setCartOpen = useCartStore((state) => state.setIsOpen);

  const itemClass = (isActive: boolean) =>
    `relative flex flex-1 flex-col items-center gap-1 ${
      isActive ? "text-rosa-900" : "text-marrom-500"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-rosa-100 bg-white/95 px-2 pb-5 pt-2.5 backdrop-blur-md shadow-[0_-8px_24px_-12px_rgba(62,39,35,0.2)] md:hidden">
      {LINK_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={itemClass(isActive)}>
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.3 : 2} />
            <span className={`text-[10.5px] ${isActive ? "font-bold" : ""}`}>
              {label}
            </span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={itemClass(false)}
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={2} />
        <span className="text-[10.5px]">Carrinho</span>
        {totalItems > 0 && (
          <span className="absolute -top-0.5 right-6 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-vermelho-700 text-[9px] font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>

      <Link href="/pedidos" className={itemClass(pathname.startsWith("/pedidos"))}>
        <Package className="h-5 w-5" strokeWidth={pathname.startsWith("/pedidos") ? 2.3 : 2} />
        <span className={`text-[10.5px] ${pathname.startsWith("/pedidos") ? "font-bold" : ""}`}>
          Pedidos
        </span>
      </Link>
    </nav>
  );
}
