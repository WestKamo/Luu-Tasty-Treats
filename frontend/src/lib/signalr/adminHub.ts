import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";

export interface OrderPaidUpdatePayload {
  orderId: string;
  orderNumber: string;
  status: string;
  paidAmount: number;
}

// Speculative — not yet broadcast by the backend (order placement doesn't push to SignalR today).
// Wired up now so the dashboard is forward-compatible the moment it's added.
export interface ReceiveNewOrderPayload {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
}
export function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "status" in error) {
    return (error as { status: number }).status === 401 || (error as { status: number }).status === 403;
  }
  return false;
}
export function createAdminHubConnection(): signalR.HubConnection {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return new signalR.HubConnectionBuilder()
    .withUrl(`${apiUrl}/hubs/admin-orders`, {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "status" in error) {
    return (error as { status: number }).status === 401 || (error as { status: number }).status === 403;
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "status" in error) {
    return (error as { status: number }).status === 401 || (error as { status: number }).status === 403;
  }
  return false;
}
