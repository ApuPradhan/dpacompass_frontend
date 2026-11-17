
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import {
    FiArrowLeft,
    FiEye,
    FiClipboard,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiRefreshCw,
    FiCalendar,
    FiXCircle,
} from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditViewModal from "../AdminDashboard/AuditViewModal";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function NewAssignedAudit() {
    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const [typeMap, setTypeMap] = useState({});
    const [filter, setFilter] = useState("all");

    const [refreshing, setRefreshing] = useState(false);

    // =====================================================
    // LOCAL STYLING VARIABLES
    // =====================================================

    const styles = {
        page: "assigned-audits-page",
        backButton: "assigned-back-button",
        pageHeader: "assigned-page-header",
        statsGrid: "assigned-stats-grid",
        statCard: "assigned-stat-card",
        toolbar: "assigned-toolbar",
        filterGroup: "assigned-filter-group",
        filterButton: "assigned-filter-button",
        refreshButton: "assigned-refresh-button",
        tableCard: "assigned-table-card",
        tableHeader: "assigned-table-header",
        tableBody: "assigned-table-body",
        tableWrapper: "assigned-table-wrapper",
    };

    // =====================================================
    // FETCH APPLICATION TYPES
    // =====================================================

    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(
                "/api/applications/types/",
                {
                    method: "GET",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail || "Failed to fetch types"
                );
            }

            const map = {};

            data.data.forEach((type) => {
                map[type.id] = type.name;
            });

            setTypeMap(map);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // =====================================================
    // FETCH ASSIGNED AUDITS
    // =====================================================

    const fetchAssignedAudits = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithAuth(
                "/api/audits/assigned/",
                {
                    method: "GET",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to fetch assigned audits"
                );
            }

            setAudits(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchAssignedAudits();
        fetchTypes();
    }, []);

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchAssignedAudits();
            toast.success("Audit list refreshed.");
        } finally {
            setRefreshing(false);
        }
    };

    // =====================================================
    // DATE HELPERS
    // =====================================================

    const getDaysLeft = (deadline) => {
        if (!deadline) return null;

        const deadlineDate = new Date(deadline);

        if (Number.isNaN(deadlineDate.getTime())) {
            return null;
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);

        const diff = deadlineDate.getTime() - today.getTime();

        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString();
    };

    // =====================================================
    // FORMAT TABLE DATA
    // =====================================================

    const formattedAudits = useMemo(() => {
        return audits.map((audit) => ({
            id: audit.audit_id,
            application_id: audit.application_id,
            application_name: audit.application_name || "N/A",
            auditor_name: audit.auditor_name || "N/A",
            status: audit.status,
            created_at: audit.created_at,
            deadline: audit.audit_deadline,
        }));
    }, [audits]);

    // =====================================================
    // SORT BY DEADLINE
    // =====================================================

    const sortedAudits = useMemo(() => {
        return [...formattedAudits].sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return new Date(a.deadline) - new Date(b.deadline);
        });
    }, [formattedAudits]);

    // =====================================================
    // FILTER AUDITS
    // =====================================================

    const filteredAudits = useMemo(() => {
        return sortedAudits.filter((audit) => {
            const days = getDaysLeft(audit.deadline);

            if (filter === "urgent") {
                return days !== null && days <= 5 && days > 0;
            }

            if (filter === "overdue") {
                return days !== null && days <= 0;
            }

            return true;
        });
    }, [sortedAudits, filter]);

    // =====================================================
    // SUMMARY COUNTS
    // =====================================================

    const totalAudits = formattedAudits.length;

    const urgentCount = formattedAudits.filter((audit) => {
        const days = getDaysLeft(audit.deadline);
        return days !== null && days <= 5 && days > 0;
    }).length;

    const overdueCount = formattedAudits.filter((audit) => {
        const days = getDaysLeft(audit.deadline);
        return days !== null && days <= 0;
    }).length;

    const inProgressCount = formattedAudits.filter(
        (audit) => audit.status === "in_progress"
    ).length;

    // =====================================================
    // HANDLE VIEW
    // =====================================================

    const handleView = async (audit) => {
        try {
            setViewLoading(true);

            const appId = audit.application_id || audit.application;

            const res = await fetchWithAuth(
                `/api/applications/applications/${appId}/`,
                {
                    method: "GET",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to fetch application"
                );
            }

            const appDetails = data.data;

            setSelectedAudit({
                ...audit,
                ...appDetails,
                type_name:
                    typeMap[Number(appDetails?.type)] || "N/A",
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load audit details");
        } finally {
            setViewLoading(false);
        }
    };

    // =====================================================
    // TABLE COLUMNS
    // =====================================================

    const columns = [
        {
            key: "application_name",
            label: "Application",
        },
        {
            key: "auditor_name",
            label: "Auditor",
        },
        {
            key: "deadline",
            label: "Deadline",
            render: (value) => {
                if (!value) {
                    return (
                        <span className="text-sm text-slate-400">
                            Not specified
                        </span>
                    );
                }

                const daysLeft = getDaysLeft(value);

                let dateStyle =
                    "font-semibold text-slate-700";

                let indicator = null;
                let helperText = "Upcoming";
                let helperStyle = "text-slate-500";

                if (daysLeft !== null && daysLeft <= 0) {
                    dateStyle = "font-bold text-red-600";
                    indicator = (
                        <FiAlertCircle
                            size={14}
                            className="text-red-600"
                        />
                    );
                    helperText = "Overdue";
                    helperStyle = "font-medium text-red-600";
                } else if (daysLeft !== null && daysLeft <= 5) {
                    dateStyle = "font-bold text-amber-600";
                    indicator = (
                        <FiClock
                            size={14}
                            className="text-amber-600"
                        />
                    );
                    helperText =
                        daysLeft === 1
                            ? "1 day left"
                            : `${daysLeft} days left`;
                    helperStyle = "font-medium text-amber-600";
                } else if (daysLeft !== null) {
                    helperText =
                        daysLeft === 1
                            ? "1 day left"
                            : `${daysLeft} days left`;
                }

                return (
                    <div className="flex min-w-[120px] flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {indicator}

                            <span className={dateStyle}>
                                {formatDate(value)}
                            </span>
                        </div>

                        <span className={`text-xs ${helperStyle}`}>
                            {helperText}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const status = String(value || "").toLowerCase();

                const statusStyle =
                    status === "assigned"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : status === "in_progress"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : status === "audit_completed" ||
                                status === "review_completed"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-700";

                return (
                    <span
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle}`}
                    >
                        {String(value || "N/A").replaceAll("_", " ")}
                    </span>
                );
            },
        },
        {
            key: "created_at",
            label: "Assigned On",
            render: (value) => (
                <span className="whitespace-nowrap text-sm font-medium text-slate-600">
                    {formatDate(value)}
                </span>
            ),
        },
    ];

    // =====================================================
    // TABLE ACTIONS
    // =====================================================

    const renderActions = (row) => (
        <button
            type="button"
            onClick={() => handleView(row)}
            title="View audit details"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
        >
            <FiEye size={18} />
        </button>
    );

    // =====================================================
    // STATISTICS
    // =====================================================

    const statistics = [
        {
            title: "Total Assigned Audits",
            value: totalAudits,
            description: "All assigned audit applications",
            icon: FiClipboard,
            iconColor: "#2563EB",
            iconBackground: "#EFF6FF",
            accent: "#3B82F6",
        },
        {
            title: "Urgent Audits",
            value: urgentCount,
            description: "Deadlines within 5 days",
            icon: FiClock,
            iconColor: "#D97706",
            iconBackground: "#FFF7ED",
            accent: "#F59E0B",
        },
        {
            title: "Overdue Audits",
            value: overdueCount,
            description: "Past their deadline",
            icon: FiAlertCircle,
            iconColor: "#DC2626",
            iconBackground: "#FEF2F2",
            accent: "#EF4444",
        },
        {
            title: "In Progress",
            value: inProgressCount,
            description: "Audits currently being worked on",
            icon: FiCheckCircle,
            iconColor: "#059669",
            iconBackground: "#ECFDF5",
            accent: "#10B981",
        },
    ];

    // =====================================================
    // FILTER OPTIONS
    // =====================================================

    const filterOptions = [
        {
            value: "all",
            label: "All",
            count: totalAudits,
        },
        {
            value: "urgent",
            label: "Urgent",
            count: urgentCount,
        },
        {
            value: "overdue",
            label: "Overdue",
            count: overdueCount,
        },
    ];

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className={styles.page}>
            <style>{`
                .assigned-audits-page {
                    min-height: 100vh;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 28px 32px 40px;
                    background: #F4F7FB;
                    color: #1E293B;
                }

                .assigned-audits-page *,
                .assigned-audits-page *::before,
                .assigned-audits-page *::after {
                    box-sizing: border-box;
                }

                .assigned-back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    margin-bottom: 25px;
                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: #087FD3;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: color .2s ease;
                }

                .assigned-back-button:hover {
                    color: #075EB5;
                }

                .assigned-page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 26px;
                }

                .assigned-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 18px;
                    width: 100%;
                    margin-bottom: 25px;
                }

                .assigned-stat-card {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    min-width: 0;
                    min-height: 132px;
                    padding: 20px;
                    border: 1px solid #DCE7F3;
                    border-left: 4px solid var(--stat-accent);
                    border-radius: 12px;
                    background: #FFFFFF;
                    box-shadow: 0 2px 7px rgba(15, 23, 42, .045);
                    transition: transform .2s ease, box-shadow .2s ease;
                }

                .assigned-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 7px 18px rgba(15, 23, 42, .08);
                }

                .assigned-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 14px;
                    width: 100%;
                    margin-bottom: 22px;
                }

                .assigned-filter-group {
                    display: inline-flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 5px;
                    padding: 5px;
                    border: 1px solid #DCE7F3;
                    border-radius: 10px;
                    background: #FFFFFF;
                }

                .assigned-filter-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    min-height: 36px;
                    padding: 0 15px;
                    border: 1px solid transparent;
                    border-radius: 7px;
                    background: transparent;
                    color: #64748B;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all .2s ease;
                }

                .assigned-filter-button:hover {
                    background: #F1F5F9;
                    color: #334155;
                }

                .assigned-filter-button.active {
                    border-color: #BFDBFE;
                    background: #EFF6FF;
                    color: #075EB5;
                }

                .assigned-refresh-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    height: 42px;
                    padding: 0 18px;
                    border: 0;
                    border-radius: 8px;
                    background: #087FD3;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(8, 127, 211, .2);
                    transition: background .2s ease, transform .2s ease;
                }

                .assigned-refresh-button:hover {
                    background: #0568B5;
                    transform: translateY(-1px);
                }

                .assigned-refresh-button:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                    transform: none;
                }

                .assigned-table-card {
                    width: 100%;
                    min-width: 0;
                    overflow: hidden;
                    border: 1px solid #DCE7F3;
                    border-radius: 12px;
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(15, 23, 42, .045);
                }

                .assigned-table-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 20px 24px;
                    border-bottom: 1px solid #E2EAF4;
                }

                .assigned-table-body {
                    padding: 20px 24px 24px;
                }

                .assigned-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                }

                .assigned-table-wrapper table {
                    width: 100%;
                    min-width: 850px;
                    border-collapse: collapse;
                    border-spacing: 0;
                    background: #FFFFFF;
                }

                .assigned-table-wrapper thead th {
                    padding: 14px 16px;
                    border-bottom: 1px solid #DCE7F3;
                    background: #EDF5FF;
                    color: #173B70;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: left;
                    white-space: nowrap;
                }

                .assigned-table-wrapper tbody td {
                    padding: 15px 16px;
                    border-bottom: 1px solid #E8EEF5;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.5;
                    vertical-align: middle;
                }

                .assigned-table-wrapper tbody tr {
                    transition: background .15s ease;
                }

                .assigned-table-wrapper tbody tr:hover {
                    background: #F5F9FF;
                }

                .assigned-table-wrapper tbody tr:last-child td {
                    border-bottom: 0;
                }

                @media (max-width: 1100px) {
                    .assigned-stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 640px) {
                    .assigned-audits-page {
                        padding: 20px 14px 30px;
                    }

                    .assigned-stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                    }

                    .assigned-stat-card {
                        min-height: 120px;
                        padding: 13px;
                    }

                    .assigned-toolbar {
                        align-items: stretch;
                    }

                    .assigned-filter-group {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .assigned-filter-button {
                        flex: 1;
                        padding: 0 9px;
                    }

                    .assigned-refresh-button {
                        width: 100%;
                    }

                    .assigned-table-header {
                        padding: 17px;
                    }

                    .assigned-table-body {
                        padding: 15px;
                    }
                }

                @media (max-width: 380px) {
                    .assigned-stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* BACK BUTTON */}

            <button
                type="button"
                onClick={() => navigate("/admindashboard")}
                className={styles.backButton}
            >
                <FiArrowLeft size={19} />
                Back to Dashboard
            </button>

            {/* PAGE HEADER */}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                        Assigned and Ongoing Audits
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                        Monitor assigned audit applications, deadlines and
                        ongoing audit activities.
                    </p>
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 sm:flex">
                    <FiClipboard size={17} />
                    Audit Management
                </div>
            </div>

            {/* STATISTICS */}

            <div className={styles.statsGrid}>
                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className={styles.statCard}
                            style={{
                                "--stat-accent": item.accent,
                            }}
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-500">
                                    {item.title}
                                </p>

                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#14213D]">
                                    {item.value}
                                </h2>

                                <p className="mt-2 text-xs text-slate-400">
                                    {item.description}
                                </p>
                            </div>

                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    color: item.iconColor,
                                    backgroundColor: item.iconBackground,
                                }}
                            >
                                <Icon size={20} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FILTER TOOLBAR */}

            <div className={styles.toolbar}>
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Filter audits
                    </p>

                    <div className={styles.filterGroup}>
                        {filterOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFilter(option.value)}
                                className={`${styles.filterButton} ${
                                    filter === option.value ? "active" : ""
                                }`}
                            >
                                {option.label}

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                                        filter === option.value
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    {option.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={styles.refreshButton}
                >
                    <FiRefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* TABLE CARD */}

            <div className={styles.tableCard}>
                {loading ? (
                    <div className="flex min-h-[350px] items-center justify-center">
                        <Loader text="Loading audits..." />
                    </div>
                ) : error ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <FiXCircle size={29} />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">
                            Unable to load assigned audits
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchAssignedAudits}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#087FD3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0568B5]"
                        >
                            <FiRefreshCw size={15} />
                            Try Again
                        </button>
                    </div>
                ) : filteredAudits.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                            <FiCalendar size={29} />
                        </div>

                        <h3 className="text-lg font-semibold text-[#173B70]">
                            {filter === "urgent"
                                ? "No Urgent Audits"
                                : filter === "overdue"
                                    ? "No Overdue Audits"
                                    : "No Assigned Audits"}
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            {filter === "urgent"
                                ? "There are no audits with deadlines within the next 5 days."
                                : filter === "overdue"
                                    ? "All audit deadlines are currently within their scheduled period."
                                    : "There are currently no assigned audit applications."}
                        </p>

                        {filter !== "all" && (
                            <button
                                type="button"
                                onClick={() => setFilter("all")}
                                className="mt-4 cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                View all audits
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* TABLE HEADER */}

                        <div className={styles.tableHeader}>
                            <div>
                                <h2 className="text-lg font-bold text-[#173B70]">
                                    Audit Assignments
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review assigned auditors, deadlines and
                                    current audit status.
                                </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                {filteredAudits.length} Records
                            </span>
                        </div>

                        {/* TABLE BODY */}

                        <div className={styles.tableBody}>
                            <div className="mb-4 text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {filteredAudits.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-800">
                                    {totalAudits}
                                </span>{" "}
                                assigned audits
                            </div>

                            <div className={styles.tableWrapper}>
                                <DynamicAuditTable
                                    audits={filteredAudits}
                                    columns={columns}
                                    customActions={renderActions}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* AUDIT VIEW MODAL */}

            <AuditViewModal
                audit={selectedAudit}
                loading={viewLoading}
                onClose={() => setSelectedAudit(null)}
            />
        </div>
    );
}
