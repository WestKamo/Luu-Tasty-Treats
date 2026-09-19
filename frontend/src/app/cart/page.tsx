"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validation/schemas";
import { placeOrder } from "@/lib/api/orders";

export default function CartPage() {
const subtotalPreview = () => {
  return lines.reduce((total, item) => total + (item.price * item.quantity), 0);
};
const { lines, removeLine, clear } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryMethod: "pickup" },
  });

  const deliveryMethod = watch("deliveryMethod");

  async function onSubmit(values: CheckoutFormValues) {
    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeOrder({
        customerEmail: values.customerEmail,
        customerFullName: values.customerFullName,
        customerPhone: values.customerPhone,
        deliveryMethod: values.deliveryMethod,
        requestedDate: values.requestedDate,
        deliveryAddress:
          values.deliveryMethod === "delivery"
            ? {
                line1: values.line1!,
                line2: values.line2,
                city: values.city!,
                provinceState: values.provinceState!,
                postalCode: values.postalCode!,
              }
            : undefined,
        items: lines.map((l) => ({
          cakeId: l.cakeId,
          quantity: l.quantity,
          customText: l.customText,
          selectedOptionIds: l.selectedOptionIds,
        })),
      });

      clear();
      toast.success(`Order ${result.orderNumber} placed successfully!`);
      router.push(`/orders/${result.orderNumber}/confirmation`);
    } catch {
      toast.error("Could not place order. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="p-4 rounded-full bg-black/5 mb-4">
          <ShoppingBag className="h-10 w-10 text-black/40" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-black">Your Cart is Empty</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-xs">
          Explore our signature collection and add some sweetness to your day.
        </p>
        <button
          onClick={() => router.push("/cakes")}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition"
        >
          Browse Cakes <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-black py-12 px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-bold tracking-widest text-black mb-8 text-center">
          Review & Checkout
        </h1>

        <div className="grid md:grid-cols-12 gap-10">
          
          {/* Cart Items Summary Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold border-b border-black/10 pb-3">
                Your Selection ({lines.length})
              </h2>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {lines.map((line) => (
                  <div key={line.lineId || line.cakeId} className="flex items-center justify-between gap-4 py-2 border-b border-black/5 last:border-0">
                    <div className="flex items-center gap-3">
                      {line.imageUrl && (
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={line.imageUrl} alt={line.cakeName} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-black">{line.cakeName}</h4>
                        <p className="text-xs text-gray-500">Qty: {line.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">R {(line.price * line.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeLine(line.lineId || line.cakeId)}
                        className="text-gray-400 hover:text-red-600 transition mt-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-4 flex justify-between items-center">
                <span className="text-sm uppercase tracking-wider font-bold">Total Preview</span>
                <span className="font-serif text-xl font-bold text-black">
                  R {subtotalPreview().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form Column */}
          <div className="md:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm space-y-6"
            >
              <h2 className="font-serif text-lg font-bold border-b border-black/10 pb-3">
                Customer & Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register("customerFullName")}
                    type="text"
                    placeholder="Lulama Nguxa"
                    className="w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition"
                  />
                  {errors.customerFullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.customerFullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register("customerEmail")}
                      type="email"
                      placeholder="lulamanguxa@gmail.com"
                      className="w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition"
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-600 mt-1">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register("customerPhone")}
                      type="text"
                      placeholder="+27 63 171 3034"
                      className="w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition"
                    />
                    {errors.customerPhone && (
                      <p className="text-xs text-red-600 mt-1">{errors.customerPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1">
                      Fulfillment Method <span className="text-red-600">*</span>
                    </label>
                    <select
                      {...register("deliveryMethod")}
                      className="w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition"
                    >
                      <option value="pickup">Studio Pickup (Kokosi, Fochville)</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1">
                      Requested Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      {...register("requestedDate")}
                      type="date"
                      className="w-full rounded-xl border border-black/20 px-4 py-2.5 text-sm focus:outline-none focus:border-black transition"
                    />
                    {errors.requestedDate && (
                      <p className="text-xs text-red-600 mt-1">{errors.requestedDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Conditional Address Fields if Delivery is selected */}
                {deliveryMethod === "delivery" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-2 border-t border-black/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-black">Delivery Address Details</p>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Street Address <span className="text-red-600">*</span></label>
                      <input {...register("line1")} type="text" placeholder="3214 Mbeki Street, Ext 3" className="w-full rounded-xl border border-black/20 px-4 py-2 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">City <span className="text-red-600">*</span></label>
                        <input {...register("city")} type="text" placeholder="Fochville" className="w-full rounded-xl border border-black/20 px-4 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Postal Code <span className="text-red-600">*</span></label>
                        <input {...register("postalCode")} type="text" placeholder="2515" className="w-full rounded-xl border border-black/20 px-4 py-2 text-sm" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-gray-800 transition disabled:opacity-50"
              >
                {submitting ? "Processing Order..." : "Confirm & Place Order"}
              </button>
            </motion.form>
          </div>

        </div>
      </div>
    </div>
  );
}
