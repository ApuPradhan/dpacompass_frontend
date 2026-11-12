import React, { useState, useEffect } from "react";
import {
    FiFileText,
    FiClipboard,
    FiBarChart2,
    FiBookOpen,
    FiLayers,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";

import SidebarItem from "./SideBarItem";
import StatCard from "./Statcard";
import ActivityItem from "./AcitvityItem";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const AuditeeDashboard = () => {
    const navigate = useNavigate();
    const [openTopMenu, setOpenTopMenu] = useState(false);
    const [openSideMenu, setOpenSideMenu] = useState(false);

    // Close dropdown on outside click
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const handleClick = () => {
            setOpenTopMenu(false);
            setOpenSideMenu(false);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);
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
        <div className="min-h-screen flex bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white text-[15px]">
            {/* Sidebar */}
            <Sidebar role="Auditee" />

            {/* Main */}
            <main className="flex-1 p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-[30px] font-semibold text-indigo-300">
                        Welcome to DPACOMPASS
                    </h2>

                    {/* Top Profile */}
                    <div className="relative">

                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenTopMenu(!openTopMenu);
                                setOpenSideMenu(false);
                            }}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{user.first_name}</p>
                                <p className="text-xs text-gray-400">Profile</p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold hover:scale-105 transition">
                                {user.first_name[0]}
                            </div>
                        </div>

                        {/* Dropdown (DOWN) */}
                        {openTopMenu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-gray-700 rounded-xl shadow-lg px-3 space-y-2 z-50"
                            >
                                <p className="text-sm font-medium text-white pl-3">
                                    Saikat Mohanta
                                </p>

                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-indigo-500/10"
                                >
                                    Edit Profile / Password
                                </button>

                                <button className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400"
                                    onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mb-6">
                    <StatCard title="Total Applications" value="24" icon={<FiClipboard />} />
                    <StatCard title="In Progress" value="8" icon={<FiClock />} />
                    <StatCard title="Completed" value="16" icon={<FiCheckCircle />} />
                </div>

                {/* Activity */}
                <div className="bg-[#0f172a]/80 border border-gray-700 rounded-2xl p-5 backdrop-blur-lg">
                    <h2 className="text-lg font-semibold mb-4 text-indigo-300">
                        Recent Activity
                    </h2>

                    <div className="space-y-3">
                        <ActivityItem title="Audit - FinTech App" status="In Progress" />
                        <ActivityItem title="Audit - HealthCare Portal" status="In Progress" />
                        <ActivityItem title="Report - E-Commerce App" status="Completed" />
                        <ActivityItem title="Report - Banking System" status="Completed" />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AuditeeDashboard;