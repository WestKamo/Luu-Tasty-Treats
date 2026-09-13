"use client";
import { useEffect, useState } from "react";
import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import Link from "next/link";
import Image from "next/image";

export default function CakesPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getCakes().then(setCakes).finally(() => setLoading(false));
  }, []);
  
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold">Our Cakes</h1>
      {loading ? (
        <p className="text-neutral-400">Loading cakes...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cakes.map((cake) => (
            <Link key={cake.cakeId} href={`/cakes/${cake.cakeId}`} className="group overflow-hidden rounded-2xl border border-neutral-200 transition hover:shadow-lg">
              <div className="relative h-56 w-full bg-neutral-100">
                <Image src={cake.baseImageUrl || "/placeholder.png"} alt={cake.name} fill className="object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="font-medium">{cake.name}</h3>
                <p className="mt-2 font-semibold">From R{cake.basePrice.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
