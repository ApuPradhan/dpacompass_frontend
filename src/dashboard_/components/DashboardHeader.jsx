
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

                <h1 className="text-3xl font-bold theme-text-primary">

                    {greeting},{" "}
                    <span className="theme-text-primary-color">
                        {user?.first_name || "User"}
                    </span>

                </h1>

                <p className="theme-text-secondary mt-2">

                    Welcome to DPACOMPASS • {formattedDate}

                </p>

            </div>

            <div className="flex items-center gap-4">

                {/* WebSocket Connection Status */}

                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border
                    ${
                        connected
                            ? "border-green-500/30 bg-green-500/10 text-green-600"
                            : "border-red-500/30 bg-red-500/10 text-red-600"
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
