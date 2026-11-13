
import { usePermissionContext } from "../contexts/PermissionContext";

const PermissionGuard = ({
    permission,
    permissions = [],
    requireAll = false,
    children,
    fallback = null,
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    } = usePermissionContext();

    let isAllowed = true;

    if (permission) {
        isAllowed = hasPermission(permission);
    } else if (permissions.length > 0) {
        isAllowed = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    return isAllowed ? children : fallback;
};

export default PermissionGuard;
