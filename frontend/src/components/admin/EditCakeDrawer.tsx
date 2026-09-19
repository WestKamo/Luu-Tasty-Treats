"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X, Trash2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { cakeEditSchema, CakeEditFormValues } from "@/lib/validation/schemas";
import { updateCake, uploadCakeImage, getCakeImages, deleteCakeImage, CakeImageDto } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";

export function EditCakeDrawer({ cake, onClose, onSaved }: { cake: CakeSummary; onClose: () => void; onSaved: () => void }) {
  const [images, setImages] = useState<CakeImageDto[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CakeEditFormValues>({
    resolver: zodResolver(cakeEditSchema),
    defaultValues: { name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: true },
  });

  useEffect(() => { getCakeImages(cake.cakeId).then(setImages).catch(() => {}); }, [cake.cakeId]);

  async function onSubmit(values: CakeEditFormValues) {
    try {
      await updateCake(cake.cakeId, { name: values.name, description: values.description || null, basePrice: values.basePrice, isActive: values.isActive, categoryId: null });
      toast.success("Cake updated");
      onSaved();
    } catch {
      toast.error("Update failed");
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const nextOrder = images.length + 1;
      const result = await uploadCakeImage(cake.cakeId, file, nextOrder);
      setImages((prev) => [...prev, { imageId: result.imageId, imageUrl: result.imageUrl, displayOrder: nextOrder }]);
      toast.success("Photo added");
      onSaved();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await deleteCakeImage(imageId);
      setImages((prev) => prev.filter((i) => i.imageId !== imageId));
      toast.success("Photo removed");
    } catch {
      toast.error("Could not remove photo");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-chocolate/40 backdrop-blur-sm">
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
        className="h-full w-full max-w-md overflow-y-auto bg-cream p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-chocolate">{cake.name}</h2>
          <button onClick={onClose} className="text-chocolate/40 hover:text-chocolate"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-chocolate/60">Name</label>
            <input {...register("name")} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-chocolate/60">Description</label>
            <textarea {...register("description")} rows={3} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-chocolate/60">Base price (R)</label>
            <input type="number" step="0.01" {...register("basePrice")} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
            {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-chocolate">
            <input type="checkbox" {...register("isActive")} /> Visible to customers
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-chocolate py-3 font-medium text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="mt-8 border-t border-chocolate/10 pt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-chocolate/60">Photos</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.imageId} className="group relative aspect-square overflow-hidden rounded-2xl border border-chocolate/10">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}${img.imageUrl}`} alt="" className="h-full w-full object-cover" />
                <button onClick={() => handleDeleteImage(img.imageId)} className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-chocolate/20 text-chocolate/40 transition hover:border-berry hover:text-berry-dark">
              <UploadCloud className="h-5 w-5" />
              <span className="text-[10px]">{uploading ? "..." : "Add"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
