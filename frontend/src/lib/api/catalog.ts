import { apiClient } from "./client";
import { CakeSummary, CakeDetail } from "@/types/catalog";

export async function getCakes(params?: { categoryId?: string; featuredOnly?: boolean }) {
  const { data } = await apiClient.get<CakeSummary[]>("/api/v1/cakes", { params });
  return data;
}
export async function getAdminCakes() {
  const { data } = await apiClient.get<CakeSummary[]>("/api/v1/admin/cakes");
  return data;
}
export async function getCakeCustomizationSchema(cakeId: string) {
  const { data } = await apiClient.get<CakeDetail>(`/api/v1/cakes/${cakeId}/customization-schema`);
  return data;
}
export interface UpdateCakePayload { name: string; description: string | null; basePrice: number; isActive: boolean; categoryId: string | null; }

export async function createCake(payload: UpdateCakePayload) {
  const { data } = await apiClient.post(`/api/v1/admin/cakes`, payload);
  return data;
}
export async function updateCake(cakeId: string, payload: UpdateCakePayload) {
  const { data } = await apiClient.put(`/api/v1/admin/cakes/${cakeId}`, payload);
  return data;
}
export async function uploadCakeImage(cakeId: string, file: File, displayOrder: number) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/api/v1/admin/cakes/${cakeId}/images?displayOrder=${displayOrder}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}
export async function deleteCake(cakeId: string) {
  await apiClient.delete(`/api/v1/admin/cakes/${cakeId}`);
}
