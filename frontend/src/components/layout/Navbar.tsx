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
  const isAdmin = useAuthStore((s) => !!s.accessToken);
  const clickTimestamps = useRef<number[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  function handleLogoClick(e: React.MouseEvent) {
    const now = Date.now();
    
    // Clean up timestamps outside the active window and append the new click
    const recentClicks = clickTimestamps.current.filter((t) => now - t < SECRET_CLICK_WINDOW_MS);
    const updatedClicks = [...recentClicks, now];
    clickTimestamps.current = updatedClicks;

    if (updatedClicks.length >= SECRET_CLICKS_REQUIRED) {
      e.preventDefault();
      clickTimestamps.current = [];
      setUnlocking(true);
      setTimeout(() => router.push(isAdmin ? "/admin/dashboard" : "/admin/login"), 900);
    } else {
      // Normal click routes smoothly to Lulama Nguxa's profile page
      e.preventDefault();
      router.push("/owner");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-cream/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          
          {/* Logo & Elegant Black Title */}
          <Link 
            href="/owner" 
            onClick={handleLogoClick} 
            className="group flex select-none items-center gap-4 transition-opacity hover:opacity-80"
          >
            <div className="overflow-hidden rounded bg-black p-1 shadow-sm transition-transform duration-500 group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Luu Tasty Treats Logo" 
                width={40} 
                height={40} 
                className="h-10 w-auto object-contain"
                priority 
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-widest text-black">
              Luu Tasty Treats
            </span>
          </Link>

          {/* Animated Icons Navigation */}
          <div className="flex items-center gap-8 text-black">
            
            {/* Cakes Icon */}
            <Link href="/cakes" className="group relative">
              <motion.div 
                whileHover={{ y: -3, rotate: -8 }} 
                transition={{ type: "spring", stiffness: 400 }}
              >
                <CakeSlice className="h-6 w-6 stroke-[1.5px] transition-colors group-hover:text-gray-500" />
              </motion.div>
            </Link>
              <Link href="/policies" className="transition hover:text-berry-dark">Policies</Link>
            {/* Cart Icon with Notification Badge */}
            <Link href="/cart" className="group relative flex items-center">
              <motion.div 
                key={bumpTick} 
                initial={{ scale: 1 }} 
                animate={{ scale: [1, 1.3, 1] }} 
                whileHover={{ y: -3, rotate: 8 }}
                transition={{ 
                  scale: { duration: 0.3, ease: "easeInOut" },
                  default: { type: "spring", stiffness: 400 } 
                }}
              >
                <ShoppingBag className="h-6 w-6 stroke-[1.5px] transition-colors group-hover:text-gray-500" />
              </motion.div>
              
              {/* Animated Cart Counter Badge */}
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

      {/* Secret Admin Unlock Overlay - Black Theme */}
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