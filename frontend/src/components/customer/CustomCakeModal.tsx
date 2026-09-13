"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
}

export function CustomCakeModal({ onClose }: Props) {
  const [theme, setTheme] = useState("");
  const [tiers, setTiers] = useState("1");
  const [flavors, setFlavors] = useState("");
  const [details, setDetails] = useState("");

  const payload = `*🎂 New Custom Cake Request*\n\n*Theme/Occasion:* ${theme || "N/A"}\n*Number of Tiers:* ${tiers}\n*Preferred Flavors:* ${flavors || "N/A"}\n*Special Instructions:* ${details || "N/A"}\n\n_I have inspiration pictures ready to send!_`;

  function sendToWhatsApp() {
    window.open(`https://wa.me/27680740380?text=${encodeURIComponent(payload)}`, '_blank');
    onClose();
  }

  function sendToEmail() {
    window.location.href = `mailto:lulamanguxa@gmail.com?subject=Custom Cake Request&body=${encodeURIComponent(payload)}`;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-chocolate/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg rounded-4xl bg-cream p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-semibold text-chocolate">Build Your Own</h2>
          <button onClick={onClose} className="text-chocolate/40 hover:text-chocolate text-xl">✕</button>
        </div>
        
        <p className="mb-6 text-chocolate/60">Tell us your vision! Once you click send, your chat will open and you can attach your inspiration pictures there.</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-chocolate">Theme or Occasion</label>
            <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., 21st Birthday, Vintage Floral" className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-chocolate">Number of Tiers</label>
              <select value={tiers} onChange={e => setTiers(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20">
                <option value="1">1 Tier</option>
                <option value="2">2 Tiers</option>
                <option value="3">3 Tiers</option>
                <option value="4+">4+ Tiers</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-chocolate">Desired Flavors</label>
              <input value={flavors} onChange={e => setFlavors(e.target.value)} placeholder="e.g., Vanilla & Strawberry" className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-chocolate">Special Details</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Name on cake, age, color palette, allergies..." className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 outline-none focus:border-berry focus:ring-4 focus:ring-berry/20" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-chocolate/10 pt-6">
            <button onClick={sendToEmail} className="rounded-full border-2 border-chocolate py-3.5 font-semibold text-chocolate transition hover:bg-chocolate/5">
              Send via Email
            </button>
            <button onClick={sendToWhatsApp} className="rounded-full bg-[#25D366] py-3.5 font-semibold text-white shadow-soft transition hover:bg-[#1EBE5C] hover:shadow-xl">
              Send to WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
