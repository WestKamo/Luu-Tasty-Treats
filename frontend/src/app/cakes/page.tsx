"use client";

import { useEffect, useState } from "react";

import { CakeCard } from "@/components/customer/CakeCard";
import { getCakes } from "@/lib/api/catalog";
import type { CakeSummary } from "@/types/catalog";

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getCakes()
      .then((data) => {
        if (mounted) setCakes(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-chocolate/15 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-berry-dark">Handmade to celebrate</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-chocolate sm:text-5xl">The cake collection</h1>
          <p className="mt-2 text-sm text-chocolate/60 sm:text-base">Pick your favourite. Choose the details. We&apos;ll bake it just for you.</p>
        </div>
        {!loading && !error && cakes.length > 0 && (
          <p className="text-xs font-medium text-chocolate/50">{cakes.length} designs to explore</p>
        )}
      </div>

      {loading && (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading cakes">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-vanilla/50 sm:h-96" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-8 rounded-3xl border border-chocolate/10 bg-white p-8 text-center">
          <p className="text-chocolate/70">The cakes couldn&apos;t be loaded right now.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-chocolate px-6 py-3 text-sm font-medium text-cream">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && cakes.length === 0 && (
        <div className="mt-8 rounded-3xl border border-chocolate/10 bg-white p-10 text-center text-chocolate/70">
          Our collection is being prepared. Visit again soon.
        </div>
      )}

      {!loading && !error && cakes.length > 0 && (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {cakes.map((cake) => (
            <CakeCard key={cake.cakeId} cake={cake} />
          ))}
        </div>
      )}
    </div>
  );
}
