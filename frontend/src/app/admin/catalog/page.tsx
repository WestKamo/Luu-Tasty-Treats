"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, ImageOff } from "lucide-react";
import toast from "react-hot-toast";

import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { CreateCakeModal } from "@/components/admin/CreateCakeModal";
import { EditCakeDrawer } from "@/components/admin/EditCakeDrawer";
import { getCakes } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";

export default function AdminCatalogPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCake, setEditingCake] = useState<CakeSummary | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getCakes().then(setCakes).catch(() => toast.error("Could not load the catalog.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <AdminShell>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-chocolate">Catalog</h1>
              <p className="mt-1 text-sm text-chocolate/50">Manage cakes, prices, and photos</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-full bg-chocolate px-5 py-2.5 text-sm font-medium text-cream shadow-soft transition hover:bg-chocolate-light"
            >
              <Plus className="h-4 w-4" /> New Cake
            </motion.button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-vanilla/40" />)}
            </div>
          ) : cakes.length === 0 ? (
            <p className="text-chocolate/40">No cakes yet — create your first one.</p>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {cakes.map((cake) => (
                  <motion.button
                    key={cake.cakeId}
                    layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    onClick={() => setEditingCake(cake)}
                    className="group overflow-hidden rounded-3xl border border-chocolate/8 bg-white text-left shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-32 w-full bg-vanilla/40">
                      {cake.baseImageUrl ? (
                        <img src={cake.baseImageUrl} alt={cake.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-chocolate/20"><ImageOff className="h-6 w-6" /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-chocolate">{cake.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-chocolate/50">R{cake.basePrice.toFixed(2)}</p>
                        <Pencil className="h-3.5 w-3.5 text-chocolate/30 transition group-hover:text-chocolate" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AdminShell>
      </div>

      {showCreateModal && <CreateCakeModal onClose={() => setShowCreateModal(false)} onCreated={refresh} />}
      {editingCake && <EditCakeDrawer cake={editingCake} onClose={() => setEditingCake(null)} onSaved={refresh} />}
    </RequireAdmin>
  );
}
