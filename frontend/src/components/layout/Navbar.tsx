"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CakeSlice, ChefHat, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1500;

function NavIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-chocolate/75 transition-colors duration-200 hover:bg-chocolate/5 hover:text-chocolate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry-dark sm:h-11 sm:w-11">
      {children}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.lines.length);
  const bumpTick = useCartStore((s) => s.bumpTick);
  const clickTimestamps = useRef<number[]>([]);

  function handleLogoClick(e: React.MouseEvent) {
    const now = Date.now();
    const recentClicks = clickTimestamps.current.filter((t) => now - t < SECRET_CLICK_WINDOW_MS);
    clickTimestamps.current = [...recentClicks, now];

    // Normal brand navigation stays on /owner; only the fifth quick tap is intercepted.
    // The shortcut never authenticates or bypasses the Admin login / role checks.
    if (clickTimestamps.current.length >= SECRET_CLICKS_REQUIRED) {
      e.preventDefault();
      clickTimestamps.current = [];
      router.push("/admin/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-chocolate/10 bg-cream/95 backdrop-blur-lg">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1 px-3 py-2.5 sm:px-7 sm:py-3.5">
        <Link
          href="/owner"
          onClick={handleLogoClick}
          aria-label="Luu Tasty Treats, meet the baker"
          className="group inline-flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry-dark sm:gap-3"
        >
          <div className="shrink-0 overflow-hidden rounded-xl border border-chocolate/10 bg-chocolate p-1 shadow-sm">
            <Image src="/logo.png" alt="" width={42} height={42} priority
              className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
          </div>
          <span className="min-w-0 whitespace-nowrap font-serif text-[clamp(0.8rem,3.2vw,1.35rem)] font-semibold tracking-[-0.025em] text-chocolate">
            Luu Tasty Treats
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <NavIcon href="/cakes" label="The cake boutique">
            <CakeSlice className="h-5 w-5 stroke-[1.6px]" aria-hidden="true" />
          </NavIcon>
          <NavIcon href="/owner" label="About the baker">
            <ChefHat className="h-5 w-5 stroke-[1.6px]" aria-hidden="true" />
          </NavIcon>
          <Link href="/policies" className="hidden rounded-full px-3 py-2 text-xs font-medium tracking-wide text-chocolate/65 hover:text-chocolate md:block">
            Policies
          </Link>
          <div className="relative">
            <NavIcon href="/cart" label="View your shopping cart">
              <motion.span key={bumpTick} initial={{ scale: 1 }} animate={{ scale: [1, 1.16, 1] }}
                transition={{ duration: 0.3 }}>
                <ShoppingBag className="h-5 w-5 stroke-[1.6px]" aria-hidden="true" />
              </motion.span>
            </NavIcon>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key="count" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  aria-label={`${cartCount} items in cart`}
                  className="pointer-events-none absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-berry-dark px-0.5 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}
