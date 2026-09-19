"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SplineScene } from "./SplineScene";
import { AuthTabs, type AuthMode } from "./AuthTabs";
import { AccessGrantedOverlay } from "./AccessGrantedOverlay";
import { customerLogin, customerRegister, forgotPassword } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const setSession = useAuthStore((s) => s.setSession);

  // Example handler for your Sign In form:
  async function handleSignIn(values) {
    try {
      const response = await customerLogin({
        email: values.email,
        password: values.password
      });
      
      // Save the token and roles to Zustand!
      setSession(response.accessToken, response.email, ["Customer"]);
      
      toast.success("Welcome back!");
      // Trigger your cinematic "Access Granted" overlay here
      setAccessGranted(true);
      
      setTimeout(() => router.push("/cakes"), 1500);
      
    } catch (error) {
      toast.error("Invalid email or password.");
    }
  }

  return (
    <>
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden px-3 pb-3 sm:px-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold/10 blur-[100px]" />
          <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-berry/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-6.75rem)] max-w-[1600px] overflow-hidden rounded-[2rem] border border-white/60 bg-vanilla shadow-bakery-lg lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative hidden min-h-[720px] overflow-hidden lg:block">
            <SplineScene />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-vanilla/20" />
            <div className="pointer-events-none absolute bottom-10 left-10 max-w-lg">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-chocolate/50">Artisan bakery</p>
                <h2 className="font-serif text-5xl font-medium leading-[0.95] text-chocolate xl:text-6xl">Made with<br /><span className="italic text-berry">love.</span></h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-chocolate/55">Bespoke cakes, beautiful moments, and a little sweetness in every detail.</p>
              </motion.div>
            </div>
          </motion.div>

          <div className="relative flex min-h-[720px] items-center justify-center px-5 py-16 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-md">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-12 lg:hidden">
                <p className="font-serif text-3xl font-semibold tracking-wide text-chocolate">LUU'</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-chocolate/40">Tasty Treats</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-berry">Welcome</p>
                <h1 className="font-serif text-5xl font-medium tracking-tight text-chocolate sm:text-6xl">{mode === "signin" ? "Welcome back." : mode === "register" ? "Let's begin." : "Reset access."}</h1>
                <p className="mt-4 max-w-sm text-sm leading-6 text-chocolate/50">{mode === "signin" ? "Sign in to continue your Luu Tasty Treats experience." : mode === "register" ? "Create an account and make your next celebration delicious." : "Enter your email and we'll help you get back into your account."}</p>
              </motion.div>

              <div className="mt-9">
                <AuthTabs mode={mode} onChange={(m) => { setMode(m); setShowPassword(false); }} />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={mode} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                    <form onSubmit={handleMockSubmit} className="space-y-5">
                      {mode === "register" && (
                        <div className="grid grid-cols-2 gap-3">
                          <InputField label="First name" placeholder="Phindile" />
                          <InputField label="Last name" placeholder="Sandi" />
                        </div>
                      )}
                      <InputField label="Email address" type="email" placeholder="hello@example.com" />
                      {mode !== "forgot" && (
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-chocolate/55">Password</label>
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 w-full rounded-2xl border border-chocolate/10 bg-cream/50 px-4 pr-12 text-sm text-chocolate outline-none transition-all placeholder:text-chocolate/25 hover:border-chocolate/20 focus:border-berry/40 focus:bg-vanilla focus:ring-4 focus:ring-berry/5" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/35 hover:text-chocolate">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                          </div>
                        </div>
                      )}
                      {mode === "signin" && (
                        <div className="flex items-center justify-between px-1 pt-1">
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-chocolate/45"><input type="checkbox" className="h-4 w-4 rounded border-chocolate/20 accent-berry" />Remember me</label>
                          <button type="button" onClick={() => { setMode("forgot"); setShowPassword(false); }} className="text-xs font-semibold text-berry hover:underline">Forgot password?</button>
                        </div>
                      )}
                      <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.01 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-chocolate px-6 text-sm font-semibold text-vanilla shadow-lg shadow-chocolate/10 transition-colors hover:bg-espresso disabled:cursor-not-allowed disabled:opacity-60">
                        <span>{loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}</span>
                        {!loading && <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />}
                        {loading && <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-4 w-4 rounded-full border-2 border-vanilla/30 border-t-vanilla" />}
                      </motion.button>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
      <AccessGrantedOverlay visible={accessGranted} />
    </>
  );
}

function InputField({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-chocolate/55">{label}</label>
      <input type={type} placeholder={placeholder} className="h-14 w-full rounded-2xl border border-chocolate/10 bg-cream/50 px-4 text-sm text-chocolate outline-none transition-all placeholder:text-chocolate/25 hover:border-chocolate/20 focus:border-berry/40 focus:bg-vanilla focus:ring-4 focus:ring-berry/5" />
    </div>
  );
}
