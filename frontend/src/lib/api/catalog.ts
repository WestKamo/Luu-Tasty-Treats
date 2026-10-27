import axios from "axios";
import { apiClient, publicApiClient } from "./client";
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
  imageId: string;
  imageUrl: string;
  displayOrder: number;
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

// Creation and editing have different contracts: new cakes start inactive
// and CategoryId is nullable in the backend CreateCakeRequest.
export interface CreateCakePayload {
  name: string;
  description: string | null;
  basePrice: number;
  categoryId?: string | null;
}

export interface CreatedCake {
  cakeId: string;
  name: string;
  basePrice: number;
  baseImageUrl: string;
  isActive: boolean;
}

export async function createCake(payload: CreateCakePayload): Promise<CreatedCake> {
  const { data } = await apiClient.post<CreatedCake>("/api/v1/admin/cakes", payload);
  return data;
}

export async function updateCake(cakeId: string, payload: UpdateCakePayload) {
  const { data } = await apiClient.put(`/api/v1/admin/cakes/${cakeId}`, payload);
  return data;
}

export async function uploadCakeImage(cakeId: string, file: File, displayOrder: number, onProgress?: (percent: number) => void) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/api/v1/admin/cakes/${cakeId}/images?displayOrder=${displayOrder}`, form, {
    // Axios sets the multipart boundary for browser FormData.
    headers: { "Content-Type": undefined },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export async function deleteCake(cakeId: string) {
  await apiClient.delete(`/api/v1/admin/cakes/${cakeId}`);
}

export async function deleteCakeImage(imageId: string) {
  await apiClient.delete(`/api/v1/admin/cake-images/${imageId}`);
}

/** Safe user-facing diagnostics, without exposing bearer tokens or backend secrets. */
export function describeCakeApiError(error: unknown, action: "create" | "upload" | "update" | "delete"): string {
  if (!axios.isAxiosError(error)) return "Unexpected error. Please retry.";
  const status = error.response?.status;
  const payload = error.response?.data as { error?: string; detail?: string; title?: string; errors?: Record<string, string[]> } | undefined;
  if (!status) return "Cannot reach the API. Check your connection and the deployed backend.";
  if (status === 401) return "Session expired (401). Sign in again.";
  if (status === 403) return action === "upload" || action === "delete"
    ? "Photo action denied (403). SuperAdmin access is required."
    : "Action denied (403). Admin privileges are required.";
  if (status === 404) return "Resource or API route not found (404).";
  if (status === 413) return "Image is too large (413). Try a smaller file.";
  if (status === 400 || status === 422) {
    const fields = payload?.errors ? Object.values(payload.errors).flat().join(" ") : "";
    return `Request rejected (${status}): ${fields || payload?.error || payload?.detail || payload?.title || "Check the submitted data."}`;
  }
  if (status >= 500) return `Backend error (${status}). Check Render logs.`;
  return `Request failed (HTTP ${status}): ${payload?.error || payload?.detail || "Please retry."}`;
}
