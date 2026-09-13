import { apiClient } from "./client";
import { AdminLoginRequest, AdminLoginResponse } from "@/types/auth";

export async function adminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
  const { data } = await apiClient.post<AdminLoginResponse>("/api/v1/auth/admin/login", payload);
  return data;
}

