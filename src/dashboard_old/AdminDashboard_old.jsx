import React, { useState, useEffect } from "react";
import {
    FiFileText,
    FiClipboard,
    FiBarChart2,
    FiBookOpen,
    FiLayers,
    FiCheckCircle,
    FiClock,
    FiChevronRight
} from "react-icons/fi";

import SidebarItem from "./SideBarItem";
import StatCard from "./Statcard";
import ActivityItem from "./AcitvityItem";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [sidebarWidth, setSidebarWidth] = useState(256); // 64 * 4 = 256px
    const [isResizing, setIsResizing] = useState(false);
    const [openTopMenu, setOpenTopMenu] = useState(false);
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [openChecklistMenu, setOpenChecklistMenu] = useState(false);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = () => {
            setOpenTopMenu(false);
            setOpenSideMenu(false);
        };

        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;

            const newWidth = Math.min(Math.max(e.clientX, 200), 400);
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);
    const handleLogout = () => {
        const keysToKeep = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith("audit_") && key.endsWith("_jobs")) {
                keysToKeep.push({
                    key,
                    value: localStorage.getItem(key)
                });
            }
        }

        localStorage.clear();

        keysToKeep.forEach(item => {
            localStorage.setItem(item.key, item.value);
        });

        setTimeout(() => {
            navigate("/signin");
        }, 500);
    };

    return (
        <div className="min-h-screen flex bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white text-[15px]">

          
            <Sidebar role="admin" />

            {/* Main */}
            <main className="flex-1 p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[30px] font-semibold text-indigo-300">
                        Welcome to DPACOMPASS
                    </h2>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mb-6">
                    <StatCard title="Total Applications" value="24" icon={<FiClipboard />} />
                    <StatCard title="In Progress" value="8" icon={<FiClock />} />
                    <StatCard title="Completed" value="16" icon={<FiCheckCircle />} />
                </div>

                {/* Activity */}
                <div className="bg-[#0f172a]/80 border border-gray-700 rounded-2xl p-5">
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

export default AdminDashboard;