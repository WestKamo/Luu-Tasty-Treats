import { apiClient } from "./client";
import { PlaceOrderRequest, PlaceOrderResponse } from "@/types/orders";

export async function placeOrder(payload: PlaceOrderRequest) {
  const { data } = await apiClient.post<PlaceOrderResponse>("/api/v1/orders", payload);
  return data;
}
