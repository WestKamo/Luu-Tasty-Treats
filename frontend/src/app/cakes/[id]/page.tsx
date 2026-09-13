"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getCakeCustomizationSchema } from "@/lib/api/catalog";
import { CakeDetail } from "@/types/catalog";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

export default function CakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [cake, setCake] = useState<CakeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [customText, setCustomText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const addLine = useCartStore((s) => s.addLine);

  useEffect(() => {
    if (!id) return;
    getCakeCustomizationSchema(id)
      .then((data) => setCake(data))
      .catch(() => toast.error("Could not load cake details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-24 text-center text-chocolate/40 font-medium">Loading freshly baked details...</div>;
  if (!cake) return <div className="mx-auto max-w-4xl px-6 py-24 text-center font-serif text-2xl text-chocolate">Cake not found.</div>;

  const currentPrice = cake.basePrice + cake.groups.reduce((sum, group) => {
    const selectedIds = selections[group.groupId] || [];
    return sum + selectedIds.reduce((gSum, optId) => {
      const opt = group.options.find(o => o.optionId === optId);
      return gSum + (opt?.priceModifier || 0);
    }, 0);
  }, 0);

  const isValid = cake.groups.every(g => !g.isRequired || (selections[g.groupId]?.length >= g.minSelections)) &&
    (!cake.freeTextField?.isRequired || customText.trim().length > 0);

  function toggleOption(groupId: string, optionId: string, type: "single" | "multiple", max: number) {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (type === "single") return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  function handleAddToCart() {
    if (!isValid) return;
    const allSelectedOptionIds = Object.values(selections).flat();
    addLine({
      lineId: crypto.randomUUID(),
      cakeId: cake!.cakeId,
      cakeName: cake!.name,
      quantity,
      unitPricePreview: currentPrice,
      customText: customText.trim() || undefined,
      selectedOptionIds: allSelectedOptionIds
    });
    toast.success(`Added to cart!`, { icon: '🍰' });
    router.push("/cart");
  }

  const displayImages = cake.images?.length ? cake.images : [cake.baseImageUrl];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        
        {/* Gallery Section */}
        <div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[28rem] w-full overflow-hidden rounded-4xl bg-vanilla/40 shadow-soft">
            <Image 
              src={displayImages[activeImage] || "/placeholder.png"} 
              alt={cake.name} 
              fill 
              priority 
              sizes="(max-width: 768px) 100vw, 50vw" 
              className="object-cover" 
            />
          </motion.div>
          
          {displayImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${activeImage === idx ? "border-berry opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <Image src={img} alt={`Gallery thumbnail ${idx}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Configurator Section */}
        <div>
          <h1 className="font-serif text-4xl font-semibold text-chocolate">{cake.name}</h1>
          <p className="mt-3 text-chocolate/60 leading-relaxed">{cake.description}</p>

          <div className="mt-10 space-y-8">
            {cake.groups.map((group) => (
              <div key={group.groupId}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-medium text-chocolate">
                    {group.name} {group.isRequired && <span className="ml-1 text-berry-dark">*</span>}
                  </h3>
                  <span className="text-xs text-chocolate/40 tracking-wide uppercase">
                    {group.selectionType === "single" ? "Choose 1" : `Choose up to ${group.maxSelections}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.options.map((option) => {
                    const selected = selections[group.groupId]?.includes(option.optionId);
                    return (
                      <motion.button key={option.optionId} type="button" whileTap={{ scale: 0.94 }} onClick={() => toggleOption(group.groupId, option.optionId, group.selectionType, group.maxSelections)} className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${selected ? "border-chocolate bg-chocolate text-cream shadow-soft" : "border-chocolate/15 bg-white text-chocolate/80 hover:border-berry hover:text-chocolate"}`}>
                        {option.label} {option.priceModifier > 0 && <span className="opacity-70 ml-1">(+R{option.priceModifier.toFixed(2)})</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            {cake.freeTextField && (
              <div>
                <label className="mb-2 block font-medium text-chocolate">
                  {cake.freeTextField.label} {cake.freeTextField.isRequired && <span className="ml-1 text-berry-dark">*</span>}
                </label>
                <input type="text" maxLength={cake.freeTextField.maxLength} value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-5 py-3.5 text-chocolate outline-none transition focus:border-berry focus:ring-4 focus:ring-berry/20" placeholder="e.g. Happy 30th Birthday, Sam!" />
                <p className="mt-1.5 text-xs text-chocolate/40 text-right">{customText.length}/{cake.freeTextField.maxLength}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-chocolate/10 pt-6">
              <label className="font-medium text-chocolate">Quantity</label>
              <div className="flex items-center gap-4 bg-white border border-chocolate/15 rounded-full px-4 py-1.5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl text-chocolate/60 hover:text-chocolate pb-1">-</button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-xl text-chocolate/60 hover:text-chocolate pb-1">+</button>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentPrice} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
                <span className="text-chocolate/60 font-medium">Total Price</span>
                <span className="font-serif text-3xl font-semibold text-chocolate">R{(currentPrice * quantity).toFixed(2)}</span>
              </motion.div>
            </AnimatePresence>
            <motion.button disabled={!isValid} onClick={handleAddToCart} whileHover={isValid ? { scale: 1.02 } : {}} whileTap={isValid ? { scale: 0.97 } : {}} className={`w-full rounded-full py-4.5 font-semibold tracking-wide transition-all duration-300 ${isValid ? "bg-chocolate text-cream shadow-soft hover:bg-chocolate-light hover:shadow-xl" : "cursor-not-allowed bg-chocolate/10 text-chocolate/40"}`}>
              {isValid ? "Add to Cart" : "Complete required options"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
