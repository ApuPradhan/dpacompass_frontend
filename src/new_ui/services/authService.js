
import { expireSession } from "../../services/fetchWithAuth";

/**
 * Retrieve the currently logged-in user.
 */
export const getCurrentUser = () => {
    try {
        const storedUser = localStorage.getItem("user");

        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to retrieve current user:", error);
        return null;
    }
};

/**
 * Check whether an access token exists.
 *
 * This checks token presence, not token validity.
 */
export const hasActiveSession = () => {
    return Boolean(localStorage.getItem("access"));
};

/**
 * Check authentication state.
 */
export const isAuthenticated = () => {
    return hasActiveSession() && Boolean(getCurrentUser());
};

/**
 * End the current session using existing authentication logic.
 */
export const logout = () => {
    expireSession();
};
