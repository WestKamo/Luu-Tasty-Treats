"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [accessToken, router]);

  if (!checked) return null; // avoid flashing protected content before redirect resolves
  return <>{children}</>;
}
