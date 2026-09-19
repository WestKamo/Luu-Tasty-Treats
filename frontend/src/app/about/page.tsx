"use client";
import { motion } from "framer-motion";
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-4xl font-semibold text-chocolate">Our Story</motion.h1>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 space-y-4 text-chocolate/70">
        <p>Luu Tasty Treats began as a small kitchen dream — every cake handcrafted, every order personal. Today we still bake the same way: made to order, one customer at a time.</p>
        <p>Our mission is simple: sweet moments, baked to perfection, for every celebration that matters to you.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 rounded-4xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-xl font-semibold text-chocolate">Pickup Location</h2>
        <p className="mt-2 text-chocolate/70">Germiston, Gauteng, South Africa</p>
      </motion.div>
    </div>
  );
}
