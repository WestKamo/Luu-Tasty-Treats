"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";

type QuickAddState = "idle" | "loading" | "added";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCakes()
      .then(setCakes)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-chocolate">
          The Display Case
        </h1>
        <p className="mt-2 text-chocolate/50">Every cake, made to order.</p>
      </motion.div>

      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-4xl bg-vanilla/50" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-12 rounded-4xl border border-chocolate/10 bg-white p-10 text-center shadow-soft">
          <p className="text-chocolate/60">We couldn&apos;t load the display case right now.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full border border-chocolate/20 px-6 py-2 text-sm text-chocolate transition hover:bg-vanilla/50"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && cakes.length === 0 && (
        <div className="mt-12 rounded-4xl border border-dashed border-chocolate/15 p-14 text-center">
          <p className="font-serif text-xl text-chocolate/60">The case is being restocked.</p>
          <p className="mt-2 text-sm text-chocolate/40">
            New creations are on their way — check back shortly.
          </p>
        </div>
      )}

      {!loading && !error && cakes.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cakes.map((cake) => (
            <motion.div key={cake.cakeId} variants={item}>
              <CakeCard cake={cake} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Replace the CakeCard function in src/app/cakes/page.tsx with:

function CakeCard({ cake }: { cake: CakeSummary }) {
  return (
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

        {cake.isFeatured && (
          <span className="absolute left-4 top-4 rounded-full bg-berry px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-chocolate">
            Featured
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-chocolate text-cream shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:bg-berry-dark"
        >
          <Wand2 className="h-5 w-5" />
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-medium text-chocolate">{cake.name}</h3>
          {cake.categoryName && (
            <span className="shrink-0 rounded-full border border-chocolate/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-chocolate/40">
              {cake.categoryName}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-chocolate/50">{cake.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-chocolate/8 pt-4">
          <p className="font-semibold text-berry-dark">From R{cake.basePrice.toFixed(2)}</p>
          <span className="text-xs font-medium text-chocolate/40 transition group-hover:text-berry-dark">
            Personalize this design →
          </span>
        </div>
      </div>
    </Link>
  );
}
