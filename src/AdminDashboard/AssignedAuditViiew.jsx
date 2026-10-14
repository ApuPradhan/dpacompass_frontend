import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { FiEye } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditViewModal from "../AdminDashboard/AuditViewModal";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function NewAssignedAudit() {

    const navigate = useNavigate();

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const [typeMap, setTypeMap] = useState({});
    const [filter, setFilter] = useState("all"); // ✅ NEW

    // =========================
    // 📥 FETCH TYPES
    // =========================
    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(`/api/applications/types/`, {
                method: "GET",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch types");
            }

            const map = {};
            data.data.forEach((t) => {
                map[t.id] = t.name;
            });

            setTypeMap(map);

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // =========================
    // 📥 FETCH ASSIGNED AUDITS
    // =========================
    const fetchAssignedAudits = async () => {
        try {
            const res = await fetchWithAuth(`/api/audits/assigned/`, {
                method: "GET",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error("Failed to fetch assigned audits");
            }

            setAudits(data);

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedAudits();
        fetchTypes();
    }, []);

    // =========================
    // 🧠 HELPERS
    // =========================
    const getDaysLeft = (deadline) => {
        if (!deadline) return null;
        const diff = new Date(deadline) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    // =========================
    // 📊 FORMAT TABLE
    // =========================
    const formattedAudits = audits.map(a => ({
        id: a.audit_id,
        application_id: a.application_id,
        application_name: a.application_name || "N/A",
        auditor_name: a.auditor_name || "N/A",
        status: a.status,
        created_at: a.created_at,
        deadline: a.audit_deadline // ✅ NEW
    }));

    // =========================
    // 📊 SORT BY DEADLINE
    // =========================
    const sortedAudits = [...formattedAudits].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    // =========================
    // 📊 FILTER
    // =========================
    const filteredAudits = sortedAudits.filter(a => {
        const days = getDaysLeft(a.deadline);

        if (filter === "urgent") return days <= 5 && days > 0;
        if (filter === "overdue") return days <= 0;

        return true;
    });

    // =========================
    // 👁️ HANDLE VIEW
    // =========================
    const handleView = async (audit) => {
        try {
            setViewLoading(true);

            const appId = audit.application_id || audit.application;

            const res = await fetchWithAuth(
                `/api/applications/applications/${appId}/`,
                { method: "GET" }
            );
            const data = await res.json();

            if (!res.ok) throw new Error("Failed to fetch application");

            const appDetails = data.data;

            setSelectedAudit({
                ...audit,
                ...appDetails,
                type_name: typeMap[Number(appDetails?.type)] || "N/A",
            });

        } catch (err) {
            console.error(err);
            toast.error("Failed to load audit details");
        } finally {
            setViewLoading(false);
        }
    };

    // =========================
    // 📊 TABLE CONFIG
    // =========================
    const columns = [
        { key: "application_name", label: "Application" },
        { key: "auditor_name", label: "Auditor" },

        {
            key: "deadline",
            label: "Deadline",
            render: (value) => {
                if (!value) return "N/A";

                const daysLeft = getDaysLeft(value);

                let style = "text-gray-300";
                let alert = null;

                if (daysLeft <= 5 && daysLeft > 0) {
                    style = "text-red-400 animate-pulse"; // 🔥 urgent blinking
                    alert = "⚠️"; // alarm indicator
                } else if (daysLeft <= 0) {
                    style = "text-red-600 font-semibold"; // ❌ overdue strong red
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
                <span className={`px-3 py-1 text-xs rounded-full border
                    ${value === "assigned"
                        ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                        : value === "in_progress"
                            ? "text-blue-400 bg-blue-500/20 border-blue-500/30"
                            : "text-green-400 bg-green-500/20 border-green-500/30"
                    }`}
                >
                    {value}
                </span>
            ),
        },

        {
            key: "created_at",
            label: "Assigned On",
            render: (value) => new Date(value).toLocaleDateString(),
        },
    ];

    // =========================
    // 🎯 ACTIONS
    // =========================
    const renderActions = (row) => (
        <button
            onClick={() => handleView(row)}
            className="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
        >
            <FiEye size={18} />
        </button>
    );

    // =========================
    // 🧱 UI
    // =========================
    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            <h1 className="text-xl font-semibold text-indigo-400 mb-6">
                Assigned and Ongoing Audits
            </h1>

            {/* FILTER */}
            <div className="mb-4 flex gap-4">
                <button onClick={() => setFilter("all")} className="text-sm text-gray-300">All</button>
                <button onClick={() => setFilter("urgent")} className="text-sm text-yellow-400">Urgent</button>
                <button onClick={() => setFilter("overdue")} className="text-sm text-red-400">Overdue</button>
            </div>

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">

                {loading ? (
                    <Loader text="Loading audits..." />
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : filteredAudits.length === 0 ? (
                    <div className="text-center">No assigned audits</div>
                ) : (
                    <DynamicAuditTable
                        audits={filteredAudits}
                        columns={columns}
                        customActions={renderActions}
                    />
                )}

            </div>

            <AuditViewModal
                audit={selectedAudit}
                loading={viewLoading}
                onClose={() => setSelectedAudit(null)}
            />

        </div>
    );
}