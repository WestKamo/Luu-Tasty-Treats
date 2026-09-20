"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { adminLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { adminLoginSchema, AdminLoginFormValues } from "@/lib/validation/schemas";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({ 
    resolver: zodResolver(adminLoginSchema) 
  });

  async function onSubmit(values: AdminLoginFormValues) {
    try {
      const result = await adminLogin(values);
      setSession(result.accessToken, result.email, result.roles);
      // Smooth, immediate transition without the fake loading screen
      router.push("/admin/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-10 pt-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-chocolate/10 bg-white shadow-2xl md:grid-cols-2">
        
        {/* Image panel — replacing Spline with lulu.png */}
        <div className="relative h-48 w-full md:h-auto md:min-h-[520px]">
          <img 
            src="/images/lulu.png" 
            alt="Luu Tasty Treats Baker" 
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate/80 via-chocolate/20 to-transparent" />
          <div className="pointer-events-none absolute bottom-4 left-5 text-cream md:bottom-8 md:left-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/80">Staff Only</p>
            <p className="font-serif text-xl text-white md:text-3xl">Luu Tasty Treats</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-12">
          <div className="mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vanilla/50">
              <Lock className="h-6 w-6 text-chocolate" />
            </div>
            <h1 className="mt-6 font-serif text-3xl font-semibold text-chocolate">Admin Portal</h1>
            <p className="mt-2 text-sm text-chocolate/60">Sign in to manage orders and the catalog.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-chocolate/70">
                Email <span className="text-berry-dark" aria-hidden="true">*</span>
              </label>
              <input
                type="email"
                autoComplete="username"
                {...register("email")}
                className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3.5 text-chocolate focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-chocolate/70">
                Password <span className="text-berry-dark" aria-hidden="true">*</span>
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3.5 text-chocolate focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry"
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full rounded-full bg-chocolate py-4 font-medium tracking-wide text-cream shadow-lg transition-colors hover:bg-chocolate-light disabled:opacity-70"
            >
              {isSubmitting ? "Verifying..." : "Sign In"}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
