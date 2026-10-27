"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { CakeSlice, ShoppingBag, BookOpenText, ScrollText } from "lucide-react";

const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1500;

export function Navbar() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.lines.length);
  const bumpTick = useCartStore((s) => s.bumpTick);
  const clickTimestamps = useRef<number[]>([]);
  const ownerNavigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (ownerNavigationTimer.current) clearTimeout(ownerNavigationTimer.current); }, []);

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    const now = Date.now();
    clickTimestamps.current = [...clickTimestamps.current.filter((t) => now - t < SECRET_CLICK_WINDOW_MS), now];
    if (ownerNavigationTimer.current) clearTimeout(ownerNavigationTimer.current);
    if (clickTimestamps.current.length >= SECRET_CLICKS_REQUIRED) {
      clickTimestamps.current = [];
      router.push("/admin/login");
    } else {
      // Briefly delay normal logo navigation to allow the five-tap shortcut.
      ownerNavigationTimer.current = setTimeout(() => {
        clickTimestamps.current = [];
        router.push("/owner");
      }, 520);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-chocolate/10 bg-cream/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/owner"
            onClick={handleLogoClick}
            className="group flex min-w-0 select-none items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
          >
            <div className="shrink-0 overflow-hidden rounded bg-black p-1 shadow-sm transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Luu Tasty Treats Logo"
                width={36}
                height={36}
                className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                priority
              />
            </div>
            <span className="min-w-0 whitespace-nowrap font-serif text-[clamp(0.9rem,3.7vw,1.55rem)] font-bold tracking-tight text-black sm:tracking-wide">
              Luu Tasty Treats
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3 text-chocolate sm:gap-5 lg:gap-7">
            <Link href="/cakes" aria-label="Browse cakes" className="group relative">
              <motion.div
                whileHover={{ y: -3, rotate: -8 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CakeSlice className="h-6 w-6 stroke-[1.5px] transition-colors group-hover:text-gray-500" />
              </motion.div>
            </Link>

            <Link href="/owner" title="Meet the baker" aria-label="Meet the baker" className="group inline-flex items-center gap-1.5 text-chocolate transition hover:text-[#9a624b]">
              <BookOpenText className="h-5.5 w-5.5 stroke-[1.5px]" />
              <span className="hidden text-sm font-medium md:inline">About</span>
            </Link>
            <Link href="/policies" title="Our policies" aria-label="Our policies" className="hidden text-sm transition hover:text-[#9a624b] sm:inline">Policies</Link>
            <Link href="/cart" aria-label="View shopping cart" className="group relative flex items-center">
              <motion.div
                key={bumpTick}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                whileHover={{ y: -3, rotate: 8 }}
                transition={{
                  scale: { duration: 0.3, ease: "easeInOut" },
                  default: { type: "spring", stiffness: 400 },
                }}
              >
                <ShoppingBag className="h-6 w-6 stroke-[1.5px] transition-colors group-hover:text-gray-500" />
              </motion.div>

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </nav>
      </header>

    </>
  );
}
