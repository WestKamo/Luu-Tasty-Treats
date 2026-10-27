import axios from "axios";
import { firebaseIdToken } from "@/lib/firebase/client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5281";

// Public browsing must NEVER depend on Firebase config or a Firebase session.
export const publicApiClient = axios.create({ baseURL: apiBaseUrl });

// Protected endpoints (Admin, cart, order, etc.) retain Firebase ID-token auth.
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = await firebaseIdToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});
