"use client";

import { useEffect, useState } from "react";

import CakeCard from "@/components/customer/CakeCard";
import { publicApiClient } from "@/lib/api/client";
import { CakeSummary } from "@/types/catalog";

export default function FeaturedCakes() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedCakes() {
      try {
        const featuredResponse = await publicApiClient.get<CakeSummary[]>("/api/v1/cakes", {
          params: { featuredOnly: true },
        });

        const featured = featuredResponse.data ?? [];
        if (!cancelled) {
          if (featured.length > 0) {
            setCakes(featured.slice(0, 4));
            return;
          }

          const fallbackResponse = await publicApiClient.get<CakeSummary[]>("/api/v1/cakes");
          if (!cancelled) setCakes((fallbackResponse.data ?? []).slice(0, 4));
        }
      } catch {
        if (!cancelled) setCakes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeaturedCakes();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-[28px] bg-vanilla/60" />
        ))}
      </div>
    );
  }

  if (cakes.length === 0) {
    return (
      <div className="mt-10 rounded-[28px] border border-dashed border-chocolate/20 bg-vanilla/30 p-8 text-center text-chocolate/70">
        Featured cakes will be available soon.
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {cakes.map((cake) => (
        <CakeCard key={cake.cakeId} cake={cake} />
      ))}
    </div>
  );
}
