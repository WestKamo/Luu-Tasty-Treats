"use client";
import { motion } from "framer-motion";

export type AuthMode = "signin" | "register" | "forgot";

export function AuthTabs({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  const tabs: { value: AuthMode; label: string }[] = [
    { value: "signin", label: "Sign In" },
    { value: "register", label: "Create Account" },
    { value: "forgot", label: "Forgot Password" },
  ];

  return (
    <div className="mb-8 flex overflow-x-auto rounded-2xl bg-chocolate/[0.045] p-1 scrollbar-none">
      {tabs.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className="relative flex-1 whitespace-nowrap rounded-xl px-3 py-3 text-xs font-semibold transition-colors sm:text-sm">
          {mode === tab.value && <motion.div layoutId="auth-tab" className="absolute inset-0 rounded-xl bg-vanilla shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
          <span className={`relative z-10 ${mode === tab.value ? "text-chocolate" : "text-chocolate/40"}`}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
