"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1500;

export function Navbar() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.lines.length);
  const bumpTick = useCartStore((s) => s.bumpTick);
  const isAdmin = useAuthStore((s) => !!s.accessToken);
  const clickTimestamps = useRef<number[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  function handleLogoClick(e: React.MouseEvent) {
    const now = Date.now();
    clickTimestamps.current = [...clickTimestamps.current, now].filter((t) => now - t < SECRET_CLICK_WINDOW_MS);
    if (clickTimestamps.current.length >= SECRET_CLICKS_REQUIRED) {
      e.preventDefault();
      clickTimestamps.current = [];
      setUnlocking(true);
      setTimeout(() => router.push(isAdmin ? "/admin/dashboard" : "/admin/login"), 900);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-chocolate/10 bg-cream/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" onClick={handleLogoClick} className="select-none font-serif text-xl font-semibold tracking-tight text-chocolate">
            Luu Tasty Treats
          </Link>
          <div className="flex items-center gap-8 text-sm font-medium text-chocolate/80">
            <Link href="/cakes" className="transition hover:text-berry-dark">Cakes</Link>
            <motion.div key={bumpTick} initial={{ scale: 1 }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.3 }}>
              <Link href="/cart" className="transition hover:text-berry-dark">Cart ({cartCount})</Link>
            </motion.div>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {unlocking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-chocolate">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="text-center text-cream">
              <motion.div className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-berry" animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: "easeInOut" }} />
              <p className="font-serif text-lg tracking-widest">ACCESS GRANTED</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
