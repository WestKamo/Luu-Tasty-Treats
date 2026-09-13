"use client";

import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { CreateCakeModal } from "@/components/admin/CreateCakeModal";
import { getAdminCakes, updateCake, uploadCakeImage } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cakeEditSchema, CakeEditFormValues } from "@/lib/validation/schemas";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminCatalogPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function refresh() { getAdminCakes().then(setCakes); }
  useEffect(() => { refresh(); }, []);
  const selected = cakes.find((c) => c.cakeId === selectedId) ?? null;

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold text-chocolate">Catalog</h1>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowCreateModal(true)} className="rounded-full bg-chocolate px-5 py-2.5 text-sm font-medium text-cream shadow-soft transition hover:bg-chocolate-light">
            + New Cake
          </motion.button>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            {cakes.map((cake) => (
              <button key={cake.cakeId} onClick={() => setSelectedId(cake.cakeId)} className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedId === cake.cakeId ? "border-chocolate bg-white shadow-soft" : "border-chocolate/10 bg-white/50 hover:border-berry"}`}>
                {cake.name}
              </button>
            ))}
          </div>
          <div className="md:col-span-2">
            {selected ? <CakeEditPanel key={selected.cakeId} cake={selected} /> : <p className="text-chocolate/40">Select a cake to edit.</p>}
          </div>
        </div>
      </div>
      {showCreateModal && <CreateCakeModal onClose={() => setShowCreateModal(false)} onCreated={refresh} />}
    </RequireAdmin>
  );
}

function CakeEditPanel({ cake }: { cake: CakeSummary }) {
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CakeEditFormValues>({ resolver: zodResolver(cakeEditSchema), defaultValues: { name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: cake.isActive } });

  async function onSubmit(values: CakeEditFormValues) {
    try {
      await updateCake(cake.cakeId, { name: values.name, description: values.description || null, basePrice: values.basePrice, isActive: values.isActive, categoryId: null });
      toast.success("Cake updated");
    } catch { toast.error("Update failed"); }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) { await uploadCakeImage(cake.cakeId, files[i], i + 1); }
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  }

  return (
    <div className="space-y-8 rounded-4xl bg-white p-6 shadow-soft">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Name</label>
          <input {...register("name")} className="w-full rounded-2xl border border-chocolate/15 px-4 py-2.5 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Description</label>
          <textarea {...register("description")} rows={3} className="w-full rounded-2xl border border-chocolate/15 px-4 py-2.5 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-chocolate">Base price (R)</label>
          <input type="number" step="0.01" {...register("basePrice")} className="w-full rounded-2xl border border-chocolate/15 px-4 py-2.5 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-chocolate">
          <input type="checkbox" {...register("isActive")} /> Active (visible to customers)
        </label>
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-chocolate px-6 py-2.5 text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
      <div>
        <label className="mb-2 block text-sm font-medium text-chocolate">Replace image</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={onFileSelected} disabled={uploading} className="file:mr-4 file:rounded-full file:border-0 file:bg-chocolate/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-chocolate hover:file:bg-chocolate/20" />
        {uploading && <p className="mt-2 text-xs text-chocolate/40">Uploading...</p>}
      </div>
    </div>
  );
}
