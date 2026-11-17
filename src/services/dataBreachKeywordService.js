
import { DATA_BREACH_API_BASE_URL } from "../config";

const BASE_URL = `${DATA_BREACH_API_BASE_URL.replace(/\/+$/, "")}/api/keywords`;

const request = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const error = new Error(
                data?.detail ||
                data?.message ||
                `Request failed with status ${response.status}`
            );

            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        console.error("PII-in-Transit Scanner Keyword API Error:", error);
        throw error;
    }
};

// --------------------------------------------------
// COMPONENT APIs
// --------------------------------------------------

export const getKeywordComponents = () => {
    return request("/components/");
};

// --------------------------------------------------
// CATEGORY / GROUP APIs
// --------------------------------------------------

export const getKeywordGroups = (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.component) {
        params.append("component", filters.component);
    }

    if (filters.is_active !== undefined && filters.is_active !== null) {
        params.append("is_active", String(filters.is_active));
    }

    const query = params.toString();

    return request(`/groups/${query ? `?${query}` : ""}`);
};

export const createKeywordGroup = (payload) => {
    return request("/groups/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const getKeywordGroup = (groupId) => {
    return request(`/groups/${groupId}/`);
};

export const updateKeywordGroup = (groupId, payload) => {
    return request(`/groups/${groupId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const deactivateKeywordGroup = (groupId) => {
    return request(`/groups/${groupId}/`, {
        method: "DELETE",
    });
};

// --------------------------------------------------
// KEYWORD APIs
// --------------------------------------------------

export const getKeywords = (groupId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.is_active !== undefined && filters.is_active !== null) {
        params.append("is_active", String(filters.is_active));
    }

    const query = params.toString();

    return request(
        `/groups/${groupId}/keywords/${query ? `?${query}` : ""}`
    );
};

export const createKeyword = (groupId, payload) => {
    return request(`/groups/${groupId}/keywords/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const updateKeyword = (keywordId, payload) => {
    return request(`/keywords/${keywordId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const deactivateKeyword = (keywordId) => {
    return request(`/keywords/${keywordId}/`, {
        method: "DELETE",
    });
};
