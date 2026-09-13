"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";

const words = ["Sweet", "moments,", "baked", "to", "perfection."];

export default function LandingPage() {
  const [featured, setFeatured] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCakes({ featuredOnly: true }).then(setFeatured).catch(() => setFeatured([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden bg-cream">
      <section className="relative mx-auto max-w-6xl px-6 pb-32 pt-24 text-center">
        <motion.div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-berry/30 blur-3xl" animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-vanilla/60 blur-3xl" animate={{ y: [0, -24, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="relative z-10 mx-auto mb-8 h-40 w-40" animate={{ y: [0, -14, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <CakeGraphic />
        </motion.div>
        <h1 className="relative z-10 flex flex-wrap justify-center gap-x-3 font-serif text-5xl font-semibold tracking-tight text-chocolate sm:text-6xl">
          {words.map((word, i) => (
            <motion.span key={word} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}>{word}</motion.span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="relative z-10 mx-auto mt-6 max-w-xl text-chocolate/60">
          Handcrafted cakes, customized exactly the way you imagine them — every layer, flavor, and finish chosen by you.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.5 }} className="relative z-10">
          <Link href="/cakes" className="mt-10 inline-block rounded-full bg-chocolate px-9 py-4 font-medium text-cream shadow-soft transition hover:scale-105 hover:bg-chocolate-light active:scale-95">Explore the Boutique</Link>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <h2 className="mb-8 font-serif text-3xl font-semibold text-chocolate">Featured Creations</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 animate-pulse rounded-4xl bg-vanilla/50" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((cake, i) => (
              <motion.div key={cake.cakeId} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <FeaturedCakeCard cake={cake} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FeaturedCakeCard({ cake }: { cake: CakeSummary }) {
  return (
    <Link href={`/cakes/${cake.cakeId}`} className="group block overflow-hidden rounded-4xl border border-chocolate/5 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-64 w-full overflow-hidden bg-vanilla/40">
        <Image src={cake.baseImageUrl} alt={cake.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-lg font-medium text-chocolate">{cake.name}</h3>
        <p className="mt-1 text-sm text-chocolate/50 line-clamp-2">{cake.description}</p>
        <p className="mt-3 font-semibold text-berry-dark">From R{cake.basePrice.toFixed(2)}</p>
      </div>
    </Link>
  );
}

function CakeGraphic() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-xl">
      <ellipse cx="100" cy="175" rx="70" ry="10" fill="#4A2F23" opacity="0.08" />
      <rect x="45" y="120" width="110" height="45" rx="10" fill="#E8A0BF" />
      <rect x="55" y="90" width="90" height="40" rx="10" fill="#F5E6C8" />
      <rect x="65" y="60" width="70" height="35" rx="10" fill="#FBF6EF" stroke="#E8A0BF" strokeWidth="2" />
      <rect x="97" y="30" width="6" height="30" rx="3" fill="#C97B9C" />
      <ellipse cx="100" cy="28" rx="6" ry="9" fill="#F5C97A" />
    </svg>
  );
}
