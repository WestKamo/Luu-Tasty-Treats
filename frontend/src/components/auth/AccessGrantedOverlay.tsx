"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

export function AccessGrantedOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-espresso" role="status" aria-live="polite">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 0.35 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute h-[45vw] w-[45vw] rounded-full bg-berry/40 blur-[120px]" />
          <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 0.25 }} transition={{ delay: 0.15, duration: 1 }} className="absolute h-[30vw] w-[30vw] rounded-full bg-gold/30 blur-[100px]" />
          
          {[...Array(12)].map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [30, -100 - i * 12], x: (i % 2 === 0 ? 1 : -1) * (20 + i * 15) }} transition={{ duration: 2, delay: i * 0.06, ease: "easeOut" }} className="absolute">
              <Sparkles size={12 + (i % 3) * 4} className="text-gold" />
            </motion.div>
          ))}

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="relative mb-10 flex h-24 w-24 items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-gold/20 border-t-gold" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border border-berry/20 border-b-berry" />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vanilla">
                <Check size={24} strokeWidth={2.5} className="text-chocolate" />
              </div>
            </motion.div>

            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }} className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-gold">Welcome back</motion.p>
            <motion.h1 initial={{ y: 30, opacity: 0, filter: "blur(10px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ delay: 0.35, duration: 0.7 }} className="font-serif text-6xl font-medium tracking-tight text-vanilla sm:text-7xl md:text-8xl">Access Granted</motion.h1>
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 120, opacity: 1 }} transition={{ delay: 0.65, duration: 0.6 }} className="my-6 h-px bg-gold" />
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="text-sm text-vanilla/50">Preparing your delicious experience…</motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
