"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { createAdminHubConnection, OrderPaidUpdatePayload, ReceiveNewOrderPayload } from "@/lib/signalr/adminHub";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [liveOrders, setLiveOrders] = useState<ReceiveNewOrderPayload[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    let isMounted = true;
    const connection = createAdminHubConnection();

    connection.on("OrderPaidUpdate", (payload: OrderPaidUpdatePayload) => {
      toast.success(`Payment Received for Order ${payload.orderNumber}!`);
    });

    connection.on("ReceiveNewOrder", (payload: ReceiveNewOrderPayload) => {
      toast("🚨 New Kitchen Order!", { icon: "🔥", style: { border: "1px solid #ef4444", background: "#fef2f2" } });
      setLiveOrders((prev) => [payload, ...prev]);
    });

    async function startHub() {
      try {
        await connection.start();
        if (isMounted) {
          setConnectionStatus("connected");
        }
      } catch (err: any) {
        if (err.message?.includes("stop() was called")) return;
        if (isMounted) {
          console.error("SignalR failed:", err);
          setConnectionStatus("disconnected");
          toast.error("Live order feed disconnected.");
        }
      }
    }

    startHub();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, []);

  return (
    <RequireAdmin>
      <div className="max-w-6xl mx-auto p-6 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
            <p className="text-neutral-500 mt-1">Live order feed & fulfillment tracking.</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="relative flex h-3 w-3">
                {connectionStatus === "connected" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"}`}></span>
              </span>
              {connectionStatus === "connected" ? "Live Feed Active" : "Offline"}
            </div>
            {/* Added navigation button to Catalog Editor */}
            <Link href="/admin/catalog" className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 shadow-sm">
              Manage Menu & Prices
            </Link>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 min-h-[400px]">
          {liveOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 mt-20">
              <span className="text-4xl mb-4">🍽️</span>
              <p>Kitchen is quiet. Waiting for new orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveOrders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  key={order.orderId} 
                  className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-sm font-bold text-black">{order.orderNumber}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-800 uppercase tracking-wider">
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-4">R {order.totalAmount.toFixed(2)}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAdmin>
  );
}
