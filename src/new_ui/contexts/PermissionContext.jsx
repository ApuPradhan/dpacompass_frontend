
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { useAuthContext } from "./AuthContext";

const PermissionContext = createContext(null);

// Temporary permissions until Django provides dynamic RBAC.
const LEGACY_ROLE_PERMISSIONS = {
    1: [
        "dashboard.view",
        "applications.view",
        "applications.manage",
        "audits.view",
        "audits.manage",
        "self_check.view",
        "consent_scanner.view",
        "consent_scanner.create",
        "breach_scanner.view",
        "breach_scanner.create",
        "database_scanner.view",
        "checklist.manage",
        "rules_evidence.manage",
        "domain.manage",
        "remediation.manage",
        "reports.view",
        "users.manage",
        "profile.view",
        "training.view",
    ],

    2: [
        "dashboard.view",
        "applications.view",
        "audits.view",
        "audits.execute",
        "self_check.view",
        "consent_scanner.view",
        "consent_scanner.create",
        "breach_scanner.view",
        "breach_scanner.create",
        "database_scanner.view",
        "remediation.view",
        "reports.view",
        "profile.view",
        "training.view",
    ],

    3: [
        "dashboard.view",
        "applications.view",
        "applications.create",
        "self_check.view",
        "self_check.create",
        "consent_scanner.view",
        "consent_scanner.create",
        "breach_scanner.view",
        "breach_scanner.create",
        "profile.view",
        "training.view",
    ],
};

export const PermissionProvider = ({ children }) => {
    const { role, isAuthenticated } = useAuthContext();

    const [backendPermissions, setBackendPermissions] = useState(null);

    const permissions = useMemo(() => {
        if (!isAuthenticated) return [];

        // Prefer permissions received from Django.
        if (Array.isArray(backendPermissions)) {
            return backendPermissions;
        }

        // Temporary legacy role-based fallback.
        return LEGACY_ROLE_PERMISSIONS[role] || [];
    }, [role, isAuthenticated, backendPermissions]);

    const hasPermission = useCallback(
        (permission) => permissions.includes(permission),
        [permissions]
    );

    const hasAnyPermission = useCallback(
        (requiredPermissions = []) =>
            requiredPermissions.some((permission) =>
                permissions.includes(permission)
            ),
        [permissions]
    );

    const hasAllPermissions = useCallback(
        (requiredPermissions = []) =>
            requiredPermissions.every((permission) =>
                permissions.includes(permission)
            ),
        [permissions]
    );

    const updatePermissions = useCallback((newPermissions) => {
        if (Array.isArray(newPermissions)) {
            setBackendPermissions(newPermissions);
        }
    }, []);

    const resetPermissions = useCallback(() => {
        setBackendPermissions(null);
    }, []);

    const value = {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        updatePermissions,
        resetPermissions,
        isUsingBackendPermissions: Array.isArray(backendPermissions),
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissionContext = () => {
    const context = useContext(PermissionContext);

    if (!context) {
        throw new Error(
            "usePermissionContext must be used within a PermissionProvider"
        );
    }

    return context;
};
