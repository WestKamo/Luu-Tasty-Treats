"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasValidSession = useAuthStore((s) => s.hasValidSession);
  const logout = useAuthStore((s) => s.logout);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasValidSession()) {
      if (accessToken) logout(); // stale/expired — clear it, don't leave a dead token sitting around
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [accessToken, hasValidSession, logout, router]);

  if (!checked) return null;
  return <>{children}</>;
}
