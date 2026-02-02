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

// Backend unified error structure
export interface ApiError {
    message: string;
    code: string;
}

// Backend unified response structure: all endpoints follow this format
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
    }); // Add 'Content-Type': 'application/json' to option headers and pass to fetch

    let json: ApiResponse<T>;  // Declare a json variable of type ApiResponse<T>
    try { 
    json = (await res.json()) as ApiResponse<T>;
    } catch (e) {
        // Generally won't happen, adding fallback
        if (res.status === 401) notifyAuthExpired();
        throw new Error(`Invalid JSON response from ${path}`);
    }

    if (!res.ok || json.error) {
        if (res.status === 401) notifyAuthExpired();
        const err = json.error ?? {
            message: res.statusText,
            code: String(res.status),
        };
        // You can replace this with a custom Error type later
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
