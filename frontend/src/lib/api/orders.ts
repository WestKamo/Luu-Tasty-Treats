import { apiClient } from "./client";

export interface AdminOrderSummary {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export async function placeOrder(payload: any) {
  const { data } = await apiClient.post("/api/v1/orders", payload);
  return data;
}

export async function getAdminOrders(limit = 50) {
  const { data } = await apiClient.get<AdminOrderSummary[]>("/api/v1/admin/orders", { params: { limit } });
  return data;
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const { data } = await apiClient.put(`/api/v1/admin/orders/${orderId}/status`, { status, note });
  return data;
}
