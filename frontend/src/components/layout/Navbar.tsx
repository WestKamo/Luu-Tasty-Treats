"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { CakeSlice, ShoppingBag } from "lucide-react";

const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1500;

export function Navbar() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.lines.length);
  const bumpTick = useCartStore((s) => s.bumpTick);
  const isAdmin = useAuthStore((s) => s.roles.includes("Admin") || s.roles.includes("SuperAdmin"));
  const clickTimestamps = useRef<number[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  function handleLogoClick(e: React.MouseEvent) {
    const now = Date.now();
    const recentClicks = clickTimestamps.current.filter((t) => now - t < SECRET_CLICK_WINDOW_MS);
    const updatedClicks = [...recentClicks, now];
    clickTimestamps.current = updatedClicks;

    if (updatedClicks.length >= SECRET_CLICKS_REQUIRED) {
      e.preventDefault();
      clickTimestamps.current = [];
      setUnlocking(true);
      setTimeout(() => router.push(isAdmin ? "/admin/dashboard" : "/admin/login"), 900);
    } else {
      e.preventDefault();
      router.push("/owner");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-cream/90 backdrop-blur-md">
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

          <div className="flex shrink-0 items-center gap-4 text-black sm:gap-6 lg:gap-8">
            <Link href="/cakes" aria-label="Browse cakes" className="group relative">
              <motion.div
                whileHover={{ y: -3, rotate: -8 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CakeSlice className="h-6 w-6 stroke-[1.5px] transition-colors group-hover:text-gray-500" />
              </motion.div>
            </Link>

            <Link href="/policies" className="hidden text-sm transition hover:text-berry-dark sm:inline">
              Policies
            </Link>

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

      <AnimatePresence>
        {unlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center text-white"
            >
              <motion.div
                className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="font-serif text-lg tracking-widest text-white">ACCESS GRANTED</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
