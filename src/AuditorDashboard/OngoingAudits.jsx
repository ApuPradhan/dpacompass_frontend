import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import Loader from "../utilities/Loader";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function OngoingAudits() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    // =========================
    // HELPERS
    // =========================
    const getDaysLeft = (deadline) => {
        if (!deadline) return null;
        const diff = new Date(deadline) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    // =========================
    // FETCH
    // =========================
    const fetchOngoingAudits = async () => {
        try {
            const res = await fetchWithAuth("/api/audits/inprogress");

            const data = await res.json();

            if (!res.ok) throw new Error();

            setAudits(data);

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOngoingAudits();
    }, []);

    // =========================
    // FORMAT + SORT + FILTER
    // =========================
    const formattedAudits = audits.map(a => ({
        id: a.audit_id,
        application_id: a.application_id,
        audit_id: a.audit_id,
        name: a.application_name || "N/A",
        auditor_name: a.auditor_name || "N/A",
        status: a.status,
        created_at: a.created_at,
        deadline: a.audit_deadline // ✅ REQUIRED
    }));

    const sortedAudits = [...formattedAudits].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    const filteredAudits = sortedAudits.filter(a => {
        const days = getDaysLeft(a.deadline);

        if (filter === "urgent") return days <= 5 && days > 0;
        if (filter === "overdue") return days <= 0;

        return true;
    });

    // =========================
    // TABLE
    // =========================
    const columns = [
        { key: "name", label: "Application" },
        { key: "auditor_name", label: "Auditor" },

        {
            key: "deadline",
            label: "Timeline",
            render: (value) => {
                if (!value) return "N/A";

                const daysLeft = getDaysLeft(value);

                let style = "text-gray-300";
                let alert = null;

                if (daysLeft <= 5 && daysLeft > 0) {
                    style = "text-red-400 animate-pulse";
                    alert = "⚠️";
                } else if (daysLeft <= 0) {
                    style = "text-red-600 font-semibold";
                    alert = "⛔";
                }

                return (
                    <div className="flex flex-col">
                        <span className={style}>
                            {alert && <span className="mr-1">{alert}</span>}
                            {new Date(value).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                            {daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Overdue"}
                        </span>
                    </div>
                );
            }
        },

        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    {value}
                </span>
            ),
        },
    ];

    // =========================
    // ACTIONS
    // =========================
    const renderActions = (row) => (
        <button
            onClick={() =>
                navigate(
                    `/auditor/ongoing/${row.application_id}?auditId=${row.audit_id}`
                )
            }
            className="text-indigo-400 hover:text-indigo-300"
        >
            <FiEye />
        </button>
    );

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6 relative">

            {/* FILTER (RIGHT SIDE) */}
            <div className="absolute top-6 right-6">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[#111827] border border-gray-700 text-sm px-3 py-2 rounded-lg text-gray-300"
                >
                    <option value="all">All</option>
                    <option value="urgent">Urgent</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* BACK */}
            <div
                className="mb-6 flex items-center gap-2 text-indigo-400 cursor-pointer"
                onClick={() => navigate("/auditdashboard")}
            >
                <FiArrowLeft />
                Back
            </div>

            <h1 className="text-xl font-semibold mb-4 text-indigo-300">
                Ongoing Audits
            </h1>

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">
                {loading ? (
                    <Loader text="Loading..." />
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : (
                    <DynamicAuditTable
                        audits={filteredAudits}
                        columns={columns}
                        customActions={renderActions}
                    />
                )}
            </div>
        </div>
    );
}