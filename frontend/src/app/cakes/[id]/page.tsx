"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CakePhoto from "@/components/customer/CakePhoto";
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
    return sum + selectedIds.reduce((groupSum, optId) => {
      const opt = group.options.find((o) => o.optionId === optId);
      return groupSum + (opt?.priceModifier || 0);
    }, 0);
  }, 0);

  const optionsValid = cake.groups.every((group) => {
    const count = selections[group.groupId]?.length ?? 0;
    const min = group.isRequired ? Math.max(1, group.minSelections) : 0;
    return count >= min && count <= group.maxSelections && (group.selectionType !== "single" || count <= 1);
  });

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

    const compiledNotes = [
      customName ? `Name: ${customName.trim()}` : "",
      customAge ? `Age: ${customAge.trim()}` : "",
      colorTweaks ? `Colors: ${colorTweaks.trim()}` : "",
      extraNotes ? `Notes: ${extraNotes.trim()}` : "",
    ].filter(Boolean).join(" | ");

    if (Object.values(selections).every((ids) => ids.length === 0) && !compiledNotes) {
      toast.error("Please personalize this cake before adding it to your cart.");
      return;
    }

    if (cake.freeTextField?.maxLength && compiledNotes.length > cake.freeTextField.maxLength) {
      setValidationError(`Please shorten your personal message to ${cake.freeTextField.maxLength} characters.`);
      return;
    }

    if (compiledNotes.length > 200) {
      setValidationError("Please shorten your personalization details (200 characters maximum).");
      return;
    }

    const allSelectedOptionIds = Object.values(selections).flat();
    const selectedOptionsPreview = cake.groups.flatMap((group) =>
      group.options
        .filter((option) => selections[group.groupId]?.includes(option.optionId))
        .map((option) => ({
          optionId: option.optionId,
          label: `${group.name}: ${option.label}`,
          priceModifier: option.priceModifier,
        }))
    );

    addLine({
      lineId: crypto.randomUUID(),
      cakeId: cake.cakeId,
      cakeName: cake.name,
      quantity,
      unitPricePreview: currentPrice,
      customText: compiledNotes || undefined,
      selectedOptionIds: allSelectedOptionIds,
      selectedOptionsPreview,
    });

    toast.success("Added to cart!", { icon: "🍰" });
    router.push("/cart");
  }

  function toggleOption(groupId: string, optionId: string, type: "single" | "multi", max: number) {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (type === "single") return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId)) return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      if (current.length >= max) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  const displayImages = cake.images?.length ? cake.images : [cake.baseImageUrl];
  const hasPersonalization = Object.values(selections).some((ids) => ids.length > 0) || [customName, customAge, colorTweaks, extraNotes].some((value) => value.trim().length > 0);
  const textRequired = cake.freeTextField?.isRequired ?? false;
  const hasCustomText = [customName, customAge, colorTweaks, extraNotes].some((value) => value.trim().length > 0);
  const canAddToCart = optionsValid && hasPersonalization && (!textRequired || hasCustomText);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
        <div className="relative h-fit lg:sticky lg:top-24">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[32rem] w-full overflow-hidden rounded-4xl bg-vanilla/40 shadow-soft">
            <CakePhoto src={displayImages[activeImage]} alt={cake.name} className="h-full w-full" eager />
          </motion.div>
          {displayImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${activeImage === idx ? "border-berry opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <CakePhoto src={img} alt={`${cake.name} photo ${idx + 1}`} className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-4xl font-semibold text-chocolate">{cake.name}</h1>
          <p className="mt-3 leading-relaxed text-chocolate/60">{cake.description}</p>

          <div className="mt-10 space-y-8">
            {cake.groups.map((group) => (
              <div key={group.groupId}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-medium text-chocolate">
                    {group.name} {group.isRequired && <span className="ml-1 text-berry-dark">*</span>}
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-chocolate/40">
                    {group.selectionType === "single" ? "Choose 1" : `Choose up to ${group.maxSelections}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.options.map((option) => {
                    const selected = selections[group.groupId]?.includes(option.optionId);
                    return (
                      <motion.button
                        key={option.optionId}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleOption(group.groupId, option.optionId, group.selectionType, group.maxSelections)}
                        className={`rounded-full border px-4 py-2 text-sm transition-all ${selected ? "border-berry bg-berry/15 text-chocolate shadow-sm" : "border-chocolate/15 bg-white text-chocolate/70 hover:border-chocolate/30"}`}
                      >
                        {option.label} {option.priceModifier > 0 && <span className="ml-1 opacity-70">(+R{option.priceModifier.toFixed(2)})</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="rounded-4xl border border-chocolate/10 bg-white/50 p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-medium text-chocolate">
                <svg className="h-5 w-5 text-berry-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 19l-4 1 1-4L16.732 3.732a2 2 0 112.828 2.828L9 19z" /></svg>
                Personalize this Design
              </h3>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-chocolate/80">Name on Cake</label>
                  <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Phindile" className="w-full rounded-2xl border border-chocolate/15 bg-white px-3 py-2.5 text-sm text-chocolate placeholder:text-chocolate/30 focus:border-berry" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-chocolate/80">Age / Number</label>
                  <input type="text" value={customAge} onChange={(e) => { setCustomAge(e.target.value); validateCustomization(); }} placeholder="e.g. 25" className="w-full rounded-2xl border border-chocolate/15 bg-white px-3 py-2.5 text-sm text-chocolate placeholder:text-chocolate/30 focus:border-berry" />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-chocolate/80">Color Tweaks</label>
                <input type="text" value={colorTweaks} onChange={(e) => setColorTweaks(e.target.value)} placeholder="e.g. Change pink frosting to baby blue" className="w-full rounded-2xl border border-chocolate/15 bg-white px-3 py-2.5 text-sm text-chocolate placeholder:text-chocolate/30 focus:border-berry" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-chocolate/80">Extra Details (Optional)</label>
                <textarea rows={2} value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} placeholder="Tiers, flavors, allergies..." className="w-full rounded-2xl border border-chocolate/15 bg-white px-3 py-2.5 text-sm text-chocolate placeholder:text-chocolate/30 focus:border-berry" />
              </div>

              <AnimatePresence>
                {validationError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 text-sm font-medium text-red-500">
                    {validationError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-chocolate/10 pt-6">
              <label className="font-medium text-chocolate">Quantity</label>
              <div className="flex items-center gap-4 rounded-full border border-chocolate/15 bg-white px-4 py-1.5 shadow-sm">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="pb-1 text-xl text-chocolate/60 hover:text-chocolate">-</button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="pb-1 text-xl text-chocolate/60 hover:text-chocolate">+</button>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div key={currentPrice} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-end justify-between">
                <span className="font-medium text-chocolate/60">Total Price</span>
                <span className="font-serif text-3xl font-semibold text-chocolate">R{(currentPrice * quantity).toFixed(2)}</span>
              </motion.div>
            </AnimatePresence>
            <motion.button
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              whileHover={canAddToCart ? { scale: 1.02 } : {}}
              whileTap={canAddToCart ? { scale: 0.97 } : {}}
              className={`w-full rounded-full py-4.5 font-semibold tracking-wide transition-all duration-300 ${canAddToCart ? "bg-chocolate text-cream shadow-soft hover:bg-chocolate-light hover:shadow-xl" : "cursor-not-allowed bg-chocolate/10 text-chocolate/40"}`}
            >
              {canAddToCart ? "Add personalized cake to cart" : optionsValid ? "Personalize to add to cart" : "Complete required options"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
