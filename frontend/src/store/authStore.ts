import { create } from "zustand";

interface AuthState {
  initialized: boolean;
  authenticated: boolean;
  email: string | null;
  fullName: string | null;
  roles: string[];
  setPending: () => void;
  setSession: (email: string, fullName: string, roles: string[]) => void;
  clearSession: () => void;
  hasAdminRole: () => boolean;
}

// Never persist ID tokens / privileged role state to localStorage. Firebase owns the session.
export const useAuthStore = create<AuthState>()((set, get) => ({
  initialized: false,
  authenticated: false,
  email: null,
  fullName: null,
  roles: [],
  setPending: () => set({ initialized: false, authenticated: false, roles: [] }),
  setSession: (email, fullName, roles) => set({ initialized: true, authenticated: true, email, fullName, roles }),
  clearSession: () => set({ initialized: true, authenticated: false, email: null, fullName: null, roles: [] }),
  hasAdminRole: () => get().roles.some((role) => role === "Admin" || role === "SuperAdmin"),
}));
