import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isTokenExpired } from "@/lib/utils/jwt";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  email: string | null;
  roles: string[];
  setSession: (accessToken: string, email: string, roles: string[]) => void;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isCustomer: () => boolean;
  hasValidSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      email: null,
      roles: [],
      setSession: (accessToken, email, roles) => set({ accessToken, email, roles }),
      logout: () => set({ accessToken: null, email: null, roles: [] }),
      isSuperAdmin: () => get().roles.includes("SuperAdmin"),
      isCustomer: () => get().roles.includes("Customer"),
      hasValidSession: () => {
        const token = get().accessToken;
        return !!token && !isTokenExpired(token);
      },
    }),
    { name: "luu-tasty-treats-auth" }
  )
);
