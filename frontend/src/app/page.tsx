"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-12 px-6 py-16 lg:flex-row lg:py-24">
        <motion.div 
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeInUp} className="text-xs font-bold uppercase tracking-[0.3em] text-berry-dark">
            Handcrafted in Kokosi
          </motion.p>
          <motion.h1 variants={fadeInUp} className="mt-4 font-serif text-5xl font-semibold leading-tight text-chocolate sm:text-6xl lg:text-7xl">
            Sweet moments, <br className="hidden lg:block" />
            <span className="italic text-chocolate/80">baked to perfection.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 max-w-lg text-lg leading-relaxed text-chocolate/70">
            Luu Tasty Treats began as a small kitchen dream. Today, we still bake the exact same way: made to order, by hand, for the celebrations that matter most to you.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link 
              href="/cakes" 
              className="group flex items-center gap-2 rounded-full bg-chocolate px-8 py-4 font-medium tracking-wide text-[#FDFBF7] shadow-lg transition-all hover:bg-chocolate-light hover:shadow-xl"
            >
              Explore the Boutique
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/about" 
              className="rounded-full px-8 py-4 font-medium tracking-wide text-chocolate transition-colors hover:bg-chocolate/5"
            >
              Meet the Baker
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visual / Image Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md lg:max-w-lg"
        >
          {/* Aesthetic Image Container using your local public file */}
          <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-vanilla/50 shadow-2xl">
            <img 
              src="/cake.png" 
              alt="Signature handcrafted cake by Luu Tasty Treats" 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          {/* Decorative Badge */}
          <div className="absolute -bottom-6 -left-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-[#FDFBF7] bg-berry-dark text-[#FDFBF7] shadow-xl">
            <Star className="mb-1 h-5 w-5 fill-current" />
            <span className="font-serif text-sm font-bold">100%</span>
            <span className="text-[10px] uppercase tracking-wider">Custom</span>
          </div>
        </motion.div>
      </section>

      {/* Featured Creations Teaser */}
      <section className="mt-12 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-chocolate sm:text-4xl">Featured Creations</h2>
              <p className="mt-2 text-chocolate/60">A glimpse of what's leaving our kitchen this week.</p>
            </div>
            <Link href="/cakes" className="text-sm font-semibold tracking-wide text-berry hover:text-berry-dark">
              View all cakes &rarr;
            </Link>
          </div>
          
          <div className="mt-12">
            {/* Display case component renders here */}
          </div>
        </div>
      </section>
    </div>
  );
}
