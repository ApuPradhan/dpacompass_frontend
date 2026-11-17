import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiCompass, FiLogOut, FiUser, FiX } from "react-icons/fi";
import { sidebarConfig } from "../utilities/sidebarConfig";

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
        return {};
    }
}

export default function Sidebar({
    role = "admin",
    auditMode = "self_check",
    onAuditModeChange,
    open = false,
    onClose = () => { },
}) {
    const navigate = useNavigate();
    const normalizedRole = String(role || "admin").toLowerCase();
    const user = getStoredUser();

    const roleMenu = sidebarConfig[normalizedRole];
    const menu =
        normalizedRole === "auditee"
            ? roleMenu?.[auditMode] || roleMenu?.self_check || []
            : roleMenu || [];

    const [openMenus, setOpenMenus] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (!isResizing) return;

        const handleMove = (event) => {
            setSidebarWidth(Math.min(Math.max(event.clientX, 220), 420));
        };
        const stopResizing = () => setIsResizing(false);

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    useEffect(() => {
        const closeProfile = () => setProfileOpen(false);
        window.addEventListener("click", closeProfile);
        return () => window.removeEventListener("click", closeProfile);
    }, []);

    const toggleMenu = (label) => {
        setOpenMenus((previous) => ({
            ...previous,
            [label]: !previous[label],
        }));
    };

    const goTo = (path) => {
        if (!path) return;
        navigate(path);
        setProfileOpen(false);
        onClose();
    };

    const handleLogout = () => {
        const auditJobs = [];
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key?.startsWith("audit_") && key.endsWith("_jobs")) {
                auditJobs.push({ key, value: localStorage.getItem(key) });
            }
        }
        localStorage.clear();
        auditJobs.forEach(({ key, value }) => localStorage.setItem(key, value));
        onClose();
        navigate("/signin", { replace: true });
    };

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
    const initial = (user.first_name?.[0] || "U").toUpperCase();

    return (
        <aside
            id="dashboard-sidebar"
            className={`dashboard-sidebar ${open ? "is-open" : ""}`}
            style={{ "--sidebar-width": `${sidebarWidth}px` }}
            aria-label="Dashboard navigation"
        >
            <div className="dashboard-sidebar-header">
                <div className="dashboard-brand-mark">
                    <FiCompass size={22} aria-hidden="true" />
                </div>
                <div className="dashboard-brand-copy">
                    <span className="dashboard-brand-name">DPACOMPASS</span>
                    <span className="dashboard-brand-subtitle">Governance workspace</span>
                </div>
                <button
                    type="button"
                    className="dashboard-sidebar-close"
                    aria-label="Close sidebar"
                    onClick={onClose}
                >
                    <FiX size={19} aria-hidden="true" />
                </button>
            </div>

            <div className="dashboard-sidebar-scroll">
                {normalizedRole === "auditee" && (
                    <div className="dashboard-mode-field">
                        <label htmlFor="auditee-mode">Audit mode</label>
                        <select
                            id="auditee-mode"
                            value={auditMode}
                            onChange={(event) => onAuditModeChange?.(event.target.value)}
                            className="dashboard-mode-select"
                        >
                            <option value="self_check">Self Check</option>
                            <option value="third_party_audit">Third Party Audit</option>
                        </select>
                    </div>
                )}

                <div className="dashboard-nav-heading">WORKSPACE</div>
                <nav className="dashboard-sidebar-nav" aria-label="Primary">
                    {menu.map((item, index) => {
                        const Icon = item.icon;
                        const key = item.label || index;

                        if (Array.isArray(item.children) && item.children.length > 0) {
                            const isExpanded = Boolean(openMenus[item.label]);
                            return (
                                <div key={key} className="dashboard-nav-group">
                                    <button
                                        type="button"
                                        className={`dashboard-nav-item ${isExpanded ? "is-expanded" : ""}`}
                                        onClick={() => toggleMenu(item.label)}
                                        aria-expanded={isExpanded}
                                    >
                                        {Icon && <Icon className="dashboard-nav-icon" aria-hidden="true" />}
                                        <span className="dashboard-nav-label">{item.label}</span>
                                        <FiChevronRight
                                            className={`dashboard-nav-chevron ${isExpanded ? "is-open" : ""}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {isExpanded && (
                                        <div className="dashboard-nav-submenu">
                                            {item.children.map((child, childIndex) => (
                                                <button
                                                    key={child.path || child.label || childIndex}
                                                    type="button"
                                                    className="dashboard-nav-subitem"
                                                    onClick={() => goTo(child.path)}
                                                >
                                                    <span className="dashboard-nav-dot" />
                                                    <span>{child.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <button
                                type="button"
                                key={key}
                                className="dashboard-nav-item"
                                onClick={() => goTo(item.path)}
                            >
                                {Icon && <Icon className="dashboard-nav-icon" aria-hidden="true" />}
                                <span className="dashboard-nav-label">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="dashboard-sidebar-footer">
                <div className="dashboard-profile-wrapper">
                    <button
                        type="button"
                        className="dashboard-profile-trigger"
                        aria-expanded={profileOpen}
                        aria-label="Open account menu"
                        onClick={(event) => {
                            event.stopPropagation();
                            setProfileOpen((previous) => !previous);
                        }}
                    >
                        <span className="dashboard-profile-avatar">{initial}</span>
                        <span className="dashboard-profile-info">
                            <span className="dashboard-profile-name">{fullName || "User"}</span>
                            <span className="dashboard-profile-role">{normalizedRole}</span>
                        </span>
                        <FiChevronRight
                            className={`dashboard-profile-chevron ${profileOpen ? "is-open" : ""}`}
                            aria-hidden="true"
                        />
                    </button>

                    {profileOpen && (
                        <div
                            className="dashboard-profile-popover"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="dashboard-profile-popover-heading">{fullName || "Account"}</div>
                            <button type="button" onClick={() => goTo("/profile")}>
                                <FiUser aria-hidden="true" />
                                Edit profile / password
                            </button>
                            <button type="button" className="is-danger" onClick={handleLogout}>
                                <FiLogOut aria-hidden="true" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div
                className="dashboard-sidebar-resize"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize sidebar"
                aria-valuemin={220}
                aria-valuemax={420}
                aria-valuenow={sidebarWidth}
                tabIndex={0}
                onMouseDown={(event) => {
                    event.preventDefault();
                    setIsResizing(true);
                }}
                onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                        event.preventDefault();
                        const offset = event.key === "ArrowLeft" ? -12 : 12;
                        setSidebarWidth((current) => Math.min(Math.max(current + offset, 220), 420));
                    }
                }}
            />
        </aside>
    );
}
