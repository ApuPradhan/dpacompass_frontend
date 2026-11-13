
import apiClient from "./apiClient";

/**
 * Fetch permissions assigned to the currently logged-in user.
 *
 * @param {string} endpoint - Actual Django permissions API endpoint.
 * @returns {Promise<Array>} User permissions.
 */
export const getUserPermissions = async (endpoint) => {
    if (!endpoint) {
        throw new Error("Permissions API endpoint is required.");
    }

    const response = await apiClient.get(endpoint);

    if (!response.ok) {
        throw new Error("Unable to retrieve user permissions.");
    }

    const data = await response.json();

    // Supports either a direct array or an object containing permissions.
    const permissions = Array.isArray(data)
        ? data
        : data?.permissions;

    if (!Array.isArray(permissions)) {
        throw new Error(
            "Invalid permissions response received from the server."
        );
    }

    return permissions;
};
