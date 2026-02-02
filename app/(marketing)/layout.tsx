"use client";

import { AuthProvider } from "@/src/context/AuthContext";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div
        className="min-h-screen"
        style={{
          backgroundImage: "url('/bg1_greenblue.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {children}
      </div>
    </AuthProvider>
  );
}
