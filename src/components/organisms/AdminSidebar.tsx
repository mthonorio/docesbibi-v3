"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[#f1e4e0] bg-white p-[18px] pt-7">
      <div
        className="bg-clip-text px-2.5 pb-7 font-serif text-xl font-bold text-transparent"
        style={{
          backgroundImage: "linear-gradient(135deg, #f08da3, #8b0000)",
        }}
      >
        Doces Bibi
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition-colors ${
                isActive
                  ? "bg-rosa-800 text-white"
                  : "text-marrom-500 hover:bg-rosa-50"
              }`}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.2 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-auto flex items-center gap-2.5 rounded-xl border-t border-[#f1e4e0] px-2.5 pt-3.5 text-left"
      >
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-rosa-800 text-[13px] font-bold text-white">
          B
        </div>
        <div className="flex-1">
          <span className="block text-[12.5px] font-bold text-marrom-900">
            Gestora
          </span>
          <span className="text-[10.5px] text-marrom-400">Sair</span>
        </div>
        <LogOut className="h-4 w-4 text-marrom-400" strokeWidth={2} />
      </button>
    </aside>
  );
}
