import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "./DynamicAuditTable";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function ViewChecklist() {

    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChecklists = async () => {
        try {

            const res = await fetchWithAuth("/api/checklists/checklists/");
            const data = await res.json();

            if (res.ok) {
                setChecklists(data.data);
            } else {
                setError("Failed to fetch checklist");
            }

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChecklists();
    }, []);



    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this checklist?")) return;

        try {
            const res = await fetchWithAuth(
                `/api/checklists/checklists/delete/${id}/`,
                {
                    method: "DELETE",
                }
            );

            if (res.ok) {
                setChecklists(prev => prev.filter(c => c.id !== id));
            }

        } catch (err) {
            console.error(err);
        }
    };


    const formattedData = checklists.map(c => ({
        id: c.id,
        rule_id: c.rule_id,
        description: c.description,
        severity: c.severity,
        application_types: c.application_types,
        created_at: c.created_at,
    }));



    const columns = [
        {
            key: "rule_id",
            label: "Rule ID",
        },
        {
            key: "description",
            label: "Description",
        },
        {
            key: "severity",
            label: "Severity",
            render: (value) => (
                <span
                    className={`px-3 py-1 text-xs font-semibold uppercase rounded-full border
    ${value === "critical"
                            ? "text-red-500 bg-red-500/20 border-red-500/40"
                            : value === "high"
                                ? "text-orange-400 bg-orange-500/20 border-orange-500/30"
                                : value === "medium"
                                    ? "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                                    : "text-green-400 bg-green-500/20 border-green-500/30"
                        }`}
                >
                    {value}
                </span>
            ),
        },
        {
            key: "application_types",
            label: "Application Types",
            render: (types) => (
                <div className="flex flex-wrap gap-1">
                    {types.map(t => (
                        <span
                            key={t.id}
                            className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded"
                        >
                            {t.name}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            render: (value) =>
                new Date(value).toLocaleDateString(),
        },
    ];


    const renderActions = (row) => (
        <div className="flex justify-center gap-3">

            <button
                onClick={() => navigate(`/admin/editChecklist/${row.id}`)}
                className="text-indigo-400 hover:text-indigo-300"
            >
                <FiEdit size={18} />
            </button>

            <button
                onClick={() => handleDelete(row.id)}
                className="text-red-400 hover:text-red-300"
            >
                <FiTrash2 size={18} />
            </button>

        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-indigo-400">
                    Checklist
                </h1>

                <button
                    onClick={() => navigate("/admin/createChecklist")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg 
                               bg-indigo-600 hover:bg-indigo-700"
                >
                    <FiPlus size={16} />
                    Add Checklist
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : formattedData.length === 0 ? (
                    <div className="text-center">No checklist found</div>
                ) : (
                    <DynamicAuditTable
                        audits={formattedData}
                        columns={columns}
                        onView={() => { }}
                        customActions={renderActions}
                    />
                )}

            </div>
        </div>
    );
}