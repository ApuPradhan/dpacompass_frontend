import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { sidebarConfig } from "../utilities/sidebarConfig";

export default function Sidebar({
    role = "admin",
    auditMode = "self_check",
    onAuditModeChange,
}) {
    const navigate = useNavigate();

    const normalizedRole = (role || "admin").toLowerCase();
    const user = JSON.parse(localStorage.getItem("user") || "{}");


    const roleMenu = sidebarConfig[normalizedRole];

    const menu =
        normalizedRole === "auditee"
            ? roleMenu?.[auditMode] || roleMenu?.self_check || []
            : roleMenu || [];

    const [openMenus, setOpenMenus] = useState({});
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = Math.min(Math.max(e.clientX, 200), 420);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => setIsResizing(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        const handleClick = () => setOpenSideMenu(false);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };
    const handleLogout = () => {
        const keysToKeep = [];

        // ✅ collect all audit job keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith("audit_") && key.endsWith("_jobs")) {
                keysToKeep.push({
                    key,
                    value: localStorage.getItem(key)
                });
            }
        }

        // ❌ clear everything
        localStorage.clear();

        // ✅ restore only job data
        keysToKeep.forEach(item => {
            localStorage.setItem(item.key, item.value);
        });

        setTimeout(() => {
            navigate("/signin");
        }, 500);
    };
    return (
        <aside
            style={{ width: sidebarWidth }}
            className="sticky top-0 h-screen bg-[#0f172a]/90 border-r border-gray-700
                   flex flex-col relative transition-[width] duration-200"
        >
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5">
                <h1 className="text-3xl font-bold mb-8 text-indigo-400">
                    DPACOMPASS
                </h1>
                {/* {normalizedRole === "auditee" && (
                    <div className="mb-6">
                        <label
                            htmlFor="auditee-mode"
                            className="block text-sm font-medium text-gray-400 mb-2"
                        >
                            Select Role:
                        </label>

                        <select
                            id="auditee-mode"
                            value={auditMode}
                            onChange={(e) => {
                                onAuditModeChange?.(e.target.value);
                            }}
                            className="w-full rounded-lg border border-gray-700
               bg-[#1e293b] text-white px-3 py-2.5
               focus:outline-none focus:ring-2
               focus:ring-indigo-500"
                        >
                            <option value="self_check">Self Check</option>
                            <option value="third_party_audit">Third Party Audit</option>
                        </select>
                    </div>
                )} */}
                <nav className="space-y-4 text-base">
                    {menu.map((item, index) => {
                        const Icon = item.icon;

                        if (item.children) {
                            const isOpen = openMenus[item.label];

                            return (
                                <div key={index} className="space-y-1">

                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(item.label);
                                        }}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition
                                        ${isOpen
                                                ? "bg-indigo-500/10 text-indigo-400"
                                                : "text-gray-300 hover:bg-[#1e293b] hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className="text-[20px]" />}
                                            <span className="font-medium">
                                                {item.label}
                                            </span>
                                        </div>

                                        <FiChevronRight
                                            className={`text-[18px] transition-transform duration-300 ${isOpen ? "rotate-90 text-indigo-400" : ""
                                                }`}
                                        />
                                    </div>

                                    <div
                                        className={`ml-6 overflow-hidden transition-all duration-500 ${isOpen ? "max-h-96 mt-2" : "max-h-0"
                                            }`}
                                    >
                                        <div className="space-y-1 border-l border-gray-700 pl-3">
                                            {item.children.map((child, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => navigate(child.path)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                                                    text-gray-400 hover:text-white hover:bg-[#1e293b] transition group"
                                                >
                                                    <span className="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-125 transition"></span>

                                                    <span className="text-sm">
                                                        {child.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            );
                        }

                        return (
                            <div
                                key={index}
                                onClick={() => item.path && navigate(item.path)}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer
                                text-gray-300 hover:bg-[#1e293b] hover:text-white transition"
                            >
                                {Icon && <Icon className="text-[20px]" />}
                                <span className="font-medium">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Profile */}
            <div className="border-t border-gray-700 p-5 relative shrink-0">

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenSideMenu(!openSideMenu);
                    }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-[#1e293b] border border-gray-700 cursor-pointer hover:bg-[#2a3446] transition"
                >
                    <div className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                        {user?.first_name?.[0] || "U"}
                    </div>

                    <div>
                        <p className="text-base font-medium">
                            {user?.first_name} {user?.last_name}
                        </p>

                        <p className="text-sm text-gray-400 capitalize">
                            {role}
                        </p>
                    </div>
                </div>

                {openSideMenu && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-24 left-5 right-5 bg-[#0f172a]
                               border border-gray-700 rounded-xl shadow-lg p-3 space-y-2 z-50"
                    >
                        <div className="px-2 py-1">
                            <p className="text-base font-medium text-white">
                                {user?.first_name} {user?.last_name}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-indigo-500/10"
                        >
                            Edit Profile / Password
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={() => setIsResizing(true)}
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize
                       bg-transparent hover:bg-indigo-500/30 transition"
            />
        </aside>
    );
}