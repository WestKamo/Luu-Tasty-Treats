"use client";
import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));
const SPLINE_SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL?.trim() ?? "";

export function SplineScene() {
  if (!SPLINE_SCENE_URL) { return <SplineFallback />; }
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
        <div className="mx-auto mb-4 h-24 w-24 animate-pulse rounded-full bg-berry/40 motion-reduce:animate-none" aria-hidden="true" />
        <p className="font-serif text-chocolate/60">Luu Tasty Treats</p>
      </div>
    </div>
  );
}

interface SplineErrorBoundaryProps { children: ReactNode; }
interface SplineErrorBoundaryState { hasError: boolean; }
class SplineErrorBoundary extends Component<SplineErrorBoundaryProps, SplineErrorBoundaryState> {
  state: SplineErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): SplineErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") { console.error("Spline scene failed to render.", error, info); }
  }
  render() { return this.state.hasError ? <SplineFallback /> : this.props.children; }
}
