import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Luu's Tasty Treats",
  description: "Custom cakes, made your way.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
