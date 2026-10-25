import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let authInstance: Auth | undefined;

export function firebaseAuth(): Auth {
  if (typeof window === "undefined") throw new Error("Firebase Auth is client-side only.");
  if (!authInstance) {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      throw new Error("Firebase client environment configuration is incomplete.");
    }
    const app = getApps().length ? getApp() : initializeApp(config);
    authInstance = getAuth(app);
  }
  return authInstance;
}

export async function firebaseIdToken(): Promise<string | null> {
  const user = firebaseAuth().currentUser;
  return user ? user.getIdToken() : null; // Firebase transparently refreshes expired tokens.
}
