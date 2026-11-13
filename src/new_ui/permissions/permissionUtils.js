
/**
 * Check whether a user has a specific permission.
 */
export const hasPermission = (userPermissions = [], permission) => {
    if (!Array.isArray(userPermissions) || !permission) {
        return false;
    }

    return userPermissions.includes(permission);
};

/**
 * Check whether a user has at least one of the required permissions.
 */
export const hasAnyPermission = (
    userPermissions = [],
    requiredPermissions = []
) => {
    if (
        !Array.isArray(userPermissions) ||
        !Array.isArray(requiredPermissions) ||
        requiredPermissions.length === 0
    ) {
        return false;
    }

    return requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
    );
};

/**
 * Check whether a user has all required permissions.
 */
export const hasAllPermissions = (
    userPermissions = [],
    requiredPermissions = []
) => {
    if (
        !Array.isArray(userPermissions) ||
        !Array.isArray(requiredPermissions) ||
        requiredPermissions.length === 0
    ) {
        return false;
    }

    return requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
    );
};

/**
 * Filter navigation items based on user permissions.
 */
export const filterNavigationByPermissions = (
    navigationItems = [],
    userPermissions = []
) => {
    return navigationItems.filter(
        (item) =>
            !item.permission ||
            hasPermission(userPermissions, item.permission)
    );
};
