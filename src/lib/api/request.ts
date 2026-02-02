// src/lib/api/request.ts

const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "";
const TOKEN_KEY = "access_token";
let authExpiredNotified = false;

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

function getBaseUrl(): string {
    return BASE_URL;
}

function notifyAuthExpired() {
    if (typeof window === "undefined") return;
    if (authExpiredNotified) return;
    authExpiredNotified = true;
    window.dispatchEvent(new CustomEvent("auth:expired"));
}

export function resetAuthExpiredNotification() {
    authExpiredNotified = false;
}

// 后端统一错误结构
export interface ApiError {
    message: string;
    code: string;
}

// 后端统一响应结构：所有接口都长这样
export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
    const token = getAccessToken();
    const res = await fetch(`${getBaseUrl()}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
    });//对option变量的headers加入了 "Content-Type": "application/json" 这个键值对 然后传入fetch

    let json: ApiResponse<T>;  //我现在声明一个叫 json 的变量，它的类型是 ApiResponse<T>
    try { 
    json = (await res.json()) as ApiResponse<T>;
    } catch (e) {
        // 一般不会发生，容错一下
        if (res.status === 401) notifyAuthExpired();
        throw new Error(`Invalid JSON response from ${path}`);
    }

    if (!res.ok || json.error) {
        if (res.status === 401) notifyAuthExpired();
        const err = json.error ?? {
            message: res.statusText,
            code: String(res.status),
        };
        // 这里你之后可以换成自定义 Error 类型
        throw new Error(`${err.code}: ${err.message}`);
    }

    if (json.data == null) {
        throw new Error(`Empty data in response from ${path}`);
    }

    return json.data;
}

async function requestNoData(path: string, options: RequestInit): Promise<void> {
    const token = getAccessToken();
    const res = await fetch(`${getBaseUrl()}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
    });

    let json: ApiResponse<unknown> | null = null;
    try {
        json = (await res.json()) as ApiResponse<unknown>;
    } catch (e) {
        if (res.status === 401) notifyAuthExpired();
        if (res.ok) {
            return;
        }
        throw new Error(`Invalid JSON response from ${path}`);
    }

    if (!res.ok || json?.error) {
        if (res.status === 401) notifyAuthExpired();
        const err = json?.error ?? {
            message: res.statusText,
            code: String(res.status),
        };
        throw new Error(`${err.code}: ${err.message}`);
    }
}

// GET
export function apiGet<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
}

// POST
export function apiPost<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

// PATCH
export function apiPatch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
}

export function apiPatchNoData(path: string, body: unknown): Promise<void> {
    return requestNoData(path, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
}

// PUT
export function apiPut<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

// DELETE
export function apiDelete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
}
