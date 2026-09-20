"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { useCartStore, lineTotal, toSafeNumber } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { checkoutSchema, CheckoutFormValues } from "@/lib/validation/schemas";
import { placeOrder } from "@/lib/api/orders";

const DELIVERY_FEE = 50;

export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const lines = useCartStore((s) => s.lines);
  const removeLine = useCartStore((s) => s.removeLine);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);

  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + lineTotal(l), 0),
    [lines]
  );

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
  const isDelivery = deliveryMethod === "delivery";
  const total = subtotal + (isDelivery ? DELIVERY_FEE : 0);

  async function onSubmit(values: any) {
    if (lines.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    if (!accessToken) {
      toast.error("Please sign in to place your order.");
      router.push("/auth");
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
        deliveryAddress: isDelivery
          ? {
              line1: values.line1!,
              line2: values.line2,
              city: values.city!,
              provinceState: values.provinceState,
              postalCode: values.postalCode,
              country: values.country!,
            }
          : undefined,
        items: lines.map((l) => ({
          cakeId: l.cakeId,
          quantity: toSafeNumber(l.quantity),
          customText: l.customText,
          selectedOptionIds: l.selectedOptionIds ?? [],
        })),
      });

      clear();
      toast.success(`Order ${result.orderNumber} placed!`);
      router.push(`/orders/${result.orderNumber}/confirmation`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { errors?: string[]; error?: string } } })?.response?.data
          ?.errors?.[0] ??
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Could not place order. Please check your details and try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-chocolate/20" />
        <h1 className="mt-6 font-serif text-3xl font-semibold text-chocolate">Your bag is empty</h1>
        <p className="mt-2 text-chocolate/50">Nothing sweet in here yet.</p>
        <Link
          href="/cakes"
          className="mt-8 inline-block rounded-full bg-chocolate px-8 py-3 font-medium text-cream shadow-soft transition hover:bg-chocolate-light"
        >
          Browse the Display Case
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-chocolate sm:text-4xl">
        Your Bag
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Selection */}
        <div className="lg:col-span-2">
          <div className="rounded-4xl border border-chocolate/8 bg-white p-6 shadow-soft">
            <h2 className="font-serif text-xl font-semibold text-chocolate">
              Your Selection ({lines.length})
            </h2>

            <div className="mt-4 divide-y divide-chocolate/8">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.div
                    key={line.lineId}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-chocolate">{line.cakeName}</p>
                        {line.selectedOptionsPreview?.length > 0 && (
                          <p className="mt-0.5 text-xs text-chocolate/50">
                            {line.selectedOptionsPreview.map((o) => o.label).join(" · ")}
                          </p>
                        )}
                        {line.customText && (
                          <p className="mt-0.5 text-xs italic text-chocolate/50">
                            &ldquo;{line.customText}&rdquo;
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.lineId, toSafeNumber(line.quantity) - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-chocolate/15 text-chocolate transition hover:bg-vanilla/50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium text-chocolate">
                            {toSafeNumber(line.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.lineId, toSafeNumber(line.quantity) + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-chocolate/15 text-chocolate transition hover:bg-vanilla/50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-chocolate">
                          R{lineTotal(line).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeLine(line.lineId)}
                          aria-label={`Remove ${line.cakeName}`}
                          className="mt-2 text-chocolate/30 transition hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 space-y-2 border-t border-chocolate/10 pt-4 text-sm">
              <div className="flex justify-between text-chocolate/60">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between text-chocolate/60">
                  <span>Delivery</span>
                  <span>R{DELIVERY_FEE.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-chocolate">
                  Total Preview
                </span>
                <span className="font-serif text-2xl font-bold text-chocolate">
                  R{total.toFixed(2)}
                </span>
              </div>
              <p className="pt-1 text-[11px] text-chocolate/40">
                Final total is confirmed by our kitchen at checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Details form */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-4xl border border-chocolate/8 bg-white p-6 shadow-soft sm:p-8"
          >
            <h2 className="font-serif text-xl font-semibold text-chocolate">
              Customer &amp; Delivery Details
            </h2>
            <p className="mt-1 text-xs text-chocolate/40">
              Fields marked <Asterisk /> are required.
            </p>

            <div className="mt-6 space-y-4">
              <Field label="Full name" required error={errors.customerFullName?.message}>
                <input
                  {...register("customerFullName")}
                  placeholder="Lulama Nguxa"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email address" required error={errors.customerEmail?.message}>
                  <input
                    type="email"
                    {...register("customerEmail")}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone number" error={errors.customerPhone?.message}>
                  <input
                    type="tel"
                    {...register("customerPhone")}
                    placeholder="+27 63 171 3034"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fulfillment method" required>
                  <select {...register("deliveryMethod")} className={inputClass}>
                    <option value="pickup">Studio Pickup (Kokosi, Fochville)</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </Field>
                <Field label="Requested date" required error={errors.requestedDate?.message}>
                  <input type="date" {...register("requestedDate")} className={inputClass} />
                </Field>
              </div>

              <AnimatePresence>
                {isDelivery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Field label="Address line 1" required error={errors.line1?.message}>
                      <input {...register("line1")} className={inputClass} />
                    </Field>
                    <Field label="Address line 2">
                      <input {...register("line2")} className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="City" required error={errors.city?.message}>
                        <input {...register("city")} className={inputClass} />
                      </Field>
                      <Field label="Province">
                        <input {...register("provinceState")} className={inputClass} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Postal code">
                        <input {...register("postalCode")} className={inputClass} />
                      </Field>
                      <Field label="Country" required error={errors.country?.message}>
                        <input {...register("country")} defaultValue="South Africa" className={inputClass} />
                      </Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!accessToken && (
              <p className="mt-6 rounded-2xl bg-vanilla/60 px-4 py-3 text-xs text-chocolate/70">
                You&apos;ll be asked to sign in before your order is placed.
              </p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full rounded-full bg-chocolate py-4 font-medium tracking-wide text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50"
            >
              {submitting ? "Placing your order..." : "Confirm & Place Order"}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition placeholder:text-chocolate/30 focus:border-berry focus:ring-4 focus:ring-berry/20";

function Asterisk() {
  return (
    <>
      <span className="text-berry-dark" aria-hidden="true">*</span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-chocolate/70">
        {label} {required && <Asterisk />}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}