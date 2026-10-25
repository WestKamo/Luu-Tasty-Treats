"use client";

import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";

// Must live in a client component: Spline's browser runtime must not be SSR-rendered.
// React.lazy or a static @splinetool/react-spline import previously caused an
// SSR/Turbopack packaging issue with the Draco decoder.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SPLINE_SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim() ?? "";

/** Auth-page illustration; intentionally not yet wired to /auth or /admin/login. */
export function SplineScene() {
  const [loaded, setLoaded] = useState(false);

  if (!SPLINE_SCENE_URL) {
    return <SplineFallback />;
  }

  return (
    <SplineErrorBoundary>
      <div className="relative h-full w-full overflow-hidden">
        {/* Keep the fallback *above* the canvas until onLoad succeeds. This
            prevents a permanently blank scene when remote loading stalls. */}
        {!loaded && (
          <div className="absolute inset-0 z-10">
            <SplineFallback />
          </div>
        )}
        <Spline
          scene={SPLINE_SCENE_URL}
          className="h-full w-full"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </SplineErrorBoundary>
  );
}

/** CSS-only, usable without a scene URL, 3D runtime, or JavaScript animation. */
function SplineFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-cream px-8 text-center"
      role="img"
      aria-label="Luu Tasty Treats artisan bakery illustration"
    >
      <div className="w-full max-w-xs border-y border-chocolate/20 py-10">
        <span className="block font-serif text-5xl leading-none text-chocolate/70" aria-hidden="true">
          ✳
        </span>
        <p className="mt-5 font-serif text-2xl text-chocolate">Luu Tasty Treats</p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-chocolate/70">
          Baked with care
        </p>
      </div>
    </div>
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Spline scene could not load:", error, errorInfo);
    }
  }

  render() {
    return this.state.hasError ? <SplineFallback /> : this.props.children;
  }
}
