import axios from "axios";
import { firebaseIdToken } from "@/lib/firebase/client";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5281",
  headers: { "Content-Type": "application/json" },
});

// Obtain a fresh Firebase ID token for each request; never use a cached hand-rolled JWT.
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = await firebaseIdToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});
