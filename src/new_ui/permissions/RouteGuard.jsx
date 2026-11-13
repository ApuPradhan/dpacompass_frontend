
import { Navigate, useLocation } from "react-router-dom";

import { useAuthContext } from "../contexts/AuthContext";
import { usePermissionContext } from "../contexts/PermissionContext";

const RouteGuard = ({
    permission,
    permissions = [],
    requireAll = false,
    children,
}) => {
    const location = useLocation();

    const { isAuthenticated } = useAuthContext();

    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    } = usePermissionContext();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    let isAllowed = true;

    if (permission) {
        isAllowed = hasPermission(permission);
    } else if (permissions.length > 0) {
        isAllowed = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    }

    if (!isAllowed) {
        return (
            <Navigate
                to="/new-ui/unauthorized"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

export default RouteGuard;
