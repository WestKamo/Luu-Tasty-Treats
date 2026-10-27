"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Facebook, Github, MessageCircle, MoveDownRight } from "lucide-react";
import { contactLinks } from "@/lib/contact";

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};

export default function Home() {
  return (
    <div className="overflow-hidden bg-cream">
      <section className="relative isolate border-b border-chocolate/10">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-[58%] bg-[radial-gradient(ellipse_at_70%_30%,rgba(184,155,115,0.17),transparent_64%)]" />
        <div className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20 lg:py-28">
          <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.13 }}>
            <motion.p variants={reveal} className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-berry-dark">
              <span className="h-px w-10 bg-berry-dark/60" /> Luu Tasty Treats · A cake atelier
            </motion.p>
            <motion.h1 variants={reveal} className="max-w-[47rem] font-serif text-[clamp(3.3rem,8vw,7rem)] font-medium leading-[0.99] tracking-[-0.055em] text-chocolate">
              Made for the <span className="italic text-berry-dark">moments</span> that stay.
            </motion.h1>
            <motion.p variants={reveal} className="mt-8 max-w-xl text-base leading-8 text-chocolate/65 sm:text-lg">
              Thoughtfully designed cakes, made to order. Each detail, from the first sketch to the last flourish, is a little piece of your story.
            </motion.p>
            <motion.div variants={reveal} className="mt-9 flex flex-wrap gap-3">
              <Link href="/cakes" className="group inline-flex items-center justify-center gap-3 rounded-full bg-chocolate px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-chocolate-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry-dark">
                Explore the Boutique <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link href="/owner" className="inline-flex items-center justify-center gap-2 rounded-full border border-chocolate/20 px-7 py-3.5 text-sm font-medium text-chocolate transition hover:border-chocolate/50 hover:bg-white/60">
                Meet the baker <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.25 }}
            className="relative mx-auto w-full max-w-sm border-l border-chocolate/15 py-9 pl-8 sm:pl-12 lg:max-w-none">
            <p className="font-serif text-5xl font-light italic text-gold">“</p>
            <p className="mt-1 font-serif text-[clamp(1.8rem,3.8vw,3rem)] leading-[1.22] tracking-tight text-chocolate">
              More than a cake. A beautiful reason to gather.
            </p>
            <div className="mt-10 flex items-center justify-between border-t border-chocolate/15 pt-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-chocolate/50">From our kitchen, with love</span>
              <MoveDownRight className="h-5 w-5 text-berry-dark" aria-hidden="true" />
            </div>
          </motion.aside>
        </div>
      </section>

      <section className="bg-[#F4EEE6] px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-berry-dark">Made personal</p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-[1.15] tracking-tight text-chocolate sm:text-5xl">
              Your vision, beautifully considered.
            </h2>
          </div>
          <div className="grid gap-6 border-t border-chocolate/15 pt-7 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {[
              ["01", "Find a design", "Explore the boutique and choose a starting point."],
              ["02", "Make it yours", "Select details, colours and a message of your own."],
              ["03", "Celebrate", "A cake created for the people who matter."],
            ].map(([number, title, description]) => (
              <div key={number} className="space-y-3">
                <p className="font-serif text-2xl italic text-berry-dark">{number}</p>
                <h3 className="font-semibold text-chocolate">{title}</h3>
                <p className="text-sm leading-6 text-chocolate/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col justify-between gap-5 border-b border-chocolate/15 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-berry-dark">A little conversation</p>
            <h2 className="mt-4 font-serif text-4xl tracking-tight text-chocolate sm:text-5xl">Tell us what you&apos;re dreaming of.</h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-chocolate/60">Have a colour, an occasion or just an idea? We would love to hear it.</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <a href={contactLinks.whatsapp} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-chocolate/10 bg-white/70 p-5 transition hover:border-chocolate/30 hover:bg-white">
            <span className="flex items-center gap-3 font-medium text-chocolate"><MessageCircle className="h-5 w-5 text-berry-dark" /> WhatsApp</span>
            <ArrowUpRight className="h-4 w-4 text-chocolate/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a href={contactLinks.facebook} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-chocolate/10 bg-white/70 p-5 transition hover:border-chocolate/30 hover:bg-white">
            <span className="flex items-center gap-3 font-medium text-chocolate"><Facebook className="h-5 w-5 text-berry-dark" /> Find on Facebook</span>
            <ArrowUpRight className="h-4 w-4 text-chocolate/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a href={contactLinks.github} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-chocolate/10 bg-white/70 p-5 transition hover:border-chocolate/30 hover:bg-white">
            <span className="flex items-center gap-3 font-medium text-chocolate"><Github className="h-5 w-5 text-berry-dark" /> Crafted on GitHub</span>
            <ArrowUpRight className="h-4 w-4 text-chocolate/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
