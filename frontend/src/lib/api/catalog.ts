import { publicApiClient } from "./client";
import { CakeSummary, CakeDetail } from "@/types/catalog";

export async function getCakes(params?: { categoryId?: string; featuredOnly?: boolean }) {
  const { data } = await publicApiClient.get<CakeSummary[]>("/api/v1/cakes", { params });
  return data;
}

export async function getAdminCakes() {
  const { data } = await apiClient.get<CakeSummary[]>("/api/v1/admin/cakes");
  return data;
}

export async function getCakeCustomizationSchema(cakeId: string) {
  const { data } = await publicApiClient.get<CakeDetail>(`/api/v1/cakes/${cakeId}/customization-schema`);
  // The Minimal API returns a .NET enum (0/1 by default) on this endpoint.
  // Accept both numeric and string forms so required selections work in the UI.
  return {
    ...data,
    groups: (data.groups ?? []).map((group) => {
      const rawType: unknown = group.selectionType;
      return {
        ...group,
        selectionType: (rawType === 0 || rawType === "0" || String(rawType).toLowerCase() === "single")
          ? "single" as const
          : "multi" as const,
      };
    }),
  };
}

export interface CakeImageDto {
  id: string;
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export async function getCakeImages(cakeId: string): Promise<CakeImageDto[]> {
  const { data } = await apiClient.get<CakeImageDto[]>(`/api/v1/admin/cakes/${cakeId}/images`);
  return data;
}

export interface UpdateCakePayload {
  name: string;
  description: string | null;
  basePrice: number;
  isActive?: boolean;
}

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
  const { data } = await apiClient.post(`/api/v1/admin/cakes/${cakeId}/images?displayOrder=${displayOrder}`, form, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
}

export async function deleteCake(cakeId: string) {
  await apiClient.delete(`/api/v1/admin/cakes/${cakeId}`);
}

export async function deleteCakeImage(cakeId: string, imageUrl: string) {
  await apiClient.delete(`/api/v1/admin/cakes/${cakeId}/images`, { params: { imageUrl } });
}
