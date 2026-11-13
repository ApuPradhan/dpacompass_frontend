
import apiClient from "./apiClient";

/**
 * Retrieve user details.
 *
 * @param {string} endpoint - Actual Django user-details endpoint.
 */
export const getUserDetails = async (endpoint) => {
    if (!endpoint) {
        throw new Error("User details API endpoint is required.");
    }

    const response = await apiClient.get(endpoint);

    if (!response.ok) {
        throw new Error("Unable to retrieve user details.");
    }

    return response.json();
};

/**
 * Update user profile information.
 *
 * @param {string} endpoint - Actual Django profile-update endpoint.
 * @param {Object} userData - Updated profile information.
 */
export const updateUserDetails = async (endpoint, userData) => {
    if (!endpoint) {
        throw new Error("Profile update API endpoint is required.");
    }

    const response = await apiClient.patch(endpoint, userData);

    if (!response.ok) {
        throw new Error("Unable to update user profile.");
    }

    return response.json();
};

/**
 * Change the user's password.
 *
 * @param {string} endpoint - Actual Django password-change endpoint.
 * @param {Object} passwordData - Password change payload.
 */
export const changePassword = async (endpoint, passwordData) => {
    if (!endpoint) {
        throw new Error("Password change API endpoint is required.");
    }

    const response = await apiClient.post(endpoint, passwordData);

    if (!response.ok) {
        throw new Error("Unable to change password.");
    }

    return response.json();
};
