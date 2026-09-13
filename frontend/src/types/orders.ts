export interface PlaceOrderItemInput {
  cakeId: string;
  quantity: number;
  customText?: string;
  selectedOptionIds: string[];
}

export interface DeliveryAddressInput {
  line1: string;
  line2?: string;
  city: string;
  provinceState?: string;
  postalCode?: string;
  country: string;
}

export interface PlaceOrderRequest {
  customerEmail: string;
  customerFullName: string;
  customerPhone?: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: DeliveryAddressInput;
  requestedDate: string; // ISO date, e.g. "2026-09-15"
  items: PlaceOrderItemInput[];
}

export interface PlaceOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
}

// Speculative — matches the documented contract; backend endpoint doesn't exist yet
export interface PayFastInitiateResponse {
  processUrl: string;
  fields: Record<string, string>;
}

