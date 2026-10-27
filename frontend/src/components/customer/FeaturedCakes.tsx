"use client";

import { useEffect, useState } from "react";

import { CakeCard } from "@/components/customer/CakeCard";
import { getCakes } from "@/lib/api/catalog";
import type { CakeSummary } from "@/types/catalog";

export default function FeaturedCakes() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Request the full public list so non-featured active cakes fill empty slots.
    // The public API already sorts featured cakes first.
    getCakes()
      .then((items) => {
        if (!mounted) return;
        setCakes(items.slice(0, 4));
      })
      .catch(() => {
        if (mounted) setFailed(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (failed) {
    return <p className="mt-8 text-sm text-chocolate/50">Featured cakes are temporarily unavailable. Browse the full collection instead.</p>;
  }

  if (!loading && cakes.length === 0) {
    return <p className="mt-8 text-sm text-chocolate/50">New designs coming soon.</p>;
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {loading
        ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-vanilla/40 sm:h-96" />)
        : cakes.map((cake) => <CakeCard key={cake.cakeId} cake={cake} />)}
    </div>
  );
}
