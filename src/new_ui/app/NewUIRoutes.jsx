
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthContext } from "../contexts/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AuditorDashboard from "../pages/dashboard/AuditorDashboard";
import AuditeeDashboard from "../pages/dashboard/AuditeeDashboard";

const DashboardRedirect = () => {
    const { role } = useAuthContext();

    switch (Number(role)) {
        case 1:
            return <Navigate to="/new-ui/dashboard/admin" replace />;

        case 2:
            return <Navigate to="/new-ui/dashboard/auditor" replace />;

        case 3:
            return <Navigate to="/new-ui/dashboard/auditee" replace />;

        default:
            return <Navigate to="/signin" replace />;
    }
};

const NewUIRoutes = () => {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route index element={<DashboardRedirect />} />

                <Route
                    path="dashboard/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="dashboard/auditor"
                    element={<AuditorDashboard />}
                />

                <Route
                    path="dashboard/auditee"
                    element={<AuditeeDashboard />}
                />

            </Route>

            <Route
                path="*"
                element={<Navigate to="/new-ui" replace />}
            />
        </Routes>
    );
};

export default NewUIRoutes;
