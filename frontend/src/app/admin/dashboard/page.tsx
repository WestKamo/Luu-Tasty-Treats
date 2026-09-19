"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";
import { createAdminHubConnection, isAuthError } from "@/lib/signalr/adminHub";
import { getAdminOrders, updateOrderStatus, AdminOrderSummary } from "@/lib/api/orders";
import { useAuthStore } from "@/store/authStore";

const COLUMNS = [
  { status: "paid", label: "New & Paid" },
  { status: "in_kitchen", label: "In the Kitchen" },
  { status: "ready", label: "Ready" },
];

const NEXT_ACTION: Record<string, { label: string; nextStatus: string } | undefined> = {
  paid: { label: "Start Baking", nextStatus: "in_kitchen" },
  in_kitchen: { label: "Mark Ready", nextStatus: "ready" },
  ready: { label: "Complete", nextStatus: "completed" },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [connected, setConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reconnectTick, setReconnectTick] = useState(0);

  const loadOrders = useCallback(() => {
    getAdminOrders().then(setOrders).catch(() => toast.error("Could not load orders."));
  }, []);

  useEffect(() => {
    loadOrders();
    const connection = createAdminHubConnection();

    function handleAuthFailure(err?: unknown) {
      if (!err || isAuthError(err)) {
        toast.error("Your session expired. Please sign in again.");
        useAuthStore.getState().logout();
        router.push("/admin/login");
      }
    }

    connection.on("ReceiveNewOrder", (p: { orderId: string; orderNumber: string; totalAmount: number; status: string }) => {
      setOrders((prev) => [{ orderId: p.orderId, orderNumber: p.orderNumber, totalAmount: p.totalAmount, status: p.status, createdAt: new Date().toISOString() }, ...prev]);
      toast.success(`New order: ${p.orderNumber}`);
    });
    connection.on("OrderPaidUpdate", (p: { orderId: string; status: string }) => {
      setOrders((prev) => prev.map((o) => (o.orderId === p.orderId ? { ...o, status: p.status } : o)));
    });
    connection.on("OrderStatusUpdated", (p: { orderId: string; status: string }) => {
      setOrders((prev) => prev.map((o) => (o.orderId === p.orderId ? { ...o, status: p.status } : o)));
    });

    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));
    connection.onclose((err) => { setConnected(false); if (err && isAuthError(err)) handleAuthFailure(err); });

    connection.start()
      .then(() => setConnected(true))
      .catch((err) => { setConnected(false); if (isAuthError(err)) handleAuthFailure(err); });

    return () => { connection.stop(); };
  }, [loadOrders, router, reconnectTick]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaysOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    return {
      todayCount: todaysOrders.length,
      todayRevenue: todaysOrders.reduce((s, o) => s + o.totalAmount, 0),
      pending: orders.filter((o) => o.status === "paid" || o.status === "in_kitchen").length,
      total: orders.length,
    };
  }, [orders]);

  async function handleAdvance(order: AdminOrderSummary) {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdatingId(order.orderId);
    try {
      await updateOrderStatus(order.orderId, action.nextStatus);
      setOrders((prev) => prev.map((o) => (o.orderId === order.orderId ? { ...o, status: action.nextStatus } : o)));
      toast.success(`${order.orderNumber} moved forward`);
    } catch {
      toast.error("Could not update status."); // a 401 here is already handled globally by the Axios interceptor
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <AdminShell connected={connected}>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-chocolate">Live Orders</h1>
              <p className="mt-1 text-sm text-chocolate/50">Real-time kitchen order board</p>
            </div>
            {!connected && (
              <button
                onClick={() => setReconnectTick((t) => t + 1)}
                className="flex items-center gap-2 rounded-full border border-chocolate/15 px-4 py-2 text-sm text-chocolate transition hover:bg-vanilla/50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reconnect
              </button>
            )}
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Orders Today" value={stats.todayCount} />
            <StatCard label="Revenue Today" value={`R${stats.todayRevenue.toFixed(2)}`} />
            <StatCard label="In Progress" value={stats.pending} />
            <StatCard label="All-Time" value={stats.total} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const columnOrders = orders.filter((o) => o.status === col.status);
              return (
                <div key={col.status} className="rounded-3xl bg-vanilla/30 p-4">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-chocolate/60">{col.label}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-chocolate/50">{columnOrders.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {columnOrders.map((order) => {
                        const action = NEXT_ACTION[order.status];
                        return (
                          <motion.div
                            key={order.orderId}
                            layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="rounded-2xl border border-chocolate/8 bg-white p-4 shadow-soft"
                          >
                            <p className="font-medium text-chocolate">{order.orderNumber}</p>
                            <p className="mt-0.5 text-sm text-chocolate/50">R{order.totalAmount.toFixed(2)}</p>
                            {action && (
                              <button
                                onClick={() => handleAdvance(order)}
                                disabled={updatingId === order.orderId}
                                className="mt-3 w-full rounded-full bg-chocolate py-2 text-xs font-medium text-cream transition hover:bg-chocolate-light disabled:opacity-50"
                              >
                                {updatingId === order.orderId ? "..." : action.label}
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {columnOrders.length === 0 && <p className="px-1 py-6 text-center text-xs text-chocolate/30">Nothing here</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </AdminShell>
      </div>
    </RequireAdmin>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-chocolate/8 bg-white p-4 shadow-soft">
      <p className="text-[11px] uppercase tracking-wider text-chocolate/40">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-chocolate">{value}</p>
    </div>
  );
}
