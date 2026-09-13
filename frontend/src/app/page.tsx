"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import Image from "next/image";

export default function LandingPage() {
  const [featured, setFeatured] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCakes({ featuredOnly: true })
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-semibold tracking-tight"
        >
          Custom cakes, made your way.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-neutral-500"
        >
          Choose a base, pick your size and flavor, and add a personal message —
          every cake, built exactly the way you want it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/cakes"
            className="mt-8 inline-block rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700"
          >
            Browse cakes
          </Link>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-6 text-2xl font-semibold">Featured</h2>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((cake, i) => (
              <motion.div
                key={cake.cakeId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CakeCard cake={cake} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CakeCard({ cake }: { cake: CakeSummary }) {
  return (
    <Link
      href={`/cakes/${cake.cakeId}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 transition hover:shadow-lg"
    >
      <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
        <Image
          src={cake.baseImageUrl}
          alt={cake.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium">{cake.name}</h3>
        <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{cake.description}</p>
        <p className="mt-2 font-semibold">From R{cake.basePrice.toFixed(2)}</p>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
      ))}
    </div>
  );
}
