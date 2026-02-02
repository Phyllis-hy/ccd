// src/components/profile/ProfileHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfileHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();            // 清 token + 清 user
    router.push("/login");
  };

  // 显示名优先级：name > email前缀 > User
  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  // 头像字母（取前两个字母）
  const avatarText = displayName.slice(0, 2).toUpperCase();

  return (
    <section className="w-full rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-5">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/70 bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-100 flex items-center justify-center text-lg font-semibold text-sky-700">
          {avatarText}
        </div>

        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-semibold text-slate-900">{displayName}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role || "User"}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Active</span>
            </div>
            <span className="opacity-70">Logged in</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-sm font-medium text-white shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
