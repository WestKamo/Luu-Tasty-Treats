import { create } from "zustand";
interface AuthState {
  accessToken: string | null;
  email: string | null;
  roles: string[];
  setSession: (session: { accessToken: string; email: string; roles: string[] }) => void;
  clearSession: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  email: null,
  roles: [],
  setSession: ({ accessToken, email, roles }) => set({ accessToken, email, roles }),
  clearSession: () => set({ accessToken: null, email: null, roles: [] }),
}));
