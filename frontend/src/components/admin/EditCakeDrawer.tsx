"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X, Trash2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { cakeEditSchema, CakeEditFormValues } from "@/lib/validation/schemas";
import { updateCake, uploadCakeImage, getCakeImages, deleteCakeImage, CakeImageDto, describeCakeApiError } from "@/lib/api/catalog";
import { resolveCakeImageUrl } from "@/lib/images";
import { CakeSummary } from "@/types/catalog";

export function EditCakeDrawer({ cake, onClose, onSaved }: { cake: CakeSummary; onClose: () => void; onSaved: () => void }) {
  const [images, setImages] = useState<CakeImageDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CakeEditFormValues>({
    resolver: zodResolver(cakeEditSchema),
    defaultValues: { name: cake.name, description: cake.description ?? "", basePrice: cake.basePrice, isActive: cake.isActive },
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

  async function handleFiles(fileList: File[] | FileList) {
    if (uploading) return;
    const files = Array.from(fileList);
    if (!files.length) return;
    if (files.some((f) => !["image/jpeg","image/png","image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024)) {
      toast.error("Use JPG, PNG or WebP images up to 5 MB each.");
      return;
    }
    setFailedFiles(files);
    setUploadError(null);
    setUploading(true);
    let completed = 0;
    try {
      let nextOrder = images.length ? Math.max(...images.map((img) => img.displayOrder)) + 1 : 1;
      for (const file of files) {
        setUploadStatus(`Uploading photo ${completed + 1} of ${files.length}`);
        await uploadCakeImage(cake.cakeId, file, nextOrder++);
        completed += 1;
        setImages(await getCakeImages(cake.cakeId));
        onSaved();
      }
      setFailedFiles([]);
      toast.success(`${completed} photo${completed === 1 ? "" : "s"} added`);
    } catch (error) {
      setFailedFiles(files.slice(completed));
      const message = describeCakeApiError(error, "upload");
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await deleteCakeImage(imageId);
      setImages((prev) => prev.filter((i) => i.imageId !== imageId));
      toast.success("Photo removed");
      onSaved();
    } catch (error) {
      toast.error(describeCakeApiError(error, "delete"));
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
                <img src={resolveCakeImageUrl(img.imageUrl) || "/cake.png"} alt="" className="h-full w-full object-cover" />
                <button onClick={() => handleDeleteImage(img.imageId)} type="button" aria-label="Delete this cake photograph" className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-chocolate/20 text-chocolate/40 transition hover:border-berry hover:text-berry-dark">
              <UploadCloud className="h-5 w-5" />
              <span className="text-[10px]">{uploading ? "..." : "Add photos"}</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading}
                onChange={(e) => { if (e.target.files?.length) void handleFiles(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          {uploadStatus && <p aria-live="polite" className="mt-3 text-sm text-chocolate/60">{uploadStatus}</p>}
          <p className="mt-3 text-xs text-chocolate/50">Add a single photograph or choose several together.</p>
          {uploadError && <p role="alert" className="mt-3 text-sm text-red-600">{uploadError}</p>}
          {failedFiles.length > 0 && !uploading && uploadError && (
            <button type="button" onClick={() => void handleFiles(failedFiles)} className="mt-3 rounded-full bg-chocolate px-4 py-2 text-sm font-semibold text-cream">Retry photo upload</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
