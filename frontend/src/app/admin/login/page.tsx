"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

import { SplineScene } from "@/components/SplineScene";
import { adminLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { adminLoginSchema, AdminLoginFormValues } from "@/lib/validation/schemas";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [unlocking, setUnlocking] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginFormValues) {
    try {
      const result = await adminLogin(values);
      setSession(result.accessToken, result.email, result.roles);
      // ACCESS GRANTED fires only here — after real credentials are verified.
      setUnlocking(true);
      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch {
      toast.error("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-chocolate/8 bg-white shadow-soft md:grid-cols-2">
        {/* Spline panel — short banner on mobile, full half on desktop */}
        <div className="relative h-40 w-full md:h-auto md:min-h-[520px]">
          <SplineScene />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate/30 to-transparent md:bg-gradient-to-r" />
          <div className="pointer-events-none absolute bottom-4 left-5 text-cream md:bottom-8 md:left-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/70">Staff Only</p>
            <p className="font-serif text-xl md:text-2xl">Luu Tasty Treats</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-12">
          <div className="mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-vanilla">
              <Lock className="h-5 w-5 text-chocolate" />
            </div>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-chocolate">Admin Portal</h1>
            <p className="mt-1 text-sm text-chocolate/50">Sign in to manage orders and the catalog.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-chocolate/70">
                Email <span className="text-berry-dark" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </label>
              <input
                type="email"
                autoComplete="username"
                {...register("email")}
                className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-4 focus:ring-berry/20"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-chocolate/70">
                Password <span className="text-berry-dark" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-4 focus:ring-berry/20"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-chocolate py-3.5 font-medium text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Sign In"}
            </motion.button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {unlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-chocolate px-6"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center text-cream"
            >
              <motion.div
                className="mx-auto mb-5 h-16 w-16 rounded-full border-2 border-berry border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
              />
              <p className="font-serif text-lg tracking-[0.3em]">ACCESS GRANTED</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
