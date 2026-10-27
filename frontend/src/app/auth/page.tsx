"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { customerLogin, customerRegister, forgotPassword, logout } from "@/lib/api/auth";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === "login") {
        await customerLogin(email, password);
        router.push("/cart");
      } else if (view === "register") {
        await customerRegister(firstName, lastName, email, password);
        toast.success("Account created. Check your email for a verification link.");
        await logout();
        setView("login");
      } else {
        await forgotPassword(email);
        toast.success("If an account exists, a reset email will be sent.");
        setView("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="flex h-screen w-screen overflow-hidden bg-cream font-sans">
        {/* Left Half: Decorative Bakery Gradient Visual */}
        <div className="relative hidden h-full w-1/2 bg-gradient-to-br from-chocolate via-berry-dark to-chocolate-light md:flex flex-col justify-between p-12 text-cream">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
          <div className="relative z-10">
            <span className="rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              Bespoke Artisan Bakery
            </span>
          </div>
          <div className="relative z-10 max-w-md">
            <h2 className="font-serif text-5xl font-bold leading-tight">Sweet moments, baked to perfection.</h2>
            <p className="mt-4 text-cream/80 leading-relaxed">Manage your custom orders, track live baking updates, and tailor your dream cakes with ease.</p>
          </div>
          <div className="relative z-10 text-xs text-cream/50">
            © {new Date().getFullYear()} Luu Tasty Treats. All rights reserved.
          </div>
        </div>

        {/* Right Half: Auth Forms */}
        <div className="flex h-full w-full flex-col items-center justify-center p-8 md:w-1/2 overflow-y-auto">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-block text-sm font-semibold text-chocolate/60 hover:text-berry-dark transition">
              ← Back to Bakery
            </Link>

            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-serif text-3xl font-bold text-chocolate mb-2">
                  {view === "login" && "Sign In"}
                  {view === "register" && "Create Account"}
                  {view === "forgot" && "Reset Password"}
                </h1>
                <p className="mb-8 text-chocolate/60">
                  {view === "login" && "Enter your email and password to access your orders."}
                  {view === "register" && "Join us for faster checkouts and order tracking."}
                  {view === "forgot" && "We'll send a secure link to update your password."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === "register" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-chocolate">First Name</label>
                        <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-chocolate">Last Name</label>
                        <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-chocolate">Email Address</label>
                    <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                  </div>

                  {view !== "forgot" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-chocolate">Password</label>
                        {view === "login" && (
                          <button type="button" onClick={() => setView("forgot")} className="text-xs font-semibold text-berry-dark hover:underline">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input required type="password" minLength={6} autoComplete={view === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-chocolate/15 bg-white px-4 py-3 text-chocolate outline-none transition focus:border-berry focus:ring-2 focus:ring-berry/20" />
                    </div>
                  )}

                  <button disabled={loading} type="submit" className="mt-4 w-full rounded-full bg-chocolate py-3.5 font-semibold text-cream shadow-soft transition hover:bg-chocolate-light disabled:opacity-70">
                    {loading ? "Processing..." : view === "login" ? "Sign In" : view === "register" ? "Create Account" : "Send Reset Link"}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm text-chocolate/60">
                  {view === "login" ? (
                    <p>Don't have an account? <button onClick={() => setView("register")} className="font-semibold text-chocolate hover:text-berry-dark">Sign up</button></p>
                  ) : (
                    <p>Back to <button onClick={() => setView("login")} className="font-semibold text-chocolate hover:text-berry-dark">Sign in</button></p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

    </>
  );
}
