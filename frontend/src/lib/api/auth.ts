import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { apiClient } from "./client";
import { useAuthStore } from "@/store/authStore";

export interface AuthProfile {
  userId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  roles: string[];
}

export async function loadProfile(): Promise<AuthProfile> {
  const { data } = await apiClient.get<AuthProfile>("/api/v1/auth/me");
  return data;
}

export async function customerLogin(email: string, password: string): Promise<AuthProfile> {
  await signInWithEmailAndPassword(firebaseAuth(), email, password);
  const profile = await loadProfile();
  useAuthStore.getState().setSession(profile.email, profile.fullName, profile.roles);
  return profile;
}

export async function customerRegister(firstName: string, lastName: string, email: string, password: string): Promise<void> {
  const result = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
  await updateProfile(result.user, { displayName: `${firstName} ${lastName}`.trim() });
  await sendEmailVerification(result.user);
  // The backend creates a Customer role on first verified-token request (email can be unverified
  // for brand-new customers; linking to an existing email requires verification).
  // Account linking and provisioning happen on the next authenticated API request.
}

export async function adminLogin(email: string, password: string): Promise<AuthProfile> {
  await signInWithEmailAndPassword(firebaseAuth(), email, password);
  try {
    const profile = await loadProfile();
    if (!profile.roles.some((r) => r === "Admin" || r === "SuperAdmin")) {
      throw new Error("This account does not have administrator access.");
    }
    useAuthStore.getState().setSession(profile.email, profile.fullName, profile.roles);
    return profile;
  } catch (error) {
    await signOut(firebaseAuth());
    useAuthStore.getState().clearSession();
    throw error;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(firebaseAuth(), email);
}

export async function logout(): Promise<void> {
  await signOut(firebaseAuth());
  useAuthStore.getState().clearSession();
}
