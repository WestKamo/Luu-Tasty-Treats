"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { getAdminCakes, createCake, updateCake, uploadCakeImage, deleteCake } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cakeEditSchema, CakeEditFormValues } from "@/lib/validation/schemas";
import toast from "react-hot-toast";

export default function AdminCatalogPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadCakes = () => getAdminCakes().then(setCakes);
  useEffect(() => { loadCakes(); }, []);

  const emptyCake: CakeSummary = { cakeId: "new", name: "", description: "", basePrice: 0, baseImageUrl: "", isFeatured: false, categoryName: null, isActive: true };
  const selected = selectedId === "new" ? emptyCake : cakes.find((c) => c.cakeId === selectedId) ?? null;

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Menu Manager</h1>
          <Link href="/admin/dashboard" className="text-sm font-medium hover:underline">Back to Dashboard</Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1 bg-neutral-50 p-4 rounded-xl border border-neutral-200 h-fit">
            <button 
              onClick={() => setSelectedId("new")} 
              className="w-full mb-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition shadow-sm"
            >
              + Create New Cake
            </button>
            <h2 className="font-semibold mb-2 text-sm text-neutral-500 uppercase tracking-wider">Existing Menu</h2>
            {cakes.map((cake) => (
              <button
                key={cake.cakeId}
                onClick={() => setSelectedId(cake.cakeId)}
                className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  selectedId === cake.cakeId ? "border-black bg-black text-white shadow-md" : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
              >
                <div className="font-medium">{cake.name}</div>
                <div className={`text-xs mt-1 ${selectedId === cake.cakeId ? "text-neutral-300" : "text-neutral-500"}`}>
                  R{cake.basePrice.toFixed(2)} {cake.isActive ? "• Active" : "• Hidden"}
                </div>
              </button>
            ))}
          </div>
          <div className="md:col-span-2">
            {selected ? (
              <CakeEditPanel 
                key={selected.cakeId} 
                cake={selected} 
                onUpdate={() => { loadCakes(); if (selectedId === "new") setSelectedId(null); }} 
                onDelete={() => { loadCakes(); setSelectedId(null); }} 
              />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl p-12 text-neutral-400 text-center">
                Select a cake from the left to edit it,<br/> or click "Create New Cake" to add to your menu.
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}

function CakeEditPanel({ cake, onUpdate, onDelete }: { cake: CakeSummary, onUpdate: () => void, onDelete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const isNew = cake.cakeId === "new";
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CakeEditFormValues>({
    resolver: zodResolver(cakeEditSchema),
    defaultValues: { name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: cake.isActive },
  });

  useEffect(() => {
    reset({ name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: cake.isActive });
  }, [cake, reset]);

  async function onSubmit(values: CakeEditFormValues) {
    try {
      if (isNew) {
        await createCake({ name: values.name, description: values.description || null, basePrice: values.basePrice, isActive: values.isActive, categoryId: null });
        toast.success("New cake added to menu!");
      } else {
        await updateCake(cake.cakeId, { name: values.name, description: values.description || null, basePrice: values.basePrice, isActive: values.isActive, categoryId: null });
        toast.success("Cake updated successfully!");
      }
      onUpdate();
    } catch {
      toast.error("Failed to save cake.");
    }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadCakeImage(cake.cakeId, file, 1);
      toast.success("Image uploaded successfully!");
      onUpdate();
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this cake?")) return;
    try {
      await deleteCake(cake.cakeId);
      toast.success("Cake deleted!");
      onDelete();
    } catch (err: any) {
      toast.error(err.response?.data || "Could not delete cake.");
    }
  }

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-lg bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center text-3xl">
          {cake.baseImageUrl ? <img src={cake.baseImageUrl} alt={cake.name} className="w-full h-full object-cover" /> : "🎂"}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Display Image</label>
          {isNew ? (
             <p className="text-sm text-neutral-500 italic">Save the cake details first, then you can upload an image.</p>
          ) : (
             <>
               <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileSelected} disabled={uploading} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200" />
               {uploading && <p className="mt-2 text-xs text-blue-500 font-medium animate-pulse">Uploading to server...</p>}
             </>
          )}
        </div>
      </div>
      <hr className="border-neutral-100" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Cake Name</label>
          <input {...register("name")} className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:ring-black focus:border-black" placeholder="e.g., Triple Chocolate Fudge" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea {...register("description")} rows={3} className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:ring-black focus:border-black" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Base Price (ZAR)</label>
          <input type="number" step="0.01" {...register("basePrice")} className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:ring-black focus:border-black" />
          {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
        </div>
        <label className="flex items-center gap-3 text-sm p-4 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer">
          <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded text-black focus:ring-black" />
          <div>
            <div className="font-semibold">Active Status</div>
            <div className="text-neutral-500">Uncheck to hide this cake from the public menu.</div>
          </div>
        </label>
        
        <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
          {!isNew ? (
            <button type="button" onClick={handleDelete} className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline">
              Delete Cake
            </button>
          ) : <div></div>}
          
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-black px-8 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:bg-neutral-400 shadow-sm">
            {isSubmitting ? "Saving..." : isNew ? "Create Cake" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
