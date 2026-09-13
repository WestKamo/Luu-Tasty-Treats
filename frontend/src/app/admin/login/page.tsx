"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminLoginSchema, AdminLoginFormValues } from "@/lib/validation/schemas";
import { adminLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });
  
  async function onSubmit(values: AdminLoginFormValues) {
    setSubmitting(true);
    try {
      const result = await adminLogin(values);
      setSession(result.accessToken, result.email, result.roles);
      toast.success("Welcome back!");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="mb-8 text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input {...register("email")} className="w-full rounded-lg border border-neutral-200 px-4 py-2" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" {...register("password")} className="w-full rounded-lg border border-neutral-200 px-4 py-2" />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={submitting} className="w-full rounded-full bg-neutral-900 py-3 text-white transition hover:bg-neutral-700 disabled:bg-neutral-300">
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
