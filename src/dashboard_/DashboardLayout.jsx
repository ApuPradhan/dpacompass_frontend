
import {
    useEffect,
    useState,
    cloneElement,
    isValidElement
} from "react";

import { FiMenu } from "react-icons/fi";
import Sidebar from "../dashboard_old/Sidebar";

export default function DashboardLayout({ role, children }) {

    const normalizedRole = String(role || "admin").toLowerCase();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [auditMode, setAuditMode] = useState(() => {
        const stored = localStorage.getItem("auditee_mode");

        return stored === "third_party" ||
            stored === "third_party_audit"
            ? "third_party_audit"
            : "self_check";
    });

    const handleAuditModeChange = (mode) => {
        if (
            mode !== "self_check" &&
            mode !== "third_party_audit"
        ) return;

        setAuditMode(mode);
        localStorage.setItem("auditee_mode", mode);
    };

    useEffect(() => {
        if (!sidebarOpen) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [sidebarOpen]);

    const dashboardContent =
        normalizedRole === "auditee" &&
            isValidElement(children)
            ? cloneElement(children, { auditMode })
            : children;

    return (
        <div className="dashboard-theme dashboard-shell">

            {/* SIDEBAR */}
            <Sidebar
                role={normalizedRole}
                auditMode={auditMode}
                onAuditModeChange={handleAuditModeChange}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    className="dashboard-mobile-backdrop"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* MAIN APPLICATION LAYOUT */}
            <main className="dashboard-main">

                {/* MOBILE HEADER */}
                <header className="dashboard-mobile-header">

                    <button
                        type="button"
                        className="dashboard-mobile-menu-button"
                        aria-label="Open sidebar"
                        aria-controls="dashboard-sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FiMenu aria-hidden="true" size={21} />
                    </button>

                    <span className="dashboard-mobile-title">
                        DPACOMPASS
                    </span>

                    <span className="dashboard-mobile-header-spacer" />

                </header>

                {/* PAGE CONTENT */}
                <div className="dashboard-workspace">
                    {dashboardContent}
                </div>

                {/* GLOBAL DASHBOARD FOOTER */}
                <footer className="dashboard-footer">

                    <p className="dashboard-footer-copyright">
                        © {new Date().getFullYear()} Developed by{" "}
                        Centre for Development of Advanced Computing
                        {" "}(C-DAC), Government of India
                    </p>

                </footer>

            </main>

        </div>
    );
}
