
import {
    FiShield,
    FiCalendar,
    FiWifi,
    FiWifiOff,
    FiCheckCircle,
    FiAlertCircle,
} from "react-icons/fi";

export default function DashboardHeader({ connected, user }) {
    const now = new Date();

    const hour = now.getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 17
                ? "Good Afternoon"
                : "Good Evening";

    const formattedDate = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const firstName =
        user?.first_name?.trim() || "User";

    return (
        <header className="gov-dashboard-header">

            <div className="gov-header-main">

                {/* LEFT: PORTAL IDENTITY AND GREETING */}

                <div className="gov-header-info">

                    <div className="gov-header-identity">

                        <div className="gov-header-emblem">
                            <FiShield aria-hidden="true" />
                        </div>

                        <div>
                            <div className="gov-header-brand">
                                DPACOMPASS
                            </div>

                            <div className="gov-header-brand-subtitle">
                                AUDIT & COMPLIANCE WORKSPACE
                            </div>
                        </div>

                    </div>

                    <div className="gov-header-greeting">

                        <h1 className="gov-header-title">
                            {greeting},{" "}
                            <span>{firstName}</span>
                        </h1>

                        <p className="gov-header-description">
                            Welcome to your compliance management dashboard.
                        </p>

                    </div>

                </div>

                {/* RIGHT: DATE AND CONNECTION STATUS */}

                <div className="gov-header-meta">

                    <div className="gov-header-date">

                        <FiCalendar aria-hidden="true" />

                        <span>{formattedDate}</span>

                    </div>

                    <div
                        className={`gov-header-status ${connected
                                ? "gov-header-status-online"
                                : "gov-header-status-offline"
                            }`}
                        role="status"
                        aria-live="polite"
                    >

                        <div className="gov-header-status-icon">
                            {connected ? (
                                <FiWifi aria-hidden="true" />
                            ) : (
                                <FiWifiOff aria-hidden="true" />
                            )}
                        </div>

                        <div className="gov-header-status-text">

                            <span className="gov-header-status-title">
                                {connected
                                    ? "Live Connection"
                                    : "Disconnected"}
                            </span>

                            <span className="gov-header-status-subtitle">
                                {connected
                                    ? "Real-time updates active"
                                    : "Real-time updates unavailable"}
                            </span>

                        </div>

                        {connected ? (
                            <FiCheckCircle
                                className="gov-header-status-check"
                                aria-hidden="true"
                            />
                        ) : (
                            <FiAlertCircle
                                className="gov-header-status-check"
                                aria-hidden="true"
                            />
                        )}

                    </div>

                </div>

            </div>

        </header>
    );
}
