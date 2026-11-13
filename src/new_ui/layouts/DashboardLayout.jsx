
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

import {
    Menu,
    X,
    UserCircle,
    Sun,
    Moon,
} from "lucide-react";

import { useAuthContext } from "../contexts/AuthContext";
import { useThemeContext } from "../theme/ThemeProvider";
import { usePermissionContext } from "../contexts/PermissionContext";
import { navigationConfig } from "../config/navigationConfig";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { user } = useAuthContext();
    const { theme, toggleTheme } = useThemeContext();
    const { hasPermission } = usePermissionContext();

    // Filter navigation items based on user permissions
    const visibleNavigation = navigationConfig.filter(
        (item) =>
            !item.permission || hasPermission(item.permission)
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">

            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? "w-64" : "w-20"
                } flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900`}
            >
                {/* Sidebar Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
                    {sidebarOpen && (
                        <span className="text-lg font-bold">
                            DPACOMPASS
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label={
                            sidebarOpen
                                ? "Collapse sidebar"
                                : "Expand sidebar"
                        }
                    >
                        {sidebarOpen ? (
                            <X size={20} />
                        ) : (
                            <Menu size={20} />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {visibleNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                end={item.path === "/new-ui"}
                                title={
                                    !sidebarOpen
                                        ? item.label
                                        : undefined
                                }
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`
                                }
                            >
                                <Icon size={19} className="shrink-0" />

                                {sidebarOpen && (
                                    <span>{item.label}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Theme Toggle */}
                <div className="border-t border-gray-200 p-3 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={
                            theme === "light"
                                ? "Switch to dark mode"
                                : "Switch to light mode"
                        }
                    >
                        {theme === "light" ? (
                            <Moon size={19} className="shrink-0" />
                        ) : (
                            <Sun size={19} className="shrink-0" />
                        )}

                        {sidebarOpen && (
                            <span>
                                {theme === "light"
                                    ? "Dark Mode"
                                    : "Light Mode"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
                    <div>
                        <h1 className="text-lg font-semibold">
                            DPACOMPASS
                        </h1>
                    </div>

                    {/* User Information */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium">
                                {user?.username ||
                                    user?.name ||
                                    "User"}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user?.role_name ||
                                    "DPACOMPASS User"}
                            </p>
                        </div>

                        <UserCircle
                            size={30}
                            className="text-gray-500"
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-w-0 flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
