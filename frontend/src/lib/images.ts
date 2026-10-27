/** Resolve stored cake image URLs without routing Cloudinary through Next Image Optimization. */
export function resolveCakeImageUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5281").replace(/\/$/, "");

  if (raw.startsWith("/uploads/")) {
    try {
      return new URL(raw, apiBase).toString();
    } catch {
      return null;
    }
  }

  if (raw.startsWith("/")) {
    return raw.startsWith("//") ? null : raw;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    if (["localhost", "127.0.0.1"].includes(url.hostname) && typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      return url.pathname.startsWith("/uploads/") ? new URL(url.pathname + url.search, apiBase).toString() : null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export const FALLBACK_CAKE_IMAGE = "/cake.png";
