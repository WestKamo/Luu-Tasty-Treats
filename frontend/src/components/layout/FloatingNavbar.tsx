"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, Menu, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navigation = [{ label: "Cakes", href: "/cakes" }, { label: "About Us", href: "/about" }];

export function FloatingNavbar({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current < 80) return setHidden(false);
    setHidden(current > previous);
  });

  return (
    <motion.header initial={{ y: -80, opacity: 0, scale: 0.96 }} animate={{ y: hidden ? -150 : 0, opacity: hidden ? 0 : 1, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.8 }} className="fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 sm:top-7 lg:top-8">
      <nav aria-label="Main navigation" className="glass group relative overflow-hidden rounded-[1.5rem] px-2 py-2 sm:rounded-full sm:px-3">
        <div className="relative flex min-h-[58px] items-center justify-between gap-2 sm:min-h-[62px]">
          
          <Link href="/" className="group/logo flex shrink-0 items-center gap-2.5 rounded-full px-2 py-1 outline-none">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gold/25 bg-vanilla shadow-[0_5px_20px_rgba(50,30,26,0.08)]">
              <Image src="/images/IMG_7325_2.png" alt="Luu' Tasty Treats" width={44} height={44} className="object-contain p-1.5 transition-transform duration-500 group-hover/logo:scale-110" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-display text-[19px] font-semibold leading-none tracking-[0.11em] text-chocolate">LUU'</p>
              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.28em] text-chocolate/45">Tasty Treats</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="group/link relative rounded-full px-5 py-3 text-[13px] font-semibold tracking-wide text-chocolate/60 transition-colors hover:text-chocolate">
                {pathname === item.href && <motion.span layoutId="navbar-active" className="absolute inset-0 -z-10 rounded-full bg-chocolate/[0.055]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative">{item.label}</span>
              </Link>
            ))}
            <Link href="/custom" className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-4 py-2.5 text-[12px] font-bold text-chocolate transition-all hover:border-gold/45 hover:bg-gold/20">
              <Sparkles size={13} className="text-berry" /> Build Your Own
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="group/cart relative flex h-11 w-11 items-center justify-center rounded-full bg-chocolate text-vanilla shadow-lg shadow-chocolate/10 transition-transform hover:scale-105">
              <ShoppingBag size={18} strokeWidth={1.8} className="transition-transform duration-300 group-hover/cart:-rotate-6" />
              <AnimatePresence>
                {cartCount > 0 && <motion.span key={cartCount} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-vanilla bg-berry px-1 text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</motion.span>}
              </AnimatePresence>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-11 w-11 items-center justify-center rounded-full border border-chocolate/10 bg-vanilla/60 text-chocolate transition-colors hover:bg-vanilla md:hidden">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
