"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, ImageOff, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { CreateCakeModal } from "@/components/admin/CreateCakeModal";
import { EditCakeDrawer } from "@/components/admin/EditCakeDrawer";
import { getAdminCakes, deleteCake, describeCakeApiError } from "@/lib/api/catalog";
import { CakeSummary } from "@/types/catalog";

export default function AdminCatalogPage() {
  const [cakes, setCakes] = useState<CakeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCake, setEditingCake] = useState<CakeSummary | null>(null);
  const [deletingCake, setDeletingCake] = useState<CakeSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    getAdminCakes().then(setCakes).catch(() => toast.error("Could not load the catalog.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function confirmDelete() {
    if (!deletingCake || deleting) return;
    setDeleting(true);
    try {
      await deleteCake(deletingCake.cakeId);
      if (editingCake?.cakeId === deletingCake.cakeId) setEditingCake(null);
      setDeletingCake(null);
      toast.success("Cake removed from catalog");
      refresh();
    } catch (error) {
      toast.error(describeCakeApiError(error, "delete"));
    } finally {
      setDeleting(false);
    }
  }

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
                  <motion.div key={cake.cakeId} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="group overflow-hidden rounded-3xl border border-chocolate/10 bg-white text-left shadow-sm transition hover:shadow-lg">
                    <button type="button" onClick={() => setEditingCake(cake)} aria-label={`Edit ${cake.name}`} className="block w-full text-left">
                      <div className="relative h-32 w-full bg-vanilla/40">
                        {cake.baseImageUrl ? <img src={cake.baseImageUrl} alt={cake.name} className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center text-chocolate/25"><ImageOff className="h-6 w-6" /></div>}
                        {!cake.isActive && <span className="absolute bottom-2 left-2 rounded-full bg-cream/95 px-2 py-1 text-[10px] font-medium text-chocolate">Draft</span>}
                      </div>
                    </button>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-chocolate">{cake.name}</p>
                      <p className="mt-1 text-xs text-chocolate/55">R{Number(cake.basePrice).toFixed(2)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-chocolate/10 pt-3">
                        <button type="button" onClick={() => setEditingCake(cake)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-chocolate/15 px-2 py-2 text-xs font-medium text-chocolate hover:bg-cream"><Pencil size={13}/> Edit</button>
                        <button type="button" onClick={() => setDeletingCake(cake)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 size={13}/> Delete</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AdminShell>
      </div>

      {deletingCake && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-chocolate/60 p-4 backdrop-blur-sm" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-cake-title" aria-describedby="delete-cake-description" className="w-full max-w-md rounded-[1.6rem] bg-cream p-7 shadow-2xl">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700"><AlertTriangle size={21}/></div>
            <h2 id="delete-cake-title" className="font-serif text-2xl text-chocolate">Delete this cake?</h2>
            <p id="delete-cake-description" className="mt-3 text-sm leading-7 text-chocolate/70">You’re about to delete <strong>{deletingCake.name}</strong>. This action cannot be undone. Cakes associated with past orders may need to be hidden instead, to protect order history.</p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setDeletingCake(null)} className="rounded-full border border-chocolate/20 px-5 py-3 text-sm font-medium">Keep cake</button>
              <button type="button" disabled={deleting} onClick={() => void confirmDelete()} className="rounded-full bg-red-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{deleting ? "Deleting..." : "Delete cake"}</button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && <CreateCakeModal onClose={() => setShowCreateModal(false)} onCreated={refresh} />}
      {editingCake && <EditCakeDrawer cake={editingCake} onClose={() => setEditingCake(null)} onSaved={refresh} />}
    </RequireAdmin>
  );
}
