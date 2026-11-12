// dashboard_/components/DashboardHeader.jsx

import {
    FiWifi,
    FiWifiOff,
    FiBell,
} from "react-icons/fi";

export default function DashboardHeader({
    connected,
    user,
}) {

    const now = new Date();

    const greeting = (() => {
        const hour = now.getHours();

        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    })();

    const formattedDate = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (

        <div className="flex items-center justify-between">

            <div>

                <h1 className="text-3xl font-bold text-white">

                    {greeting},{" "}
                    <span className="text-indigo-400">
                        {user?.first_name || "User"}
                    </span>

                </h1>

                <p className="text-gray-400 mt-2">

                    Welcome to DPACOMPASS • {formattedDate}

                </p>

            </div>

            <div className="flex items-center gap-4">
{/* 
                <button
                    className="relative w-11 h-11 rounded-xl bg-[#111827] border border-gray-700
                    flex items-center justify-center hover:border-indigo-500 transition"
                >

                    <FiBell size={18} /> */}

                    {/* Placeholder Badge */}

                    {/* <span
                        className="absolute top-2 right-2
                        w-2 h-2 rounded-full bg-red-500"
                    />

                </button> */}

                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border
                    ${
                        connected
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}
                >

                    {connected ? (
                        <FiWifi />
                    ) : (
                        <FiWifiOff />
                    )}

                    <span className="text-sm font-medium">

                        {connected
                            ? "Live"
                            : "Disconnected"}

                    </span>

                </div>

            </div>

        </div>

    );

}