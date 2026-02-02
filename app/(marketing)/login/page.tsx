"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useState } from "react";
import { Playfair_Display } from "next/font/google";

function EyeIcon({ open }: { open: boolean }) {
  // 不依赖任何库：用 inline svg
  return open ? (
    // eye-off
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.88 5.08A10.94 10.94 0 0112 5c5.52 0 9.5 4.5 10 7-.2 1.02-.9 2.56-2.18 4.02M6.11 6.11C4.16 7.53 2.78 9.65 2 12c.5 2.5 4.48 7 10 7 1.22 0 2.36-.22 3.39-.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    // eye
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/profile";
  const { login } = useAuth();

  // 表单
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
  const hasDigit = (value: string) => /\d/.test(value);
  const hasSpecial = (value: string) =>
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~¥。，～]/.test(value);
  const isValidPassword = (value: string) =>
    value.length >= 8 && hasDigit(value) && hasSpecial(value);

  const handleLogin = async () => {
    setErr(null);
    setLoading(true);
  
    try {
      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }
      if (!isValidPassword(password)) {
        throw new Error(
          "Password must be at least 8 characters and include a number and a special symbol."
        );
      }
      await login(email.trim().toLowerCase(), password);
      router.push(redirectTo);
    } catch (e: any) {
      setErr(e?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = isValidEmail(email) && isValidPassword(password) && !loading;

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-white to-blue-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[18%] h-24 w-24 rounded-[28px] bg-gradient-to-br from-sky-300 to-white shadow-[0_18px_40px_rgba(14,116,144,0.18)]" />
        <div className="absolute left-[10%] top-[60%] h-20 w-20 rounded-[26px] bg-gradient-to-br from-blue-300 to-sky-200 shadow-[0_18px_40px_rgba(30,64,175,0.18)]" />
        <div className="absolute left-[12%] top-[68%] h-10 w-10 rounded-full bg-gradient-to-br from-cyan-300 to-sky-200 shadow-[0_12px_28px_rgba(30,64,175,0.16)]" />
        <div className="absolute right-[8%] top-[12%] h-16 w-16 rounded-[24px] bg-gradient-to-br from-sky-300 to-white shadow-[0_16px_36px_rgba(30,64,175,0.16)]" />
        <div className="absolute right-[12%] top-[32%] h-24 w-24 rounded-[30px] bg-gradient-to-br from-blue-300 to-sky-200 shadow-[0_18px_40px_rgba(30,64,175,0.18)]" />
        <div className="absolute right-[14%] top-[62%] h-12 w-12 rounded-[20px] bg-gradient-to-br from-sky-300 to-white shadow-[0_14px_30px_rgba(14,116,144,0.16)]" />
        <div className="absolute left-1/2 top-[50%] h-40 w-40 -translate-x-1/2 rounded-full bg-sky-200/70 blur-2xl" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute left-6 top-6 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white"
      >
        ← Back to Home
      </button>

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 py-10">
        <div className="mb-6 flex w-full items-center justify-between text-slate-500">
        </div>

        <div className="w-full max-w-[520px] rounded-[28px] border border-sky-100 bg-white/90 p-8 shadow-[0_30px_70px_-35px_rgba(30,64,175,0.25)] backdrop-blur">
          <div className="text-center">
            <h1 className={`${playfair.className} text-3xl font-semibold text-slate-900`}>
              Login
            </h1>
            <p className={`${playfair.className} mt-2 text-base text-slate-500`}>
              Welcome back — continue your workspace.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled
              className="flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white py-2.5 text-xs font-semibold text-slate-500 shadow-sm"
            >
              Continue with Google
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or continue with email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
                  email.length > 0 && !isValidEmail(email)
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/40"
                    : "border-sky-100 bg-white focus:border-sky-400 focus:ring-sky-400/15"
                }`}
                placeholder="E.g.alexsmith@email.com"
                autoComplete="email"
                aria-invalid={email.length > 0 && !isValidEmail(email)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) handleLogin();
                }}
              />
              {email.length > 0 && !isValidEmail(email) && (
                <p className="text-xs text-rose-500">Please enter a valid email format.</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPwd ? "text" : "password"}
                  className={`w-full rounded-xl border px-4 py-2.5 pr-12 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
                    password.length > 0 && !isValidPassword(password)
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/40"
                      : "border-sky-100 bg-white focus:border-sky-400 focus:ring-sky-400/15"
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSubmit) handleLogin();
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {password.length > 0 && !isValidPassword(password) && (
                <p className="text-xs text-rose-500">
                  Use 8+ chars with at least 1 number and 1 special symbol.
                </p>
              )}
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button
              onClick={handleLogin}
              disabled={!canSubmit}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200/60 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

            <div className="text-center text-sm text-slate-500">
              New user?{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
