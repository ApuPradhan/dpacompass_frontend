
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import Loader from "../utilities/Loader";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function AcceptedAudits() {
    const navigate = useNavigate();

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAcceptedAudits = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithAuth(
                "/api/audits/assignments/accepted/"
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to fetch accepted audits"
                );
            }

            const applicationIds = [
                ...new Set(data.map(a => a.application_id))
            ];

            const appResponses = await Promise.all(
                applicationIds.map(async id => {
                    const r = await fetchWithAuth(
                        `/api/applications/applications/${id}/`
                    );
                    return r.json();
                })
            );

            const appMap = {};

            appResponses.forEach(app => {
                if (app?.data) {
                    appMap[app.data.id] = app.data;
                }
            });

            const enriched = data.map(a => ({
                ...a,
                application_details:
                    appMap[a.application_id] || null
            }));

            setAudits(enriched);

        } catch (err) {
            console.error(err);
            setError(err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAcceptedAudits();
    }, []);

    const formattedAudits = audits.map(a => ({
        id: a.audit_id,
        audit_id: a.audit_id,

        // Required for the Auditor Workspace route
        public_audit_id: a.public_audit_id,

        application_id: a.application_id,

        name: a.application_details?.name || "N/A",
        url: a.application_details?.url || "",

        auditor_name: a.auditor_name || "N/A",
        status: a.status || "accepted",
        created_at: a.created_at
    }));

    const columns = [
        {
            key: "name",
            label: "Application"
        },
        {
            key: "auditor_name",
            label: "Auditor"
        },
        {
            key: "status",
            label: "Status",
            render: () => (
                <span className="px-3 py-1 rounded-full text-xs border
                    border-green-500/30 bg-green-500/20 text-green-400">
                    Accepted
                </span>
            )
        },
        {
            key: "created_at",
            label: "Accepted On",
            render: value =>
                value ? new Date(value).toLocaleDateString() : "-"
        }
    ];

    const renderActions = row => (
        <div className="flex justify-center">
            <button
                type="button"
                disabled={!row.public_audit_id}
                onClick={() => {
                    if (!row.public_audit_id) {
                        setError("Public Audit ID is missing for this audit.");
                        return;
                    }

                    navigate(
                        `/auditor-workspace/${encodeURIComponent(
                            row.public_audit_id
                        )}`
                    );
                }}
                className="text-indigo-400 hover:text-indigo-300
                    disabled:opacity-40 disabled:cursor-not-allowed"
                title="Open Auditor Workspace"
            >
                <FiEye size={17} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            <button
                type="button"
                onClick={() => navigate("/auditdashboard")}
                className="mb-10 flex items-center gap-2 text-indigo-400
                    hover:text-indigo-300"
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </button>

            <h1 className="text-xl font-semibold text-indigo-400 mb-6">
                Accepted Audits
            </h1>

            <div className="bg-[#111827]/80 border border-gray-700
                rounded-xl p-4">

                {loading ? (
                    <Loader text="Loading accepted audits..." />
                ) : error ? (
                    <div className="text-red-400">{error}</div>
                ) : (
                    <DynamicAuditTable
                        audits={formattedAudits}
                        columns={columns}
                        customActions={renderActions}
                        expandableContent={true}
                    />
                )}

            </div>
        </div>
    );
}
