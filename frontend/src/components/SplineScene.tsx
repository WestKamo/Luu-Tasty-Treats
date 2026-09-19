"use client";

import { motion } from "framer-motion";

export function SplineScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-vanilla via-cream to-berry/30">
      <motion.div
        className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-berry/30 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-8 bottom-10 h-48 w-48 rounded-full bg-chocolate/10 blur-3xl"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 text-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" className="mx-auto h-28 w-28 drop-shadow-xl">
          <ellipse cx="100" cy="175" rx="60" ry="8" fill="#4A2F23" opacity="0.1" />
          <rect x="50" y="120" width="100" height="40" rx="10" fill="#E8A0BF" />
          <rect x="60" y="90" width="80" height="35" rx="10" fill="#F5E6C8" />
          <rect x="70" y="62" width="60" height="32" rx="10" fill="#FBF6EF" stroke="#E8A0BF" strokeWidth="2" />
          <rect x="97" y="35" width="6" height="27" rx="3" fill="#C97B9C" />
          <ellipse cx="100" cy="33" rx="6" ry="9" fill="#F5C97A" />
        </svg>
        <p className="mt-4 font-serif text-lg text-chocolate/70">Luu Tasty Treats</p>
      </motion.div>
    </div>
  );
}
