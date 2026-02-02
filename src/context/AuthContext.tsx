// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { resetAuthExpiredNotification } from "@/src/lib/api/request";

type User = {
  id?: string;   // user uuid (sub)
  email?: string;
  name?: string;
  role?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  authHeader: HeadersInit;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";
const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

/** 轻量 JWT decode（不校验签名，只读 payload） */
function decodeJwtPayload(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const sessionExpiredRef = useRef(false);

  // ✅ 刷新恢复登录态：token + user
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        // 没存 user 的情况下尝试从 JWT 里读 email/sub
        const payload = decodeJwtPayload(savedToken);
        if (payload) {
          const inferred: User = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          };
          // 只要有点信息就存
          if (inferred.email || inferred.id || inferred.name) {
            setUser(inferred);
            localStorage.setItem(USER_KEY, JSON.stringify(inferred));
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      if (sessionExpiredRef.current) return;
      sessionExpiredRef.current = true;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      const redirect =
        typeof window === "undefined"
          ? "/login"
          : `/login?redirect=${encodeURIComponent(
              window.location.pathname + window.location.search
            )}`;
      if (typeof window !== "undefined") {
        window.location.href = redirect;
      }
    };

    window.addEventListener("auth:expired", handleSessionExpired as EventListener);
    return () => {
      window.removeEventListener("auth:expired", handleSessionExpired as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY && event.key !== USER_KEY) return;
      const tokenNow = localStorage.getItem(TOKEN_KEY);
      if (tokenNow) return;

      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      sessionExpiredRef.current = false;
      resetAuthExpiredNotification();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        const redirect = `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
        window.location.href = redirect;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid email or password");
    }

    const data = await res.json();
    const accessToken = data?.access_token;

    if (!accessToken) {
      throw new Error("No access_token returned from server");
    }

    // ✅ 1) 保存 token
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setIsLoggedIn(true);
    sessionExpiredRef.current = false;
    resetAuthExpiredNotification();

    // ✅ 2) 优先用后端返回的 user（如果你后端有返回的话）
    // 兼容字段名：data.user / data.data.user / data.profile 等（按你实际情况可再加）
    const apiUser: User | null =
      data?.user || data?.data?.user || data?.data || null;

    if (apiUser) {
      setUser(apiUser);
      localStorage.setItem(USER_KEY, JSON.stringify(apiUser));
      return;
    }

    // ✅ 3) 如果后端没返回 user，就从 JWT 推断（至少拿 email）
    const payload = decodeJwtPayload(accessToken);
    const inferred: User = {
      id: payload?.sub,
      email: payload?.email || email, // 没有 email claim 就用登录时输入的 email
      name: payload?.name,
      role: payload?.role,
    };

    setUser(inferred);
    localStorage.setItem(USER_KEY, JSON.stringify(inferred));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    sessionExpiredRef.current = false;
    resetAuthExpiredNotification();
  };

  const authHeader = useMemo<HeadersInit>(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, user, login, logout, authHeader }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
