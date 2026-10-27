"use client";

import { useState } from "react";
import { CakeSlice } from "lucide-react";

import { FALLBACK_CAKE_IMAGE, resolveCakeImageUrl } from "@/lib/images";

type CakePhotoProps = {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
};

export default function CakePhoto({ src, alt, className = "", eager = false }: CakePhotoProps) {
  const resolvedSrc = resolveCakeImageUrl(src) ?? FALLBACK_CAKE_IMAGE;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const actualSrc = failedSrc ?? resolvedSrc;

  if (actualSrc === FALLBACK_CAKE_IMAGE) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-[#f0e7dc] ${className}`} role="img" aria-label={`${alt} — photo unavailable`}>
        <div className="flex flex-col items-center justify-center gap-3 px-4 text-center text-chocolate/40">
          <CakeSlice className="h-10 w-10 stroke-[1.2]" aria-hidden="true" />
          <span className="max-w-[11rem] text-xs font-medium leading-5">Photo coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#f0e7dc] ${className}`}>
      {/* Cloudinary images are already optimized, so a native img element is the most reliable here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={actualSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setFailedSrc(FALLBACK_CAKE_IMAGE)}
      />
    </div>
  );
}
