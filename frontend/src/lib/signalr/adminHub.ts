import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/authStore";

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
  return new signalR.HubConnectionBuilder()
    .withUrl("http://127.0.0.1:5281/hubs/admin-orders", {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}
