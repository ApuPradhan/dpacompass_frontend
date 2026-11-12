
export const validatePasswordChange = (passwords) => {
    const {
        old_password,
        new_password,
        confirm_password,
    } = passwords;

    if (!old_password || !new_password || !confirm_password) {
        return {
            valid: false,
            message: "All password fields are required.",
        };
    }

    if (new_password.length < 8) {
        return {
            valid: false,
            message: "Password must contain at least 8 characters.",
        };
    }

    if (!/[A-Z]/.test(new_password)) {
        return {
            valid: false,
            message: "Password must contain an uppercase letter.",
        };
    }

    if (!/[a-z]/.test(new_password)) {
        return {
            valid: false,
            message: "Password must contain a lowercase letter.",
        };
    }

    if (!/[0-9]/.test(new_password)) {
        return {
            valid: false,
            message: "Password must contain a number.",
        };
    }

    if (!/[^A-Za-z0-9]/.test(new_password)) {
        return {
            valid: false,
            message: "Password must contain a special character.",
        };
    }

    if (new_password !== confirm_password) {
        return {
            valid: false,
            message: "New passwords do not match.",
        };
    }

    if (old_password === new_password) {
        return {
            valid: false,
            message: "New password must differ from current password.",
        };
    }

    return {
        valid: true,
        message: "",
    };
};
