"use client";

import { useEffect, useState } from "react";
import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCakes().then(setCakes).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-chocolate">The Display Case</h1>
        <p className="mt-2 text-chocolate/50">Every cake, made to order.</p>
      </motion.div>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-4xl bg-vanilla/50" />
          ))}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cakes.map((cake) => (
            <motion.div key={cake.cakeId} variants={item}>
              <Link
                href={`/cakes/${cake.cakeId}`}
                className="group block overflow-hidden rounded-4xl border border-chocolate/5 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-64 w-full overflow-hidden bg-vanilla/40">
                  <Image
                    src={cake.baseImageUrl}
                    alt={cake.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-medium text-chocolate">{cake.name}</h3>
                  <p className="mt-1 text-sm text-chocolate/50 line-clamp-2">{cake.description}</p>
                  <p className="mt-3 font-semibold text-berry-dark">From R{cake.basePrice.toFixed(2)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}