"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { getCakes, getCakeCustomizationSchema } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import { useCartStore } from "@/store/cartStore";

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

function CakeCard({ cake }: { cake: CakeSummary }) {
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);
  const [state, setState] = useState<QuickAddState>("idle");

  async function handleQuickAdd(e: React.MouseEvent) {
    // The whole card is a <Link> — stop this click from navigating.
    e.preventDefault();
    e.stopPropagation();

    if (state !== "idle") return;
    setState("loading");

    try {
      const schema = await getCakeCustomizationSchema(cake.cakeId);

      const hasRequiredChoices =
        schema.groups.some((g) => g.isRequired && g.minSelections > 0) ||
        schema.freeTextField?.isRequired === true;

      // Required options can't be guessed from the grid. Adding a line without them
      // would pass here but get rejected by the backend at checkout, so send the
      // customer to the configurator instead.
      if (hasRequiredChoices) {
        setState("idle");
        toast("This cake needs a few choices first", { icon: "🎂" });
        router.push(`/cakes/${cake.cakeId}`);
        return;
      }

      addLine({
        lineId: crypto.randomUUID(),
        cakeId: cake.cakeId,
        quantity: 1,
        customText: undefined,
        selectedOptionIds: [],
        cakeName: cake.name,
        unitPricePreview: cake.basePrice,
        selectedOptionsPreview: [],
      });

      setState("added");
      toast.success(`${cake.name} added to your bag`);
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
      toast.error("Couldn't add that just now. Please try again.");
    }
  }

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

        <motion.button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${cake.name} to cart`}
          whileTap={{ scale: 0.9 }}
          className={`absolute bottom-4 right-4 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-soft transition-colors duration-300 ${
            state === "added"
              ? "bg-emerald-500 text-white"
              : "bg-chocolate text-cream hover:bg-berry-dark"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === "loading" && (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.span>
            )}
            {state === "added" && (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Added
              </motion.span>
            )}
            {state === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
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
            Personalize →
          </span>
        </div>
      </div>
    </Link>
  );
}