import { apiClient } from "./client";

export interface CustomerLoginRequest { email: string; password: string; }
export interface CustomerRegisterRequest { firstName: string; lastName: string; email: string; password: string; }
export interface CustomerAuthResponse { accessToken: string; expiresAtUtc: string; email: string; fullName?: string; }

export async function customerLogin(payload: CustomerLoginRequest) {
  const { data } = await apiClient.post<CustomerAuthResponse>("/api/v1/auth/login", payload);
  return data;
}

export async function customerRegister(payload: CustomerRegisterRequest) {
  const { data } = await apiClient.post<CustomerAuthResponse>("/api/v1/auth/register", payload);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post("/api/v1/auth/forgot-password", { email });
  return data;
}
