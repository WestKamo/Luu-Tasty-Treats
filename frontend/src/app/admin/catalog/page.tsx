"use client";

import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { CreateCakeModal } from "@/components/admin/CreateCakeModal";
import { getAdminCakes, updateCake, uploadCakeImage, deleteCake, deleteCakeImage } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cakeEditSchema, CakeEditFormValues } from "@/lib/validation/schemas";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AdminCatalogPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function refresh() { getAdminCakes().then(setCakes); }
  useEffect(() => { refresh(); }, []);
  const selected = cakes.find((c) => c.cakeId === selectedId) ?? null;

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold text-chocolate">Catalog</h1>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowCreateModal(true)} className="rounded-full bg-chocolate px-5 py-2.5 text-sm font-medium text-cream shadow-soft transition hover:bg-chocolate-light">
            + New Cake
          </motion.button>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1 max-h-[70vh] overflow-y-auto pr-2">
            {cakes.map((cake) => (
              <button key={cake.cakeId} onClick={() => setSelectedId(cake.cakeId)} className={`block w-full rounded-2xl border px-4 py-4 text-left transition ${selectedId === cake.cakeId ? "border-chocolate bg-white shadow-soft" : "border-chocolate/10 bg-white/50 hover:border-berry"}`}>
                <div className="font-medium text-chocolate">{cake.name}</div>
                <div className="text-xs text-chocolate/50 mt-1">R{cake.basePrice.toFixed(2)} • {cake.isActive ? "Visible" : "Hidden"}</div>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2">
            {selected ? <CakeEditPanel key={selected.cakeId} cake={selected} onUpdate={refresh} onDelete={() => { refresh(); setSelectedId(null); }} /> : <div className="flex h-64 items-center justify-center rounded-4xl border-2 border-dashed border-chocolate/10 text-chocolate/40">Select a cake to edit.</div>}
          </div>
        </div>
      </div>
      {showCreateModal && <CreateCakeModal onClose={() => setShowCreateModal(false)} onCreated={refresh} />}
    </RequireAdmin>
  );
}

function CakeEditPanel({ cake, onUpdate, onDelete }: { cake: CakeSummary, onUpdate: () => void, onDelete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CakeEditFormValues>({ resolver: zodResolver(cakeEditSchema), defaultValues: { name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: cake.isActive } });

  async function onSubmit(values: CakeEditFormValues) {
    try {
      await updateCake(cake.cakeId, { name: values.name, description: values.description || null, basePrice: values.basePrice, isActive: values.isActive, categoryId: null });
      toast.success("Cake updated");
      onUpdate();
    } catch { toast.error("Update failed"); }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) { await uploadCakeImage(cake.cakeId, files[i], i + 1); }
      toast.success("Images uploaded");
      onUpdate();
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  }

  async function handleRemoveImage(imageUrl: string) {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteCakeImage(cake.cakeId, imageUrl);
      toast.success("Image removed");
      onUpdate();
    } catch { toast.error("Could not remove image"); }
  }

  async function handleDeleteCake() {
    if (!window.confirm("Are you sure you want to permanently delete this entire cake?")) return;
    try {
      await deleteCake(cake.cakeId);
      toast.success("Cake deleted");
      onDelete();
    } catch { toast.error("Cannot delete a cake that has past orders. Hide it instead."); }
  }

  return (
    <div className="space-y-8 rounded-4xl bg-white p-8 shadow-soft">
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium text-chocolate">Image Gallery</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          {cake.images?.map((img, idx) => (
            <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-xl border border-chocolate/10 group">
              <Image src={img} alt="Cake" fill sizes="96px" className="object-cover" />
              <button type="button" onClick={() => handleRemoveImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 transition-opacity group-hover:opacity-100 shadow-md">✕</button>
            </div>
          ))}
        </div>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={onFileSelected} disabled={uploading} className="file:mr-4 file:rounded-full file:border-0 file:bg-chocolate/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-chocolate hover:file:bg-chocolate/20" />
        {uploading && <p className="mt-2 text-xs text-chocolate/40 animate-pulse">Uploading...</p>}
      </div>

      <hr className="border-chocolate/10" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Name</label>
          <input {...register("name")} className="w-full rounded-2xl border border-chocolate/15 px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Description</label>
          <textarea {...register("description")} rows={3} className="w-full rounded-2xl border border-chocolate/15 px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Base price (R)</label>
          <input type="number" step="0.01" {...register("basePrice")} className="w-full rounded-2xl border border-chocolate/15 px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
        </div>
        <label className="flex items-center gap-3 text-sm text-chocolate bg-cream/50 p-4 rounded-2xl border border-chocolate/10 cursor-pointer">
          <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-berry focus:ring-berry rounded" />
          <div>
            <div className="font-semibold">Active Status</div>
            <div className="text-chocolate/60">Uncheck to hide this cake from the customer menu.</div>
          </div>
        </label>
        
        <div className="pt-6 flex justify-between items-center border-t border-chocolate/10">
          <button type="button" onClick={handleDeleteCake} className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline">
            Delete Entire Cake
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-chocolate px-8 py-3 text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50 font-medium">
            {isSubmitting ? "Saving..." : "Save details"}
          </button>
        </div>
      </form>
    </div>
  );
}
