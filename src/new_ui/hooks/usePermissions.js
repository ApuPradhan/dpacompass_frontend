
import { usePermissionContext } from "../contexts/PermissionContext";

const usePermissions = () => {
    const {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        updatePermissions,
        resetPermissions,
        isUsingBackendPermissions,
    } = usePermissionContext();

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        updatePermissions,
        resetPermissions,
        isUsingBackendPermissions,
    };
};

export default usePermissions;
