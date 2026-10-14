import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiEye,
    FiRefreshCw,
    FiSearch,
    FiRepeat,
    FiCircle,
    FiClock,
    FiUser,
    FiXCircle,
    FiUsers,
} from "react-icons/fi";
import Loader from "../utilities/Loader";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import AuditRejectedViewModal from "./AuditRejectedViewModal";
import ReassignAuditModal from "./ReassignAuditModal";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cardClass } from "../theme";
import AuditAssignmentModal from "./AuditAssignmentModal";
import StatCard from "../dashboard_/widgets/StatCard";

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
    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    // =====================================================
    // FETCH REJECTED AUDITS
    // =====================================================

    // static data 
    const USE_DUMMY_DATA = true;
    const dummyAudits = [
        {
            audit_id: 101,
            application_name: "DPDP Compliance Portal",
            auditor_name: "Rahul Sharma",
            department: "Banking",
            rejected_at: "2026-07-14T10:30:00",
            rejection_reason: "Currently handling another critical audit with overlapping deadlines.",
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
            rejection_reason: "Application belongs to my previous implementation team, creating a conflict of interest.",
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
            rejection_reason: "Currently on approved leave during the scheduled audit timeline.",
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
            rejection_reason: "Required domain expertise is unavailable within my assigned specialization.",
            status: "closed",
            available_auditors: 18,
            reassigned_at: "2026-07-12T13:00:00",
        },
    ];
    const fetchRejectedAudits = async () => {
        try {
            setLoading(true);

            const res = await fetchWithAuth("/api/audits/assignments/declined/", {
                method: "GET",
            });

            const data = await res.json();
            console.log(data);

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to fetch rejected audits."
                );
            }

            // if (USE_DUMMY_DATA) {
            //     setAudits(dummyAudits);
            // } else {
            setAudits(data);
            // }

        } catch (err) {
            console.error(err);

            // Show dummy data during development if API fails
            if (USE_DUMMY_DATA) {
                setAudits(dummyAudits);
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
        }
        catch {
        }
        finally {
            setRefreshing(false);
        }
    };
    // =====================================================
    // INITIAL LOAD
    // =====================================================
    useEffect(() => {
        fetchRejectedAudits();
    }, []);
    // ====================================================
    // FILTER DATA
    // =====================================================
    const filteredAudits = useMemo(() => {
        return audits.filter((audit) => {
            const searchMatch =
                audit.application_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                audit.auditor_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());
            const statusMatch =
                statusFilter === "all"
                    ? true
                    : audit.status === statusFilter;
            const departmentMatch =
                departmentFilter === "all"
                    ? true
                    : audit.department === departmentFilter;
            return (
                searchMatch &&
                statusMatch &&
                departmentMatch
            );
        });
    }, [
        audits,
        search,
        statusFilter,
        departmentFilter,
    ]);
    // =====================================================
    // SUMMARY COUNTS
    // =====================================================
    const totalRejected = audits.length;
    const pendingCount = audits.filter(
        (a) => a.status === "pending_reassignment"
    ).length;
    const reassignedToday = audits.filter((a) => {
        if (!a.reassigned_at) return false;
        const today = new Date().toDateString();
        return (
            new Date(a.reassigned_at).toDateString() === today
        );
    }).length;
    const availableAuditors =
        audits.length > 0
            ? audits[0].available_auditors ?? 0
            : 0;
    // =====================================================
    // FORMAT TABLE
    // =====================================================
    const formattedAudits = filteredAudits.map((audit) => ({
        id: audit.audit_id,
        application: audit.application_name,
        auditor: audit.auditor_name,
        department: audit.department,
        rejected_on: audit.assignment_responded_at,
        reason: audit.assignment_rejection_reason,
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
                <div className="max-w-xs truncate text-gray-300">
                    {value || "-"}
                </div>
            ),
        }
    ];
    // =====================================================
    // TABLE ACTIONS
    // =====================================================
    const renderActions = (row) => (
        <div className="flex items-center gap-3">
            {/* View */}
            <button
                onClick={() => setSelectedAudit(row.raw)}
                className="
                    p-2
                    rounded-lg
                    bg-indigo-500/10
                    hover:bg-indigo-500/20
                    text-indigo-300
                    transition"
            >
                <FiEye size={18} />
            </button>
            {/* Reassign */}
            <button
                onClick={() => setReassignAudit(row.raw)}
                className="
                    p-2
                    rounded-lg
                    bg-emerald-500/10
                    hover:bg-emerald-500/20
                    text-emerald-300
                    transition
                "
            >
                <FiRepeat size={18} />
            </button>
        </div>
    );
    // ====================================================
    // STATISTICS CARDS
    // =====================================================
    // const StatCard = ({ title, value, color }) => (
    //     <div className={`rounded-xl bg-[#0f172a]/80 border ${color} p-5`}>
    //         <p className="text-sm text-gray-400">{title}</p>
    //         <h2 className="mt-2 text-3xl font-bold text-white">{value}</h2>
    //     </div>
    // );
    // =====================================================
    // FILTER TOOLBAR
    // =====================================================
    const Toolbar = () => (
        <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Search */}
            <div
                className="
                    flex
                    items-center
                    bg-[#111827]
                    border
                    border-violet-800/30
                    rounded-xl
                    px-4
                    py-2
                    flex-1
                    min-w-70
                "
            >
                <FiSearch className="text-gray-500 mr-3" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search application or auditor..."
                    className="
                        bg-transparent
                        outline-none
                        w-full
                        text-gray-300
                    "
                />
            </div>
            {/* Refresh */}
            <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                    flex
                    items-center
                    gap-2
                    bg-indigo-600
                    hover:bg-indigo-500
                    px-4
                    py-2
                    rounded-xl
                    transition
                "
            >
                <FiRefreshCw
                    className={
                        refreshing
                            ? "animate-spin"
                            : ""
                    }
                />
                Refresh
            </button>
        </div>
    );
    // =====================================================
    // UI
    // =====================================================
    return (
        <div className="min-h-screen bg-linear-to-br from-[#0B1120] via-[#111827] to-[#0F172A] text-white p-6">
            {/* ========================= */}
            {/* BACK */}
            {/* ========================= */}
            <div
                onClick={() => navigate("/admindashboard")}
                className="
                    flex
                    items-center
                    gap-2
                    text-indigo-400
                    hover:text-indigo-300
                    cursor-pointer
                    mb-8
                    w-fit
                "
            >
                <FiArrowLeft />
                <span>Back to Dashboard</span>
            </div>
            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-indigo-300">
                    Reassign Audit Applications
                </h1>
                <p className="text-gray-400 mt-2">
                    Review rejected audit assignments and reassign them
                    to another auditor.
                </p>
            </div>
            {/* ========================= */}
            {/* FILTERS */}
            {/* ========================= */}
            <Toolbar />
            {/* ========================= */}
            {/* TABLE */}
            {/* ========================= */}
            <div className={`${cardClass} p-5`}>
                {loading ? (
                    <div className="h-112.5 flex items-center justify-center">
                        <Loader text="Loading rejected audits..." />
                    </div>
                ) : error ? (
                    <div className="h-112.5 flex items-center justify-center">
                        <p className="text-red-400 text-lg">
                            {error}
                        </p>
                    </div>
                ) : formattedAudits.length === 0 ? (
                    <div className="h-105 flex flex-col items-center justify-center">
                        <div className="text-6xl opacity-40 mb-4">
                            📂
                        </div>
                        <h2 className="text-xl text-gray-300">
                            No Rejected Audit Assignments
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Everything looks good.
                        </p>
                    </div>
                ) : (

                    <DynamicAuditTable
                        audits={formattedAudits}
                        columns={columns}
                        customActions={renderActions}
                    />
                )}
            </div>
            {/* ========================= */}
            {/* VIEW MODAL */}
            {/* ========================= */}
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
            {/* ========================= */}
            {/* REASSIGN MODAL */}
            {/* ========================= */}
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