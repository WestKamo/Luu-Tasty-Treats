import Link from "next/link";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

import CakePhoto from "@/components/customer/CakePhoto";
import type { CakeSummary } from "@/types/catalog";

export function CakeCard({ cake }: { cake: CakeSummary }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-chocolate/10 bg-white shadow-[0_8px_28px_rgba(74,47,35,0.07)] transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(74,47,35,0.14)] sm:rounded-[1.7rem]">
      <Link
        href={`/cakes/${cake.cakeId}`}
        aria-label={`Personalize ${cake.name}`}
        className="relative block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-berry-dark"
      >
        <CakePhoto src={cake.baseImageUrl} alt={cake.name} className="aspect-[4/5] w-full sm:aspect-[5/4]" eager={false} />
        {cake.isFeatured && (
          <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-chocolate sm:left-4 sm:top-4">Featured</span>
        )}
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-chocolate text-cream shadow-md transition-colors group-hover:bg-berry-dark" aria-hidden="true">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cream text-xs font-bold text-chocolate">+</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        {cake.categoryName && <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-berry-dark">{cake.categoryName}</p>}
        <h3 className="line-clamp-2 min-h-[2.6rem] font-serif text-base font-semibold leading-snug text-chocolate sm:min-h-0 sm:text-xl">{cake.name}</h3>
        {cake.description && <p className="mt-2 hidden line-clamp-2 text-sm leading-relaxed text-chocolate/60 sm:block">{cake.description}</p>}
        <div className="mt-auto pt-3 sm:pt-5">
          <p className="border-t border-chocolate/10 pt-3 text-base font-semibold tabular-nums text-chocolate sm:text-lg">From R{Number(cake.basePrice).toFixed(2)}</p>
          <Link
            href={`/cakes/${cake.cakeId}`}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-chocolate px-2 py-2.5 text-center text-xs font-semibold text-cream transition-colors hover:bg-chocolate-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry-dark sm:gap-2 sm:py-3 sm:text-sm"
            aria-label={`Personalize ${cake.name} before adding it to cart`}
          >
            <span>Personalize first</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
