
import { useState, cloneElement, isValidElement } from "react";
import Sidebar from "../dashboard_old/Sidebar";

export default function DashboardLayout({ role, children }) {
    const normalizedRole = (role || "admin").toLowerCase();

    // Default auditee mode is Self Check.
    const [auditMode, setAuditMode] = useState(() => {
        const savedMode = localStorage.getItem("auditee_mode");

        return savedMode === "third_party"
            ? "third_party_audit"
            : "self_check";
    });

    // Update mode when the auditee changes the sidebar dropdown.
    const handleAuditModeChange = (mode) => {
        if (
            mode !== "self_check" &&
            mode !== "third_party_audit"
        ) {
            return;
        }

        setAuditMode(mode);
        localStorage.setItem("auditee_mode", mode);
    };

    // Pass the selected mode to the auditee dashboard.
    const dashboardContent =
        normalizedRole === "auditee" && isValidElement(children)
            ? cloneElement(children, { auditMode })
            : children;

    return (
        <div className="flex min-h-screen bg-[#0b1120] text-gray-200">
            <Sidebar
                role={normalizedRole}
                auditMode={auditMode}
                onAuditModeChange={handleAuditModeChange}
            />

            <main className="flex-1 min-w-0 p-6 overflow-auto">
                {dashboardContent}
            </main>
        </div>
    );
}
