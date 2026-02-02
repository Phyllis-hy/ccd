"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { FileText, Info, ScrollText, TriangleAlert } from "lucide-react";

export default function PrimaryNav() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showRiskGuide, setShowRiskGuide] = useState(false);
  const [showStageGuide, setShowStageGuide] = useState(false);

  // ✅ 新增：Terms & Privacy 的状态
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy">("terms");

  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";
  const avatarText = displayName.slice(0, 2).toUpperCase();
  const renderPortal = (node: React.ReactNode) =>
    typeof document === "undefined" ? node : createPortal(node, document.body);

  return (
    <nav className="print-hide flex flex-col items-center bg-gradient-to-b from-sky-50/70 via-blue-50/60 to-white/70 text-slate-500 w-14 py-4 gap-6 border-r border-slate-200/70 backdrop-blur">
      {/* 顶部 Logo：进入 Profile */}
      <Link href="/profile" className="block">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[11px] shadow cursor-pointer hover:brightness-110 transition">
          {avatarText}
        </div>
      </Link>

      {/* 中间功能按钮 */}
      <div className="flex-1 flex flex-col items-center gap-3 mt-4">
        
        <button
          type="button"
          onClick={() => setShowRiskGuide(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 hover:bg-amber-50 text-sm shadow-sm border border-slate-200/70"
          aria-label="Risk rating guide"
        >
          <TriangleAlert className="h-4 w-4 text-amber-600" />
        </button>
        <button
          type="button"
          onClick={() => setShowStageGuide(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 hover:bg-sky-100 text-sm shadow-sm border border-slate-200/70"
          aria-label="Stage summary guide"
        >
          <FileText className="h-4 w-4 text-slate-600" />
        </button>
        
        {/* ✅ 新增：Terms & Privacy 按钮 */}
        <button
          type="button"
          onClick={() => setShowLegal(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 hover:bg-sky-100 text-base shadow-sm border border-slate-200/70"
          aria-label="Terms & Privacy"
        >
          <ScrollText className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* ✅ Risk Guide Modal（原有） */}
      {showRiskGuide &&
        renderPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Report Risk Guide</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowRiskGuide(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                x
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="grid grid-cols-[95px_120px_140px_1fr_160px] gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                <div>Score Range</div>
                <div>Risk Tier</div>
                <div>Decision Band</div>
                <div>Common Reasons</div>
                <div>Suggested Action</div>
              </div>
              {[
                {
                  range: "0 - 39",
                  level: "Red / Very High",
                  band: "red",
                  badgeClass: "bg-red-100 text-red-700",
                  reason:
                    "Core problem or demand evidence is insufficient; key assumptions lack validation.",
                  action: "Pause investment and validate with user interviews and pain-point evidence.",
                },
                {
                  range: "40 - 54",
                  level: "Deep Orange / High",
                  band: "amber",
                  badgeClass: "bg-orange-200 text-orange-800",
                  reason:
                    "Market size or willingness to pay is unclear; differentiation is weak.",
                  action: "Narrow the segment and validate competitors and pricing.",
                },
                {
                  range: "55 - 69",
                  level: "Orange / Medium",
                  band: "amber",
                  badgeClass: "bg-amber-100 text-amber-800",
                  reason: "Some signals exist, but GTM or feasibility gaps remain.",
                  action: "Run a small pilot and validate repeatability and conversion.",
                },
                {
                  range: "70 - 84",
                  level: "Light Green / Low",
                  band: "green",
                  badgeClass: "bg-lime-100 text-lime-800",
                  reason: "Key path is clearer, but execution pace still has risk.",
                  action: "Proceed by milestones and keep monitoring key metrics.",
                },
                {
                  range: "85 - 100",
                  level: "Green / Very Low",
                  band: "green",
                  badgeClass: "bg-emerald-200 text-emerald-800",
                  reason:
                    "Demand is clear, differentiation is strong, and scaling path is clear.",
                  action: "Accelerate growth and invest in scale.",
                },
              ].map((row) => (
                <div
                  key={row.range}
                  className="grid grid-cols-[95px_120px_140px_1fr_160px] gap-3 rounded-2xl border border-slate-200/70 px-4 py-3 text-slate-700"
                >
                  <div className="font-semibold text-slate-900">{row.range}</div>
                  <div className="font-semibold">{row.level}</div>
                  <div>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase",
                        row.badgeClass,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {row.band}
                    </span>
                  </div>
                  <div className="text-slate-600">{row.reason}</div>
                  <div className="text-slate-600">{row.action}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-xs text-slate-300">
              Example: Total score 35 = red / very high risk. Prioritize validating demand and the
              core problem.
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Note: Ranges and decision bands are front-end reference mappings for explanation.
            </div>
          </div>
        </div>
        )}

      {/* ✅ Stage Guide Modal（原有） */}
      {showStageGuide &&
        renderPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Stage Summary Format Guide</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowStageGuide(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                x
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Problem Stage</div>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                  <li>Core problem and primary pain points</li>
                  <li>Primary users/buyers and usage context</li>
                  <li>Current alternatives and gaps</li>
                  <li>Value proposition or intended outcomes</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Market Stage</div>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                  <li>Target market/segment and scope</li>
                  <li>Competition and differentiation</li>
                  <li>Business model, pricing, willingness to pay</li>
                  <li>Channels and GTM assumptions</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Tech Stage</div>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-600">
                  <li>Implementation approach and key components</li>
                  <li>Data sources or required integrations</li>
                  <li>Cost, risk, and compliance constraints</li>
                  <li>Delivery plan or milestones</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-xs text-slate-300">
              Note: Stage summaries are structural prompts and do not include scoring or risk tiers.
            </div>
          </div>
        </div>
        )}

      {/* ✅ 新增：Terms & Privacy Modal（完整内容，不缩减） */}
      {showLegal &&
        renderPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
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

            {/* Tabs */}
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

            {/* Terms Content */}
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

            {/* Privacy Content */}
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
    </nav>
  );
}
