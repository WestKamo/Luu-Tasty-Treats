import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";

export function createAdminHubConnection(): signalR.HubConnection {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return new signalR.HubConnectionBuilder()
    .withUrl(`${apiUrl}/hubs/admin-orders`, {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("401") || message.toLowerCase().includes("unauthorized");
}
