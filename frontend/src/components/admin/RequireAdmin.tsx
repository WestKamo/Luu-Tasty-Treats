"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait for Next.js to mount in the browser so it can safely read localStorage
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.replace("/admin/login");
    }
  }, [mounted, accessToken, router]);

  // Don't flash the protected page while checking security
  if (!mounted || !accessToken) return null; 
  return <>{children}</>;
}
