"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/login";

  // ✅ Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ✅ Show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy">("terms");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
  const hasDigit = (value: string) => /\d/.test(value);
  const hasSpecial = (value: string) =>
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~¥。，～]/.test(value);
  const isValidPassword = (value: string) =>
    value.length >= 8 && hasDigit(value) && hasSpecial(value);

  const handleRegister = async () => {
    setError(null);

    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return setError("Please enter a valid email address.");
    if (!e) return setError("Please enter your email.");
    if (!password) return setError("Please enter a password.");
    if (!isValidPassword(password)) {
      return setError(
        "Password must be at least 8 characters and include a number and a special symbol."
      );
    }
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e,
          password,
          role: "student",
        }),
      });

      if (!res.ok) {
        let msg = `Register failed (${res.status})`;
        try {
          const data = await res.json();
          if (typeof data?.detail === "string") msg = data.detail;
          else if (Array.isArray(data?.detail)) msg = data.detail?.[0]?.msg ?? msg;
        } catch {}
        throw new Error(msg);
      }

      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message ?? "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    isValidEmail(email) &&
    isValidPassword(password) &&
    confirm.length > 0 &&
    password === confirm &&
    !loading;

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-violet-100/70 blur-3xl" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="absolute left-1/2 top-[65%] h-64 w-64 -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="absolute left-[10%] top-[14%] h-6 w-6 rounded-full bg-violet-300/70" />
        <div className="absolute left-[20%] top-[36%] h-5 w-5 rounded-full bg-indigo-300/75" />
        <div className="absolute left-[6%] bottom-[18%] h-6 w-6 rounded-full bg-fuchsia-300/65" />
        <div className="absolute left-[32%] bottom-[8%] h-4 w-4 rounded-full bg-violet-300/65" />
        <div className="absolute right-[20%] top-[18%] h-5 w-5 rounded-full bg-indigo-300/75" />
        <div className="absolute right-[8%] bottom-[12%] h-6 w-6 rounded-full bg-violet-300/75" />
        <div className="absolute right-[28%] bottom-[28%] h-4 w-4 rounded-full bg-fuchsia-300/65" />
        <div className="absolute right-[34%] top-[42%] h-3.5 w-3.5 rounded-full bg-indigo-300/70" />
        <div className="absolute left-[38%] top-[20%] h-4.5 w-4.5 rounded-full bg-violet-300/70" />
        <div className="absolute left-[14%] bottom-[34%] h-3.5 w-3.5 rounded-full bg-fuchsia-300/70" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-center px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-5 rounded-full bg-white/30 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm transition hover:bg-white"
        >
          ← Back to Home
        </button>
        <div className="w-full overflow-hidden rounded-[36px] border border-violet-100/80 bg-white shadow-[0_32px_80px_-40px_rgba(76,29,149,0.25)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3">
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Get started</h2>
              <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400" />
              <p className="mt-2 text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </button>
              </p>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
                    email.length > 0 && !isValidEmail(email)
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/40"
                      : "border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-400/15"
                  }`}
                  placeholder="Email: e.g.xxxx@xxx.com"
                  autoComplete="email"
                  aria-invalid={email.length > 0 && !isValidEmail(email)}
                />
                {email.length > 0 && !isValidEmail(email) && (
                  <p className="text-xs text-rose-500">Please enter a valid email format.</p>
                )}

                <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-2xl border px-4 py-2.5 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
                    password.length > 0 && !isValidPassword(password)
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/40"
                      : "border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-400/15"
                  }`}
                  placeholder="Password"
                  autoComplete="new-password"
                />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && !isValidPassword(password) && (
                  <p className="text-xs text-rose-500">
                    Use 8+ chars with at least 1 number and 1 special symbol.
                  </p>
                )}

                <div className="relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    className={`w-full rounded-2xl border px-4 py-2.5 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-4 ${
                      confirm.length > 0 && confirm !== password
                        ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-200/40"
                        : "border-slate-200 bg-white focus:border-indigo-400 focus:ring-indigo-400/15"
                    }`}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-indigo-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-xs text-rose-500">Passwords do not match.</p>
                )}

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={!canSubmit}
                  className="mt-2 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 py-3 font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:hover:brightness-100"
                >
                  {loading ? "Creating..." : "Sign up"}
                </button>

                <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="font-semibold text-slate-700">Personal AI workspace</p>
                      <p>Organize projects and insights in one place.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    <div>
                      <p className="font-semibold text-slate-700">Guided idea flow</p>
                      <p>Get from concept to clarity with AI prompts.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowLegal(true)}
                    className="text-sm text-slate-500 transition hover:text-slate-800"
                  >
                    Terms & Privacy
                  </button>
                </div>

              </div>
            </div>

            <div className="relative hidden overflow-hidden lg:flex items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url(/test2.png)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/80 via-indigo-600/65 to-violet-500/55" />
              <div className="absolute inset-0 opacity-70 [background:radial-gradient(420px_260px_at_20%_20%,rgba(255,255,255,0.35),transparent_60%),radial-gradient(360px_240px_at_80%_60%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="absolute left-8 top-10 h-3.5 w-3.5 rounded-full bg-white/75" />
              <div className="absolute left-16 bottom-14 h-3 w-3 rounded-full bg-white/65" />
              <div className="absolute right-10 top-20 h-4 w-4 rounded-full bg-white/75" />
              <div className="absolute right-16 bottom-10 h-3.5 w-3.5 rounded-full bg-white/65" />
              <div className="absolute right-24 top-[35%] h-3 w-3 rounded-full bg-white/60" />
              <div className="absolute left-24 top-[50%] h-2.5 w-2.5 rounded-full bg-white/60" />
              <div className="absolute right-28 bottom-[35%] h-2.5 w-2.5 rounded-full bg-white/60" />
              <div className="relative z-10 px-12 text-center text-white">
                <h3 className={`${playfair.className} text-4xl font-semibold tracking-tight`}>
                  Create a workspace
                </h3>
                <p className={`${playfair.className} mt-3 text-2xl text-white/95`}>
                  for ideas that move fast.
                </p>
                <p className="mt-4 text-sm text-white/85">
                  Turn scattered thoughts into a focused plan with guided AI
                  prompts, smart summaries, and organized project spaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLegal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Terms &amp; Privacy</h2>
              <button
                type="button"
                onClick={() => setShowLegal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                x
              </button>
            </div>

            <div className="flex gap-3 mt-4 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setLegalTab("terms")}
                className={`px-3 py-1 rounded-lg text-sm ${
                  legalTab === "terms"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setLegalTab("privacy")}
                className={`px-3 py-1 rounded-lg text-sm ${
                  legalTab === "privacy"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {legalTab === "terms" && (
              <div className="mt-4 text-sm text-slate-700 leading-relaxed space-y-4">
                <p className="text-xs text-slate-500">
                  Last Updated: <span className="font-medium">27 January 2026</span>
                </p>

                <p>
                  Welcome to <strong>IdeaSense-AI</strong> (“the Service”), operated by{" "}
                  <strong>Money Thief</strong> (“we”, “our”, or “us”). By accessing or using
                  IdeaSense-AI, you agree to these Terms of Service (“Terms”). If you do not agree,
                  please do not use our Service.
                </p>

                <h3 className="font-semibold text-slate-900">1. Eligibility</h3>
                <p>
                  You must be at least 18 years old, or have legal permission in your jurisdiction,
                  to use this Service. By using IdeaSense-AI, you confirm that you have the legal
                  capacity to enter into these Terms.
                </p>

                <h3 className="font-semibold text-slate-900">2. Account Registration</h3>
                <p>
                  To use certain features, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Keep your login credentials secure</li>
                  <li>Be responsible for all activity under your account</li>
                </ul>
                <p>We may suspend or terminate accounts that violate these Terms.</p>

                <h3 className="font-semibold text-slate-900">3. Use of the Service</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the Service for unlawful, harmful, or abusive activities</li>
                  <li>Attempt to disrupt, attack, or overload the system</li>
                  <li>Reverse engineer, scrape, or copy our code, data, or models</li>
                  <li>Upload harmful content (including malware, spam, or offensive material)</li>
                </ul>
                <p>We reserve the right to monitor usage to maintain system security.</p>

                <h3 className="font-semibold text-slate-900">4. User Content</h3>
                <p>
                  You may input text, ideas, or other content into the Service (“User Content”).
                  You retain ownership of your content.
                </p>
                <p>
                  By using the Service, you grant us a non-exclusive, worldwide, royalty-free
                  licence to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Process your content to provide and operate the Service</li>
                  <li>Use it to improve the performance and reliability of the Service</li>
                  <li>Store it for backup, logging, and support purposes</li>
                </ul>
                <p>We do not claim ownership of your business ideas or projects.</p>

                <h3 className="font-semibold text-slate-900">5. AI-Generated Output</h3>
                <p>
                  IdeaSense-AI uses artificial intelligence to generate suggestions and
                  evaluations. AI output may:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be incomplete or inaccurate</li>
                  <li>Reflect bias present in training data</li>
                  <li>Not be suitable for professional, financial, legal, or medical decisions</li>
                </ul>
                <p>
                  You agree that you use AI output <strong>at your own risk</strong>, and that we
                  are not responsible for any decisions or outcomes based on AI-generated
                  information.
                </p>

                <h3 className="font-semibold text-slate-900">6. Intellectual Property</h3>
                <p>
                  All intellectual property related to the Service—including but not limited to the
                  user interface, design, algorithms, code, prompts, and branding—belongs to{" "}
                  <strong>Money Thief</strong>.
                </p>
                <p>
                  Users may not copy, distribute, modify, resell, or create derivative works from
                  the Service without our explicit written permission.
                </p>

                <h3 className="font-semibold text-slate-900">7. Termination</h3>
                <p>We may suspend or terminate your account if:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You violate these Terms</li>
                  <li>You misuse or abuse the Service</li>
                  <li>
                    It is required for legal reasons, system security, or to protect other users
                  </li>
                </ul>
                <p>You may stop using the Service at any time.</p>

                <h3 className="font-semibold text-slate-900">8. Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted under applicable law, the Service is provided{" "}
                  <strong>“as is” and “as available”</strong>. We do not guarantee:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Uninterrupted or error-free operation</li>
                  <li>That all vulnerabilities will be prevented or corrected</li>
                  <li>That AI outputs will always be accurate, reliable, or suitable for your use</li>
                </ul>
                <p>
                  We are not liable for any indirect, incidental, special, consequential, or
                  punitive damages, or for any loss of profits, data, or business, arising out of
                  or related to your use of the Service.
                </p>

                <h3 className="font-semibold text-slate-900">9. Changes to These Terms</h3>
                <p>
                  We may update these Terms from time to time. If we make significant changes, we
                  will provide notice through the website or by email. Your continued use of the
                  Service after changes are published means you accept the updated Terms.
                </p>

                <h3 className="font-semibold text-slate-900">10. Governing Law</h3>
                <p>
                  These Terms are governed by the laws of <strong>New Zealand</strong>. Any disputes
                  arising from or relating to these Terms shall be handled within the exclusive
                  jurisdiction of the courts of New Zealand.
                </p>

                <h3 className="font-semibold text-slate-900">11. Contact</h3>
                <p>
                  If you have questions about these Terms, please contact us at:{" "}
                  <a
                    href="mailto:ideasense.ai.team@gmail.com"
                    className="text-sky-600 hover:underline"
                  >
                    ideasense.ai.team@gmail.com
                  </a>
                  .
                </p>
              </div>
            )}

            {legalTab === "privacy" && (
              <div className="mt-4 text-sm text-slate-700 leading-relaxed space-y-4">
                <p className="text-xs text-slate-500">
                  Last Updated: <span className="font-medium">27 January 2026</span>
                </p>

                <p>
                  This Privacy Policy explains how <strong>IdeaSense-AI</strong>, operated by{" "}
                  <strong>Money Thief</strong>, collects, uses, and protects your personal
                  information. By using our Service, you agree to this Policy.
                </p>

                <h3 className="font-semibold text-slate-900">1. Information We Collect</h3>

                <p className="font-medium text-slate-900">1.1 Information You Provide</p>
                <p>We may collect the following information when you use the Service:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Login and account information</li>
                  <li>Project ideas, text inputs, and messages you enter into the Service</li>
                </ul>

                <p className="font-medium text-slate-900">1.2 Automatically Collected Data</p>
                <p>We may also collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address and approximate location</li>
                  <li>Browser type, device information, and operating system</li>
                  <li>Usage logs and interaction data (e.g., pages visited, actions taken)</li>
                  <li>Cookies and similar technologies for authentication and session management</li>
                </ul>

                <h3 className="font-semibold text-slate-900">2. How We Use Your Data</h3>
                <p>We use your information to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide and operate the core functionality of the Service</li>
                  <li>Generate AI-based suggestions and evaluations for your projects</li>
                  <li>Improve model performance, user experience, and product reliability</li>
                  <li>Prevent abuse, fraud, and security threats</li>
                  <li>Communicate with you about updates, changes, or support issues</li>
                  <li>Maintain backups, logs, and operational records</li>
                </ul>
                <p>We do not sell personal data.</p>

                <h3 className="font-semibold text-slate-900">
                  3. Legal Basis for Data Processing
                </h3>
                <p>Where applicable (e.g. under GDPR-like frameworks), we process data based on:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your consent</li>
                  <li>Contract necessity (to provide the Service you requested)</li>
                  <li>Legitimate interests (e.g., security, product improvement)</li>
                </ul>

                <h3 className="font-semibold text-slate-900">4. Data Sharing</h3>
                <p>We may share data with trusted third parties that help operate the Service:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>AI providers (e.g., OpenAI, AWS Bedrock, or similar services)</li>
                  <li>Cloud hosting and infrastructure providers (e.g., AWS, Vercel)</li>
                  <li>Analytics or monitoring tools (if implemented)</li>
                  <li>Security and logging services</li>
                </ul>
                <p>
                  We share only what is necessary to provide, maintain, and improve the Service. We
                  do not sell or rent your data to advertisers.
                </p>

                <h3 className="font-semibold text-slate-900">5. Cookies</h3>
                <p>We use cookies and similar technologies to support:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Authentication and login sessions</li>
                  <li>Basic usage analytics and performance</li>
                  <li>User experience improvements</li>
                </ul>
                <p>
                  You may disable cookies in your browser, but some features of the Service may not
                  work properly if you do so.
                </p>

                <h3 className="font-semibold text-slate-900">6. Data Retention</h3>
                <p>We retain your data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>For as long as your account is active</li>
                  <li>As needed for security, backup, or operational purposes</li>
                  <li>Until you request deletion, where applicable and technically reasonable</li>
                </ul>
                <p>
                  When data is no longer required, we take reasonable steps to delete or anonymise
                  it.
                </p>

                <h3 className="font-semibold text-slate-900">7. Your Rights</h3>
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Withdraw consent where processing is based on consent</li>
                  <li>Request a copy of your data in a portable format</li>
                  <li>Close your account</li>
                </ul>
                <p>
                  To exercise these rights, contact us at{" "}
                  <a
                    href="mailto:ideasense.ai.team@gmail.com"
                    className="text-sky-600 hover:underline"
                  >
                    ideasense.ai.team@gmail.com
                  </a>
                  .
                </p>

                <h3 className="font-semibold text-slate-900">8. Data Security</h3>
                <p>We implement reasonable technical and organisational safeguards, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encrypted transmission via HTTPS</li>
                  <li>Hashed passwords</li>
                  <li>Role-based access control where applicable</li>
                  <li>Secure cloud infrastructure</li>
                </ul>
                <p>
                  However, no system is completely secure, and we cannot guarantee absolute
                  protection against all threats.
                </p>

                <h3 className="font-semibold text-slate-900">9. Third-Party Links</h3>
                <p>
                  The Service may contain links to external websites or services. We are not
                  responsible for their content, security, or privacy practices. We encourage you to
                  review the privacy policies of any third-party sites you visit.
                </p>

                <h3 className="font-semibold text-slate-900">10. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. If significant changes occur,
                  we will provide notice through the website or by email. Your continued use of the
                  Service after changes are published means you accept the updated Policy.
                </p>

                <h3 className="font-semibold text-slate-900">11. Contact</h3>
                <p>
                  For privacy-related inquiries, please contact us at:{" "}
                  <a
                    href="mailto:ideasense.ai.team@gmail.com"
                    className="text-sky-600 hover:underline"
                  >
                    ideasense.ai.team@gmail.com
                  </a>
                  .
                </p>
              </div>
            )}

            <p className="mt-4 text-[11px] text-slate-400">
              This page is provided for informational purposes only and does not constitute legal
              advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
