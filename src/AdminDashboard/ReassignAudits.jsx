
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiEye,
    FiRefreshCw,
    FiSearch,
    FiRepeat,
    FiClock,
    FiUsers,
    FiXCircle,
    FiCheckCircle,
    FiClipboard,
} from "react-icons/fi";

import Loader from "../utilities/Loader";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuditAssignmentModal from "./AuditAssignmentModal";

export default function ReassignAudits() {
    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [audits, setAudits] = useState([]);

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [reassignAudit, setReassignAudit] = useState(null);

    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // =====================================================
    // LOCAL STYLING VARIABLES
    // =====================================================

    const styles = {
        page: "reassign-page",
        backButton: "reassign-back-button",
        pageHeader: "reassign-page-header",
        statsGrid: "reassign-stats-grid",
        statCard: "reassign-stat-card",
        toolbar: "reassign-toolbar",
        searchBox: "reassign-search-box",
        searchInput: "reassign-search-input",
        filterSelect: "reassign-filter-select",
        refreshButton: "reassign-refresh-button",
        tableCard: "reassign-table-card",
        tableHeader: "reassign-table-header",
        tableBody: "reassign-table-body",
        tableWrapper: "reassign-table-wrapper",
        actionButton: "reassign-action-button",
    };

    const primaryBlue = "#087FD3";

    // =====================================================
    // DUMMY DATA
    // =====================================================

    const USE_DUMMY_DATA = true;

    const dummyAudits = [
        {
            audit_id: 101,
            application_name: "DPDP Compliance Portal",
            auditor_name: "Rahul Sharma",
            department: "Banking",
            rejected_at: "2026-07-14T10:30:00",
            rejection_reason:
                "Currently handling another critical audit with overlapping deadlines.",
            status: "pending_reassignment",
            available_auditors: 18,
            reassigned_at: null,
        },
        {
            audit_id: 102,
            application_name: "HR Management System",
            auditor_name: "Amit Das",
            department: "Human Resources",
            rejected_at: "2026-07-13T16:15:00",
            rejection_reason:
                "Application belongs to my previous implementation team, creating a conflict of interest.",
            status: "pending_reassignment",
            available_auditors: 18,
            reassigned_at: null,
        },
        {
            audit_id: 103,
            application_name: "Finance ERP",
            auditor_name: "Sneha Roy",
            department: "Finance",
            rejected_at: "2026-07-12T09:40:00",
            rejection_reason:
                "Currently on approved leave during the scheduled audit timeline.",
            status: "reassigned",
            available_auditors: 18,
            reassigned_at: "2026-07-15T09:00:00",
        },
        {
            audit_id: 104,
            application_name: "Citizen Service Portal",
            auditor_name: "Rakesh Singh",
            department: "Government",
            rejected_at: "2026-07-11T12:45:00",
            rejection_reason:
                "Required domain expertise is unavailable within my assigned specialization.",
            status: "closed",
            available_auditors: 18,
            reassigned_at: "2026-07-12T13:00:00",
        },
    ];

    // =====================================================
    // FETCH REJECTED AUDITS
    // =====================================================

    const fetchRejectedAudits = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithAuth(
                "/api/audits/assignments/declined/",
                {
                    method: "GET",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to fetch rejected audits."
                );
            }

            setAudits(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error(err);

            if (USE_DUMMY_DATA) {
                setAudits(dummyAudits);
                setError(null);
            } else {
                setError(err.message);
                toast.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchRejectedAudits();
            toast.success("Audit list refreshed.");
        } finally {
            setRefreshing(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchRejectedAudits();
    }, []);

    // =====================================================
    // FILTER OPTIONS
    // =====================================================

    const departments = useMemo(() => {
        return [
            ...new Set(
                audits
                    .map((audit) => audit.department)
                    .filter(Boolean)
            ),
        ];
    }, [audits]);

    // =====================================================
    // FILTER DATA
    // =====================================================

    const filteredAudits = useMemo(() => {
        return audits.filter((audit) => {
            const searchTerm = search.toLowerCase().trim();

            const searchMatch =
                !searchTerm ||
                audit.application_name?.toLowerCase().includes(searchTerm) ||
                audit.auditor_name?.toLowerCase().includes(searchTerm) ||
                audit.department?.toLowerCase().includes(searchTerm);

            const statusMatch =
                statusFilter === "all" ||
                audit.status === statusFilter;

            const departmentMatch =
                departmentFilter === "all" ||
                audit.department === departmentFilter;

            return searchMatch && statusMatch && departmentMatch;
        });
    }, [audits, search, statusFilter, departmentFilter]);

    // =====================================================
    // SUMMARY COUNTS
    // =====================================================

    const totalRejected = audits.length;

    const pendingCount = audits.filter(
        (audit) => audit.status === "pending_reassignment"
    ).length;

    const reassignedCount = audits.filter(
        (audit) => audit.status === "reassigned"
    ).length;

    const reassignedToday = audits.filter((audit) => {
        if (!audit.reassigned_at) return false;

        return (
            new Date(audit.reassigned_at).toDateString() ===
            new Date().toDateString()
        );
    }).length;

    const availableAuditors =
        audits.length > 0
            ? audits[0].available_auditors ?? 0
            : 0;

    // =====================================================
    // FORMAT TABLE DATA
    // =====================================================

    const formattedAudits = filteredAudits.map((audit) => ({
        id: audit.audit_id,
        application: audit.application_name,
        auditor: audit.auditor_name,
        department: audit.department,

        rejected_on:
            audit.assignment_responded_at ||
            audit.rejected_at,

        reason:
            audit.assignment_rejection_reason ||
            audit.rejection_reason,

        status: audit.status,
        raw: audit,
    }));

    // =====================================================
    // TABLE COLUMNS
    // =====================================================

    const columns = [
        {
            key: "application",
            label: "Application",
        },
        {
            key: "auditor",
            label: "Declined By Auditor",
        },
        {
            key: "rejected_on",
            label: "Declined On",
            render: (value) =>
                value
                    ? new Date(value).toLocaleDateString()
                    : "N/A",
        },
        {
            key: "reason",
            label: "Reason",
            render: (value) => (
                <div
                    className="max-w-xs truncate text-sm text-slate-600"
                    title={value || "-"}
                >
                    {value || "-"}
                </div>
            ),
        },
    ];

    // =====================================================
    // TABLE ACTIONS
    // =====================================================

    const renderActions = (row) => (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setSelectedAudit(row.raw)}
                title="View audit details"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
            >
                <FiEye size={17} />
            </button>

            <button
                type="button"
                onClick={() => setReassignAudit(row.raw)}
                title="Reassign audit"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
            >
                <FiRepeat size={17} />
            </button>
        </div>
    );

    // =====================================================
    // STATISTICS
    // =====================================================

    const statistics = [
        {
            title: "Total Declined",
            value: totalRejected,
            description: "All declined assignments",
            icon: FiClipboard,
            iconColor: "#2563EB",
            iconBackground: "#EFF6FF",
            accent: "#3B82F6",
        },
        {
            title: "Pending Reassignment",
            value: pendingCount,
            description: "Awaiting a new auditor",
            icon: FiClock,
            iconColor: "#D97706",
            iconBackground: "#FFF7ED",
            accent: "#F59E0B",
        },
        {
            title: "Reassigned",
            value: reassignedCount,
            description: "Successfully reassigned",
            icon: FiCheckCircle,
            iconColor: "#059669",
            iconBackground: "#ECFDF5",
            accent: "#10B981",
        },
        {
            title: "Available Auditors",
            value: availableAuditors,
            description: `${reassignedToday} reassigned today`,
            icon: FiUsers,
            iconColor: "#7C3AED",
            iconBackground: "#F5F3FF",
            accent: "#8B5CF6",
        },
    ];

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className={styles.page}>
            <style>{`
                .reassign-page {
                    min-height: 100vh;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 28px 32px 40px;
                    background: #F4F7FB;
                    color: #1E293B;
                }

                .reassign-page *,
                .reassign-page *::before,
                .reassign-page *::after {
                    box-sizing: border-box;
                }

                .reassign-back-button {
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

                .reassign-back-button:hover {
                    color: #075EB5;
                }

                .reassign-page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 27px;
                }

                .reassign-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 18px;
                    width: 100%;
                    margin-bottom: 25px;
                }

                .reassign-stat-card {
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

                .reassign-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 7px 18px rgba(15, 23, 42, .08);
                }

                .reassign-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    margin-bottom: 22px;
                }

                .reassign-search-box {
                    display: flex;
                    align-items: center;
                    flex: 1 1 300px;
                    min-width: 220px;
                    height: 44px;
                    gap: 10px;
                    padding: 0 14px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    background: #FFFFFF;
                    transition: border-color .2s, box-shadow .2s;
                }

                .reassign-search-box:focus-within {
                    border-color: #087FD3;
                    box-shadow: 0 0 0 3px rgba(8, 127, 211, .12);
                }

                .reassign-search-input {
                    width: 100%;
                    min-width: 0;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: #1E293B;
                    font-size: 14px;
                }

                .reassign-search-input::placeholder {
                    color: #94A3B8;
                }

                .reassign-filter-select {
                    flex: 0 0 175px;
                    width: 175px;
                    height: 44px;
                    padding: 0 12px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    outline: none;
                    background: #FFFFFF;
                    color: #334155;
                    font-size: 14px;
                    cursor: pointer;
                }

                .reassign-filter-select:focus {
                    border-color: #087FD3;
                    box-shadow: 0 0 0 3px rgba(8, 127, 211, .12);
                }

                .reassign-refresh-button {
                    display: inline-flex;
                    flex: 0 0 auto;
                    height: 44px;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    padding: 0 19px;
                    border: 0;
                    border-radius: 8px;
                    background: #087FD3;
                    color: #FFFFFF;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(8, 127, 211, .2);
                    transition: background .2s, transform .2s;
                }

                .reassign-refresh-button:hover {
                    background: #0568B5;
                    transform: translateY(-1px);
                }

                .reassign-refresh-button:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                    transform: none;
                }

                .reassign-table-card {
                    width: 100%;
                    min-width: 0;
                    overflow: hidden;
                    border: 1px solid #DCE7F3;
                    border-radius: 12px;
                    background: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(15, 23, 42, .045);
                }

                .reassign-table-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 20px 24px;
                    border-bottom: 1px solid #E2EAF4;
                }

                .reassign-table-body {
                    padding: 20px 24px 24px;
                }

                .reassign-table-wrapper {
                    width: 100%;
                    overflow-x: auto;
                }

                .reassign-table-wrapper table {
                    width: 100%;
                    min-width: 760px;
                    border-collapse: collapse;
                    border-spacing: 0;
                    background: #FFFFFF;
                }

                .reassign-table-wrapper thead th {
                    padding: 14px 16px;
                    border-bottom: 1px solid #DCE7F3;
                    background: #EDF5FF;
                    color: #173B70;
                    font-size: 13px;
                    font-weight: 700;
                    text-align: left;
                    white-space: nowrap;
                }

                .reassign-table-wrapper tbody td {
                    padding: 15px 16px;
                    border-bottom: 1px solid #E8EEF5;
                    color: #334155;
                    font-size: 14px;
                    line-height: 1.5;
                    vertical-align: middle;
                }

                .reassign-table-wrapper tbody tr {
                    transition: background .15s ease;
                }

                .reassign-table-wrapper tbody tr:hover {
                    background: #F5F9FF;
                }

                .reassign-table-wrapper tbody tr:last-child td {
                    border-bottom: 0;
                }

                @media (max-width: 1100px) {
                    .reassign-stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .reassign-toolbar {
                        flex-wrap: wrap;
                    }

                    .reassign-search-box {
                        flex: 1 1 100%;
                    }

                    .reassign-filter-select {
                        flex: 1 1 160px;
                        width: auto;
                    }
                }

                @media (max-width: 640px) {
                    .reassign-page {
                        padding: 20px 14px 30px;
                    }

                    .reassign-page-header {
                        margin-bottom: 20px;
                    }

                    .reassign-stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                    }

                    .reassign-stat-card {
                        min-height: 120px;
                        padding: 13px;
                    }

                    .reassign-toolbar {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 10px;
                    }

                    .reassign-search-box {
                        grid-column: 1 / -1;
                        min-width: 0;
                    }

                    .reassign-filter-select {
                        width: 100%;
                        min-width: 0;
                        flex: initial;
                    }

                    .reassign-refresh-button {
                        grid-column: 1 / -1;
                        width: 100%;
                    }

                    .reassign-table-header {
                        align-items: flex-start;
                        padding: 17px;
                    }

                    .reassign-table-body {
                        padding: 15px;
                    }
                }

                @media (max-width: 380px) {
                    .reassign-stats-grid {
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
                <FiArrowLeft size={17} />
                Back to Dashboard
            </button>

            {/* PAGE HEADER */}

            <div className={styles.pageHeader}>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                        Reassign Audit Applications
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                        Review declined audit assignments and reassign them
                        to another auditor.
                    </p>
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 lg:flex">
                    <FiRepeat size={17} />
                    Audit Management
                </div>
            </div>

            {/* STATISTICS CARDS */}

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
                <div className={styles.searchBox}>
                    <FiSearch
                        size={18}
                        className="shrink-0 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search application or auditor..."
                        className={styles.searchInput}
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="cursor-pointer text-slate-400 hover:text-slate-700"
                            title="Clear search"
                        >
                            <FiXCircle size={17} />
                        </button>
                    )}
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending_reassignment">
                        Pending Reassignment
                    </option>
                    <option value="reassigned">Reassigned</option>
                    <option value="closed">Closed</option>
                </select>

                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Departments</option>

                    {departments.map((department) => (
                        <option key={department} value={department}>
                            {department}
                        </option>
                    ))}
                </select>

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

            {/* TABLE */}

            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div>
                        <h2 className="text-lg font-bold text-[#173B70]">
                            Declined Audit Assignments
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage and review declined auditor assignments.
                        </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {filteredAudits.length} Records
                    </span>
                </div>

                <div className={styles.tableBody}>
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <Loader text="Loading rejected audits..." />
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                                <FiXCircle size={27} />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                Unable to load audit assignments
                            </h3>

                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchRejectedAudits}
                                className="mt-5 rounded-lg bg-[#087FD3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0568B5]"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : formattedAudits.length === 0 ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                <FiClipboard size={29} />
                            </div>

                            <h3 className="text-lg font-semibold text-[#173B70]">
                                No Declined Audit Assignments
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                No audit assignments match your current
                                search and filter criteria.
                            </p>

                            {(search ||
                                statusFilter !== "all" ||
                                departmentFilter !== "all") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("all");
                                        setDepartmentFilter("all");
                                    }}
                                    className="mt-4 cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-800">
                                    {formattedAudits.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-800">
                                    {totalRejected}
                                </span>{" "}
                                assignments
                            </div>

                            <div className={styles.tableWrapper}>
                                <DynamicAuditTable
                                    audits={formattedAudits}
                                    columns={columns}
                                    customActions={renderActions}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* VIEW MODAL */}

            <AuditAssignmentModal
                mode="view"
                audit={selectedAudit}
                isOpen={!!selectedAudit}
                onClose={() => setSelectedAudit(null)}
                onAssign={(audit) => {
                    setSelectedAudit(null);
                    setReassignAudit(audit);
                }}
            />

            {/* REASSIGN MODAL */}

            <AuditAssignmentModal
                mode="reassign"
                audit={reassignAudit}
                isOpen={!!reassignAudit}
                onClose={() => setReassignAudit(null)}
                onSuccess={() => {
                    setReassignAudit(null);
                    fetchRejectedAudits();
                }}
            />
        </div>
    );
}
