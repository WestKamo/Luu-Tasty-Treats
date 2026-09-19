import type { ReactNode } from "react";
import { FloatingNavbar } from "./FloatingNavbar";

export function BakeryShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-chocolate">
      <FloatingNavbar cartCount={0} />
      <main className="relative min-h-screen overflow-hidden pt-24">{children}</main>
    </div>
  );
}
