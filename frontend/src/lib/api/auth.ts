import { apiClient } from "./client";

export interface CustomerLoginRequest { email: string; password: string; }
export interface CustomerRegisterRequest { firstName: string; lastName: string; email: string; password: string; }
export interface CustomerAuthResponse { accessToken: string; expiresAtUtc: string; email: string; fullName: string; }

// Admin Login Payload & Response interfaces
export interface AdminLoginRequest { email: string; password: string; }
export interface AdminAuthResponse { accessToken: string; expiresAtUtc: string; email: string; fullName: string; }

export async function customerLogin(payload: CustomerLoginRequest) {
  const { data } = await apiClient.post<CustomerAuthResponse>("/api/auth/login", payload);
  return data;
}

// Updated adminLogin function to match backend route
export async function adminLogin(payload: AdminLoginRequest) {
  const { data } = await apiClient.post<AdminAuthResponse>("/api/auth/admin/login", payload);
  return data;
}
export async function customerRegister(payload: CustomerRegisterRequest) {
  const { data } = await apiClient.post<CustomerAuthResponse>("/api/auth/register", payload);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post("/api/auth/forgot-password", { email });
  return data;
}
