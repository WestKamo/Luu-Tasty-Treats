"use client";
import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));
const SPLINE_SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim() ?? "";

export function SplineScene() {
  if (!SPLINE_SCENE_URL) return <SplineFallback />;
  return (
    <SplineErrorBoundary>
      <Suspense fallback={<SplineFallback />}>
        <Spline className="h-full w-full" scene={SPLINE_SCENE_URL} />
      </Suspense>
    </SplineErrorBoundary>
  );
}

function SplineFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-vanilla via-cream to-berry/30" role="img" aria-label="Luu Tasty Treats decorative background">
      <div className="text-center">
        <div className="relative mx-auto mb-5 h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-berry/10" />
          <div className="relative h-full w-full rounded-full bg-berry/20 backdrop-blur-sm" />
        </div>
        <p className="font-serif text-xl text-chocolate/60">Luu Tasty Treats</p>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-chocolate/35">Preparing something delicious</p>
      </div>
    </div>
  );
}

class SplineErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") console.error("Spline scene failed to load:", error, errorInfo);
  }
  render() { return this.state.hasError ? <SplineFallback /> : this.props.children; }
}
