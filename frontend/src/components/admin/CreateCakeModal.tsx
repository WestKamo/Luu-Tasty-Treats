"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createCakeSchema, CreateCakeFormValues } from "@/lib/validation/schemas";
import { createCake, uploadCakeImage } from "@/lib/api/catalog";

interface Props { onClose: () => void; onCreated: () => void; }

export function CreateCakeModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [newCakeId, setNewCakeId] = useState<string | null>(null);
  const [newCakeName, setNewCakeName] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCakeFormValues>({ resolver: zodResolver(createCakeSchema) });

  async function onSubmitStep1(values: CreateCakeFormValues) {
    setCreating(true);
    try {
      const result = await createCake({ name: values.name, description: values.description || null, basePrice: values.basePrice, categoryId: null });
      setNewCakeId(result.cakeId);
      setNewCakeName(result.name);
      toast.success("Cake saved — now add a photo");
      setStep(2);
    } catch {
      toast.error("Could not save cake. Check the form and try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleFile(file: File) {
    if (!newCakeId) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);
    try {
      await uploadCakeImage(newCakeId, file, 1, setProgress);
      toast.success(`${newCakeName} is now live!`);
      onCreated();
      setTimeout(onClose, 700);
    } catch {
      toast.error("Image upload failed. You can retry from the catalog list.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-4xl bg-cream p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-chocolate">{step === 1 ? "New Cake" : "Add a Photo"}</h2>
          <button onClick={onClose} className="text-chocolate/40 hover:text-chocolate">✕</button>
        </div>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} onSubmit={handleSubmit(onSubmitStep1)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-chocolate">Name</label>
                <input {...register("name")} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-chocolate">Description</label>
                <textarea {...register("description")} rows={3} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-chocolate">Base price (R)</label>
                <input type="number" step="0.01" {...register("basePrice")} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
                {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>}
              </div>
              <motion.button type="submit" disabled={creating} whileTap={{ scale: 0.97 }} className="w-full rounded-full bg-chocolate py-3 font-medium text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50">
                {creating ? "Saving..." : "Save & Continue"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }} onClick={() => fileInputRef.current?.click()} className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-4xl border-2 border-dashed transition-all ${isDragging ? "border-berry bg-berry/10" : "border-chocolate/20 bg-white"}`}>
                {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full rounded-4xl object-cover" /> : <><p className="font-medium text-chocolate/60">Drag & drop an image</p><p className="mt-1 text-xs text-chocolate/40">or click to browse</p></>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
              {uploading && (
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-chocolate/10"><motion.div className="h-full bg-berry" animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} /></div>
                  <p className="mt-1 text-center text-xs text-chocolate/40">Uploading... {progress}%</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
