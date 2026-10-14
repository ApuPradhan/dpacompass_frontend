// dashboard_/Dashboard.jsx

import DashboardHeader from "./components/DashboardHeader";
import DashboardGrid from "./components/DashboardGrid";
import DashboardSection from "./components/DashboardSection";
import WidgetRenderer from "./WidgetRenderer";

import LoadingDashboard from "./components/LoadingDashboard";
import EmptyDashboard from "./components/EmptyDashboard";

import useDashboard from "./hooks/useDashboard";

export default function Dashboard() {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const roleMap = {
        1: "admin",
        2: "auditor",
        3: "auditee",
    };

    const role =
        roleMap[user.role] ||
        roleMap[Number(user.role)] ||
        (
            typeof user.role === "string"
                ? user.role.toLowerCase()
                : "admin"
        );

    const {
        loading,
        connected,
        dashboard,
    } = useDashboard(role);


    if (loading) {
        return (
            <div className="min-h-screen flex bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white">
                <main className="flex-1 p-6">
                    <LoadingDashboard />
                </main>
            </div>
        );
    }


    if (!dashboard.widgets.length) {
        return (
            <div className="min-h-screen flex bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white">
                <main className="flex-1 p-6">
                    <EmptyDashboard />
                </main>
            </div>
        );
    }


    // --------------------------------
    // Stat cards
    // --------------------------------

    const statCards = dashboard.widgets.filter(
        widget =>
            widget.type === "stat_card"
    );


    // --------------------------------
    // Admin-only widgets
    // --------------------------------

    const pipeline = dashboard.widgets.find(
        widget =>
            widget.type === "pipeline"
    );


    const activity = dashboard.widgets.find(
        widget =>
            widget.type === "activity"
    );


    const notifications =
        dashboard.widgets.find(
            widget =>
                widget.type === "notifications"
        );


    const charts = dashboard.widgets.filter(
        widget =>
            widget.type === "pie_chart" ||
            widget.type === "bar_chart" ||
            widget.type === "line_chart"
    );


    const isAuditor =
        role === "auditor";


    return (

        <div className="min-h-screen flex bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white">

            <main className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Header */}

                <DashboardHeader
                    connected={connected}
                    user={user}
                />


                {/* Overview */}

                <DashboardSection
                    title="Overview"
                    subtitle="Real-time statistics across the platform"
                >

                    <DashboardGrid
                        widgets={statCards}
                    />

                </DashboardSection>


                {/* -------------------------------- */}
                {/* Everything below is Admin only */}
                {/* -------------------------------- */}

                {!isAuditor && pipeline && (

                    <DashboardSection
                        title="Audit Workflow"
                        subtitle="Current audit lifecycle"
                    >

                        <WidgetRenderer
                            widget={pipeline}
                        />

                    </DashboardSection>

                )}


                {!isAuditor &&
                    charts.length > 0 && (

                        <DashboardSection
                            title="Insights"
                            subtitle="Application and audit distribution"
                        >

                            <DashboardGrid
                                widgets={charts}
                            />

                        </DashboardSection>

                    )
                }


                {!isAuditor && (

                    <div className="grid grid-cols-12 gap-6">

                        {activity && (

                            <div className="col-span-12 xl:col-span-8">

                                <WidgetRenderer
                                    widget={activity}
                                />

                            </div>

                        )}


                        {notifications && (

                            <div className="col-span-12 xl:col-span-4">

                                <WidgetRenderer
                                    widget={notifications}
                                />

                            </div>

                        )}

                    </div>

                )}

            </main>

        </div>

    );
}