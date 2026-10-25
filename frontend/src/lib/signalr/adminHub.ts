import * as signalR from "@microsoft/signalr";
import { firebaseIdToken } from "@/lib/firebase/client";

export interface OrderPaidUpdatePayload {
  orderId: string;
  orderNumber: string;
  status: string;
  paidAmount: number;
}
export interface ReceiveNewOrderPayload {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
}
export function createAdminHubConnection(): signalR.HubConnection {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5281";
  return new signalR.HubConnectionBuilder()
    .withUrl(`${apiUrl}/hubs/admin-orders`, {
      accessTokenFactory: async () => (await firebaseIdToken()) ?? "",
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
