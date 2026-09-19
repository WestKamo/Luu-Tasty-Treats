"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LayoutGrid, LogOut, Wifi, WifiOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/admin/dashboard", label: "Live Orders", icon: LayoutDashboard },
  { href: "/admin/catalog", label: "Catalog", icon: LayoutGrid },
];

export function AdminShell({
  children,
  connected,
}: {
  children: React.ReactNode;
  connected?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[2rem] border border-chocolate/8 bg-white shadow-soft md:flex-row">
      <aside className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-chocolate/8 bg-vanilla/40 px-6 py-4 md:w-64 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:py-8">
        <div className="hidden md:block">
          <p className="font-serif text-lg font-semibold text-chocolate">Luu Admin</p>
          <p className="mt-1 truncate text-xs text-chocolate/40">{email}</p>
        </div>

        <nav className="flex flex-1 gap-2 md:mt-8 md:flex-col">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active ? "bg-chocolate text-cream shadow-soft" : "text-chocolate/60 hover:bg-chocolate/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 md:mt-auto md:flex-col md:items-stretch md:gap-2">
          {connected !== undefined && (
            <div
              className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                connected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              }`}
            >
              {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {connected ? "Live" : "Offline"}
            </div>
          )}
          <button
            onClick={() => { logout(); router.push("/admin/login"); }}
            className="flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-chocolate/50 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
    </div>
  );
}
