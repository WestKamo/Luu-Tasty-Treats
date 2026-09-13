"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validation/schemas";
import { placeOrder } from "@/lib/api/orders";

export default function CartPage() {
  const { lines, removeLine, subtotalPreview, clear } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormValues>({
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
        customerEmail: values.customerEmail, customerFullName: values.customerFullName, customerPhone: values.customerPhone,
        deliveryMethod: values.deliveryMethod, requestedDate: values.requestedDate,
        deliveryAddress: values.deliveryMethod === "delivery" ? {
          line1: values.line1!, line2: values.line2, city: values.city!, provinceState: values.provinceState, postalCode: values.postalCode, country: values.country!,
        } : undefined,
        items: lines.map((l) => ({ cakeId: l.cakeId, quantity: l.quantity, customText: l.customText, selectedOptionIds: l.selectedOptionIds })),
      });
      clear();
      toast.success(`Order ${result.orderNumber} placed!`);
      router.push(`/orders/${result.orderNumber}/confirmation`);
    } catch {
      toast.error("Could not place order. Please check details.");
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold">Your Cart</h1>
      {lines.length === 0 ? (
        <p className="text-neutral-400">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.lineId} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{line.cakeName}</p>
                    <p className="text-sm text-neutral-400">Qty: {line.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R{(line.unitPricePreview * line.quantity).toFixed(2)}</p>
                    <button onClick={() => removeLine(line.lineId)} className="mt-2 text-xs text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-200 pt-4 text-right">
              <p className="text-xl font-semibold">Total: R{subtotalPreview().toFixed(2)}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             {/* Form simplified for brevity, refer to Claude's full code for all inputs */}
             <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input {...register("customerFullName")} className="w-full rounded-lg border border-neutral-200 px-4 py-2" />
             </div>
             <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input type="email" {...register("customerEmail")} className="w-full rounded-lg border border-neutral-200 px-4 py-2" />
             </div>
             <div>
                <label className="mb-1 block text-sm font-medium">Requested Date</label>
                <input type="date" {...register("requestedDate")} className="w-full rounded-lg border border-neutral-200 px-4 py-2" />
             </div>
            <button type="submit" disabled={submitting} className="w-full rounded-full bg-neutral-900 py-3 text-white transition hover:bg-neutral-700 disabled:bg-neutral-300">
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
