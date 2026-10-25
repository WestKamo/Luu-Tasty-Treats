"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api/client";

export function BuildYourOwnBanner() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [details, setDetails] = useState(""); const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await apiClient.post("/api/custom-inquiries", { customerName: name, customerEmail: email, details });
      toast.success("Inquiry sent! We'll be in touch.");
      setOpen(false); setName(""); setEmail(""); setDetails("");
    } catch { toast.error("Could not send inquiry."); } finally { setSubmitting(false); }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center justify-between gap-4 rounded-4xl bg-chocolate px-8 py-8 text-center text-cream shadow-soft md:flex-row md:text-left">
        <div>
          <h3 className="font-serif text-2xl font-semibold">Have something bigger in mind?</h3>
          <p className="mt-1 text-cream/70">Tell us about your dream cake — tiers, flavors, anything.</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-full bg-berry px-6 py-3 font-medium text-chocolate transition hover:bg-berry-dark hover:text-cream">Build Your Own</button>
      </motion.div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/40 p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-4xl bg-cream p-8">
            <h3 className="mb-4 font-serif text-xl font-semibold text-chocolate">Tell us your idea</h3>
            <div className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Tiers, flavors, occasion..." className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-chocolate/20 py-2.5 text-chocolate">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-full bg-chocolate py-2.5 text-cream disabled:opacity-50">{submitting ? "Sending..." : "Send"}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
