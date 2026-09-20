import { apiClient } from "./client";
import { CakeSummary, CakeDetail } from "@/types/catalog";

export async function getCakes(params?: { categoryId?: string; featuredOnly?: boolean }) {
  const { data } = await apiClient.get<CakeSummary[]>("/api/cakes", { params });
  return data;
}

export async function getAdminCakes() {
  const { data } = await apiClient.get<CakeSummary[]>("/api/admin/cakes");
  return data;
}

export async function getCakeCustomizationSchema(cakeId: string) {
  const { data } = await apiClient.get<CakeDetail>(`/api/cakes/${cakeId}/customization-schema`);
  return data;
}

export interface CakeImageDto {
  id: string;
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export async function getCakeImages(cakeId: string): Promise<CakeImageDto[]> {
  const { data } = await apiClient.get<CakeImageDto[]>(`/api/admin/cakes/${cakeId}/images`);
  return data;
}

export interface UpdateCakePayload { 
  name: string; 
  description: string | null; 
  basePrice: number; 
  isActive?: boolean;
}

export async function createCake(payload: UpdateCakePayload) {
  const { data } = await apiClient.post(`/api/admin/cakes`, payload);
  return data;
}

export async function updateCake(cakeId: string, payload: UpdateCakePayload) {
  const { data } = await apiClient.put(`/api/admin/cakes/${cakeId}`, payload);
  return data;
}

export async function uploadCakeImage(cakeId: string, file: File, displayOrder: number) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/api/admin/cakes/${cakeId}/images?displayOrder=${displayOrder}`, form);
  return data;
}

export async function deleteCake(cakeId: string) {
  await apiClient.delete(`/api/admin/cakes/${cakeId}`);
}

export async function deleteCakeImage(cakeId: string, imageUrl: string) {
  await apiClient.delete(`/api/admin/cakes/${cakeId}/images`, { params: { imageUrl } });
}
