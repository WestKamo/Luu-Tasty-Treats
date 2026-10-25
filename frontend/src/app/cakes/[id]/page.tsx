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
  const [quantity, setQuantity] = useState(1);
  
  // Customization State
  const [customName, setCustomName] = useState("");
  const [customAge, setCustomAge] = useState("");
  const [colorTweaks, setColorTweaks] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [validationError, setValidationError] = useState("");

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

  // Validation: Check if required option groups are filled
  const optionsValid = cake.groups.every(g => !g.isRequired || (selections[g.groupId]?.length >= g.minSelections));

  function validateCustomization() {
    if (customAge && isNaN(Number(customAge))) {
      setValidationError("Age must be a valid number.");
      return false;
    }
    setValidationError("");
    return true;
  }

  function handleAddToCart() {
    if (!optionsValid) {
      toast.error("Please complete all required options above.");
      return;
    }
    if (!validateCustomization()) return;

    // Compile the custom fields into a single string for the backend
    const compiledNotes = [
      customName ? `Name: ${customName.trim()}` : "",
      customAge ? `Age: ${customAge.trim()}` : "",
      colorTweaks ? `Colors: ${colorTweaks.trim()}` : "",
      extraNotes ? `Notes: ${extraNotes.trim()}` : ""
    ].filter(Boolean).join(" | ");

    const allSelectedOptionIds = Object.values(selections).flat();
    
    addLine({
      lineId: crypto.randomUUID(),
      cakeId: cake!.cakeId,
      cakeName: cake!.name,
      quantity,
      unitPricePreview: currentPrice,
      customText: compiledNotes || undefined,
      selectedOptionIds: allSelectedOptionIds
    });
    
    toast.success(`Added to cart!`, { icon: '🍰' });
    router.push("/cart");
  }

  function toggleOption(groupId: string, optionId: string, type: "single" | "multiple", max: number) {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (type === "single") return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  const displayImages = cake.images?.length ? cake.images : [cake.baseImageUrl];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
        
        {/* Left: Gallery */}
        <div className="relative lg:sticky lg:top-24 h-fit">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[32rem] w-full overflow-hidden rounded-4xl bg-vanilla/40 shadow-soft">
            <Image src={displayImages[activeImage] || "/placeholder.png"} alt={cake.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </motion.div>
          {displayImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${activeImage === idx ? "border-berry opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Configurator */}
        <div>
          <h1 className="font-serif text-4xl font-semibold text-chocolate">{cake.name}</h1>
          <p className="mt-3 text-chocolate/60 leading-relaxed">{cake.description}</p>

          <div className="mt-10 space-y-8">
            
            {/* Standard Options (Flavors, Sizes) */}
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

            {/* Customization Block */}
            <div className="rounded-4xl border border-chocolate/10 bg-white/50 p-6 shadow-sm">
              <h3 className="font-serif text-xl font-medium text-chocolate mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-berry-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Personalize this Design
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-chocolate/80">Name on Cake</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-chocolate/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Phindile" className="w-full rounded-2xl border border-chocolate/15 bg-white pl-9 pr-4 py-3 text-sm text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-chocolate/80">Age / Number</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-chocolate/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    <input type="text" value={customAge} onChange={(e) => { setCustomAge(e.target.value); validateCustomization(); }} placeholder="e.g. 25" className="w-full rounded-2xl border border-chocolate/15 bg-white pl-9 pr-4 py-3 text-sm text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-chocolate/80">Color Tweaks</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-chocolate/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  <input type="text" value={colorTweaks} onChange={(e) => setColorTweaks(e.target.value)} placeholder="e.g. Change pink frosting to baby blue" className="w-full rounded-2xl border border-chocolate/15 bg-white pl-9 pr-4 py-3 text-sm text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-chocolate/80">Extra Details (Optional)</label>
                <textarea rows={2} value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} placeholder="Tiers, specific flavor combinations, allergies..." className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-sm text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
              </div>
              
              <AnimatePresence>
                {validationError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm mt-3 font-medium">
                    {validationError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-chocolate/10 pt-6">
              <label className="font-medium text-chocolate">Quantity</label>
              <div className="flex items-center gap-4 bg-white border border-chocolate/15 rounded-full px-4 py-1.5 shadow-sm">
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
            <motion.button 
              disabled={!optionsValid} 
              onClick={handleAddToCart} 
              whileHover={optionsValid ? { scale: 1.02 } : {}} 
              whileTap={optionsValid ? { scale: 0.97 } : {}} 
              className={`w-full flex items-center justify-center gap-3 rounded-full py-4.5 font-semibold tracking-wide transition-all duration-300 ${optionsValid ? "bg-chocolate text-cream shadow-soft hover:bg-chocolate-light hover:shadow-xl" : "cursor-not-allowed bg-chocolate/10 text-chocolate/40"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {optionsValid ? "Add to Cart" : "Complete required options"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
