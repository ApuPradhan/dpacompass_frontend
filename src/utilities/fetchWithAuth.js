
import { API_BASE_URL } from "../config";

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export const expireSession = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    window.dispatchEvent(
        new CustomEvent(SESSION_EXPIRED_EVENT)
    );
};

let refreshPromise = null;

const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
        throw new Error("Refresh token unavailable.");
    }

    if (!refreshPromise) {
        refreshPromise = (async () => {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/refresh/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.access) {
                throw new Error(
                    data.detail || "Session refresh failed."
                );
            }

            // Save rotated tokens
            localStorage.setItem("access", data.access);

            if (data.refresh) {
                localStorage.setItem("refresh", data.refresh);
            }

            return data.access;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

export const fetchWithAuth = async (url, options = {}) => {
    const access = localStorage.getItem("access");

    if (!access) {
        expireSession();
        throw new Error("Session expired. Please sign in again.");
    }

    const makeRequest = (token) => {
        const headers = new Headers(options.headers || {});

        headers.set("Authorization", `Bearer ${token}`);

        if (options.body instanceof FormData) {
            headers.delete("Content-Type");
        } else if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        return fetch(
            `${API_BASE_URL.replace(/\/$/, "")}${url}`,
            {
                ...options,
                headers,
            }
        );
    };

    // First request
    let response = await makeRequest(access);

    if (response.status !== 401) {
        return response;
    }

    // Access token may have expired. Try refreshing.
    try {
        const newAccess = await refreshAccessToken();

        // Retry the original API request
        response = await makeRequest(newAccess);

        if (response.status === 401) {
            // The refreshed access token was also rejected.
            expireSession();
        }

        return response;

    } catch (error) {
        console.error("JWT refresh failed:", error);

        expireSession();

        throw new Error(
            "Your session has expired. Please sign in again."
        );
    }
};
