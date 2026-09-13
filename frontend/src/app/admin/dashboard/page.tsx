"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createAdminHubConnection } from "@/lib/signalr/adminHub";
import { getAdminOrders, updateOrderStatus, AdminOrderSummary } from "@/lib/api/orders";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const NEXT_ACTION: Record<string, { label: string; nextStatus: string } | undefined> = {
  PendingPayment: { label: "Confirm Paid", nextStatus: "Paid" },
  Paid: { label: "Mark Baking", nextStatus: "InKitchen" },
  InKitchen: { label: "Mark Ready", nextStatus: "Ready" },
  Ready: { label: "Complete", nextStatus: "Completed" },
};

const STATUS_LABEL: Record<string, string> = {
  PendingPayment: "Pending Payment",
  Paid: "Paid & Confirmed",
  InKitchen: "In Kitchen",
  Ready: "Ready for Pickup/Delivery",
  Completed: "Completed",
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [connected, setConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Attempt to load past orders (this will fail gracefully until backend endpoint exists)
    getAdminOrders().then(data => { if(isMounted) setOrders(data); }).catch(() => console.log("Waiting for backend endpoint"));

    const connection = createAdminHubConnection();

    connection.on("ReceiveNewOrder", (payload: { orderId: string; orderNumber: string; totalAmount: number; status: string }) => {
      setOrders((prev) => [
        { orderId: payload.orderId, orderNumber: payload.orderNumber, totalAmount: payload.totalAmount, status: payload.status, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      toast.success(`New order: ${payload.orderNumber}`, { icon: "🔥" });
    });

    async function startHub() {
      try {
        await connection.start();
        if (isMounted) setConnected(true);
      } catch (err: any) {
        if (err.message?.includes("stop() was called")) return;
        if (isMounted) setConnected(false);
      }
    }

    startHub();
    return () => { isMounted = false; connection.stop(); };
  }, []);

  async function handleAdvance(order: AdminOrderSummary) {
    const action = NEXT_ACTION[order.status];
    if (!action) return;

    setUpdatingId(order.orderId);
    try {
      // NOTE: Requires PUT /api/v1/admin/orders/{id}/status backend endpoint to be built next
      // await updateOrderStatus(order.orderId, action.nextStatus);
      
      // Optimistic UI Update
      setOrders((prev) => prev.map((o) => (o.orderId === order.orderId ? { ...o, status: action.nextStatus } : o)));
      toast.success(`${order.orderNumber} → ${STATUS_LABEL[action.nextStatus]}`);
    } catch {
      toast.error("Backend endpoint for status update not yet implemented.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Kitchen Dashboard</h1>
            <p className="text-neutral-500 mt-1">Live order feed & fulfillment tracking.</p>
          </div>
          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-2 text-sm font-medium">
               <span className={`relative flex h-3 w-3`}>
                 {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                 <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? "bg-green-500" : "bg-red-500"}`}></span>
               </span>
               {connected ? "Live Feed Active" : "Offline"}
             </div>
             <Link href="/admin/catalog" className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 shadow-sm">
               Manage Menu & Prices
             </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 mt-10">
             <span className="text-4xl mb-4">🍽️</span>
             <p>Kitchen is quiet. Waiting for new orders...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {orders.map((order) => {
                const action = NEXT_ACTION[order.status];
                return (
                  <motion.div
                    key={order.orderId}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <p className="font-mono font-bold">{order.orderNumber}</p>
                           <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-700 uppercase tracking-wider">
                              {STATUS_LABEL[order.status] ?? order.status}
                           </span>
                        </div>
                        <p className="text-2xl font-semibold my-4">R{order.totalAmount.toFixed(2)}</p>
                      </div>
                      
                      <div className="border-t border-neutral-100 pt-4 mt-auto">
                        {action ? (
                          <button
                            onClick={() => handleAdvance(order)}
                            disabled={updatingId === order.orderId}
                            className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:bg-neutral-300"
                          >
                            {updatingId === order.orderId ? "Updating..." : action.label}
                          </button>
                        ) : (
                          <div className="w-full text-center py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                            ✓ Fulfillment Complete
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
