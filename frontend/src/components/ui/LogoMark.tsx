"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface LogoMarkProps { compact?: boolean; onClick?: () => void; }

export function LogoMark({ compact = false, onClick }: LogoMarkProps) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 420, damping: 24 }} className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-berry focus-visible:ring-offset-4 focus-visible:ring-offset-cream" aria-label="Luu Tasty Treats home">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-vanilla shadow-sm">
        <Image src="/images/IMG_7325.png" alt="Luu Tasty Treats" fill sizes="44px" className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110" />
      </div>
      {!compact && (
        <div className="hidden text-left sm:block">
          <p className="font-serif text-lg font-semibold leading-none tracking-[0.12em] text-chocolate">LUU'</p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-chocolate/55">Tasty Treats</p>
        </div>
      )}
    </motion.button>
  );
}
