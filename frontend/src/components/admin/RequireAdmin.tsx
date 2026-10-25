"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ready = useAuthStore((s) => s.initialized);
  const roles = useAuthStore((s) => s.roles);
  const authorized = roles.includes("Admin") || roles.includes("SuperAdmin");

  useEffect(() => {
    if (ready && !authorized) router.replace("/admin/login");
  }, [ready, authorized, router]);

  // UI gate only. Backend independently enforces database-derived policies.
  if (!ready || !authorized) return null;
  return <>{children}</>;
}
