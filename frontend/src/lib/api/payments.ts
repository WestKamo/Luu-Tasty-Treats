import { apiClient } from "./client";
import { PayFastInitiateResponse } from "@/types/orders";

// NOTE: /api/payments/payfast does not exist on the backend yet.
// This call will 404 until that endpoint is built — wire it up before testing checkout end-to-end.
export async function initiatePayFastPayment(orderNumber: string) {
  const { data } = await apiClient.post<PayFastInitiateResponse>("/api/payments/payfast", {
    orderNumber,
  });
  return data;
}

// Auto-submits the PayFast redirect form, matching how PayFast's standard checkout expects to receive fields
export function redirectToPayFast(response: PayFastInitiateResponse) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = response.processUrl;

  Object.entries(response.fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
