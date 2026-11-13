
import { fetchWithAuth } from "../../services/fetchWithAuth";

/**
 * Central API client for the main DPACOMPASS backend.
 *
 * Authentication, token refresh and session expiration
 * are handled by the existing fetchWithAuth utility.
 */

const apiClient = {
    async request(method, url, data = undefined, options = {}) {
        const headers = {
            ...options.headers,
        };

        let body;

        if (data !== undefined && data !== null) {
            if (data instanceof FormData) {
                // Browser sets the multipart boundary automatically.
                body = data;
            } else {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify(data);
            }
        }

        const response = await fetchWithAuth(url, {
            ...options,
            method,
            headers,
            ...(body !== undefined && { body }),
        });

        return response;
    },

    get(url, options = {}) {
        return this.request("GET", url, undefined, options);
    },

    post(url, data, options = {}) {
        return this.request("POST", url, data, options);
    },

    put(url, data, options = {}) {
        return this.request("PUT", url, data, options);
    },

    patch(url, data, options = {}) {
        return this.request("PATCH", url, data, options);
    },

    delete(url, options = {}) {
        return this.request("DELETE", url, undefined, options);
    },
};

export default apiClient;
