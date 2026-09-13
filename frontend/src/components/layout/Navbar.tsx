"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const cartCount = useCartStore((s) => s.lines.length);
  const isAdmin = useAuthStore((s) => !!s.accessToken);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Luu Tasty Treats
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/cakes" className="hover:text-neutral-600">Cakes</Link>
          <Link href="/cart" className="hover:text-neutral-600">Cart ({cartCount})</Link>
          {isAdmin ? (
            <Link href="/admin/dashboard" className="font-medium">Admin</Link>
          ) : (
            <Link href="/admin/login" className="text-neutral-400 hover:text-neutral-600">
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
