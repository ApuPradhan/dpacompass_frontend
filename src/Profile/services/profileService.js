
import { fetchWithAuth } from "../../utilities/fetchWithAuth";

const PROFILE_URL = "/api/auth/profile/";
const CHANGE_PASSWORD_URL = "/api/auth/change-password/";

// GET: Retrieve logged-in user's profile
export const getProfile = async () => {

    const response = await fetchWithAuth(PROFILE_URL, {
        method: "GET",
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(
            data.message || "Unable to retrieve profile."
        );
    }

    return data.data;
};
// PATCH: Update logged-in user's profile
export const updateProfile = async (profileData) => {
    const response = await fetchWithAuth(PROFILE_URL, {
        method: "PATCH",
        body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage =
            data.message ||
            Object.values(data.errors || {})
                .flat()
                .join(" ") ||
            "Unable to update profile.";

        throw new Error(errorMessage);
    }

    return data.data;
};

// POST: Change logged-in user's password
export const changePassword = async (passwordData) => {
    const response = await fetchWithAuth(CHANGE_PASSWORD_URL, {
        method: "POST",
        body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage =
            data.message ||
            Object.values(data.errors || {})
                .flat()
                .join(" ") ||
            "Unable to change password.";

        throw new Error(errorMessage);
    }

    return data;
};
