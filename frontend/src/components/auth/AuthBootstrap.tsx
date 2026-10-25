"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { loadProfile } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

export function AuthBootstrap() {
  useEffect(() => {
    // Remove legacy mock-JWT data, which is never valid against Firebase.
    window.localStorage.removeItem("luu-tasty-treats-auth");
    let active = true;
    let generation = 0;
    const store = useAuthStore.getState();
    let stop = () => {};
    try {
      stop = onIdTokenChanged(firebaseAuth(), async (user) => {
        const currentGeneration = ++generation;
        useAuthStore.getState().setPending();
        if (!user) {
          useAuthStore.getState().clearSession();
          return;
        }
        try {
          const profile = await loadProfile();
          if (!active || currentGeneration !== generation) return;
          useAuthStore.getState().setSession(profile.email, profile.fullName, profile.roles);
        } catch {
          // Fail closed for admin privileges if the API cannot verify the token.
          if (active && currentGeneration === generation) useAuthStore.getState().clearSession();
        }
      });
    } catch {
      store.clearSession();
    }
    return () => { active = false; generation += 1; stop(); };
  }, []);
  return null;
}
