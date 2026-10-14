import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { FiEye, FiPlay, FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditViewModal from "../AuditorDashboard/AuditViewModal";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NewAssignedAudit() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [startingAuditId, setStartingAuditId] = useState();

    // ---------------- START AUDIT ----------------
    const handleStartAudit = async (row) => {
        try {
            setStartingAuditId(row.id);

            const res = await fetch(
                `${BASE_URL}/api/audits/start/${row.id}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Failed to start audit");
            }

            toast.success("Audit started successfully");

            // TEMP FIX SCANNERS
            const scanConfigs = [
                "https_check",
                "tls_check",
                "security_headers_check",
                "cookie_security_check",
                "privacy_policy_check"
            ];

            const jobs = [];

            for (let scanner of scanConfigs) {
                const res = await fetch(`${BASE_URL}/api/scanner/webscan/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scanner_key: scanner,
                        target: row.url,
                        audit_id: row.id
                    })
                });

                const data = await res.json();

                jobs.push({
                    scanner,
                    jobId: data.job_id,
                    status: "QUEUED"
                });
            }

            const consentRes = await fetch(`${BASE_URL}/api/consent/scan/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: row.url,
                    audit_id: row.id
                })
            });

            const consentData = await consentRes.json();

            jobs.push({
                scanner: "consent_management_check",
                jobId: consentData.job_id,
                status: "QUEUED"
            });

            localStorage.setItem(
                `audit_${row.id}_jobs`,
                JSON.stringify(jobs)
            );

            navigate(`/auditor/startAudit/${row.application_id}`);

        } catch (err) {
            toast.error(err.message || "Failed to start audit");
        } finally {
            setStartingAuditId(null);
        }
    };

    // ---------------- FETCH ----------------
    const fetchAssignedAudits = async () => {
        try {
            const res = await fetch(
                `${BASE_URL}/api/audits/assigned/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError("Failed to fetch assigned audits");
                return;
            }

            const applicationIds = [...new Set(data.map(a => a.application))];

            // ---------------- APPLICATION FETCH ----------------
            const appResponses = await Promise.all(
                applicationIds.map(id =>
                    fetch(`${BASE_URL}/api/applications/applications/${id}/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }).then(res => res.json())
                )
            );

            const appMap = {};
            appResponses.forEach(app => {
                if (app?.data) {
                    appMap[app.data.id] = app.data;
                }
            });

            // ---------------- OLD CHECKLIST API (KEPT) ----------------
            // const checklistResponses = await Promise.all(
            //     applicationIds.map(id =>
            //         fetch(`${BASE_URL}/api/checklists/application/${id}/checklists/`,
            //             {
            //                 headers: {
            //                     "Content-Type": "application/json",
            //                     Authorization: `Bearer ${token}`,
            //                 },
            //             }).then(res => res.json())
            //     )
            // );

            // const checklistMap = {};
            // checklistResponses.forEach(res => {
            //     if (res?.application_id) {
            //         checklistMap[res.application_id] = res.checklists || [];
            //     }
            // });

            // ---------------- NEW CHECKLIST API ----------------
            const checklistResponses = await Promise.all(
                applicationIds.map(id =>
                    fetch(`${BASE_URL}/api/checklists/application/${id}/`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }).then(res => res.json())
                )
            );

            const checklistMap = {};
            checklistResponses.forEach(res => {
                if (res?.application?.id) {
                    checklistMap[res.application.id] = res.domains || [];
                }
            });

            // ---------------- MERGE ----------------
            const enrichedAudits = data.map(a => ({
                ...a,
                application_details: appMap[a.application] || null,
                domains: checklistMap[a.application] || [],
            }));

            setAudits(enrichedAudits);

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedAudits();
    }, []);

    // ---------------- FORMAT ----------------
    const formattedAudits = audits.map(a => ({
        id: a.id,
        application_id: a.application,
        name: a.application_details?.name || "N/A",
        auditor_name: a.auditor_name || "N/A",
        status: a.status || "N/A",
        created_at: a.created_at,
        department: a.application_details?.department,
        version: a.application_details?.version,
        description: a.application_details?.description,
        environment: a.application_details?.environment,
        url: a.application_details?.url,
        domains: a.domains // 🔥 NEW
    }));

    // ---------------- TABLE ----------------
    const columns = [
        { key: "name", label: "Application" },
        { key: "auditor_name", label: "Auditor" },
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
            render: (value) =>
                new Date(value).toLocaleDateString(),
        },
    ];

    // ---------------- ACTIONS ----------------
    const renderActions = (row) => (
        <div className="flex justify-center items-center gap-4">
            <button
                onClick={() => setSelectedAudit(row)}
                className="text-indigo-400 hover:text-indigo-300"
            >
                <FiEye />
            </button>

            <button
                disabled={startingAuditId === row.id}
                onClick={() => handleStartAudit(row)}
                className="text-green-400 hover:text-green-300"
            >
                <FiPlay />
            </button>
        </div>
    );

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            <div
                className="mb-10 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer"
                onClick={() => navigate("/auditdashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            <h1 className="text-xl font-semibold text-indigo-400 mb-6">
                Assigned Audits
            </h1>

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">

                {loading ? (
                    <Loader text="Loading audits..." />
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

            <AuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />
        </div>
    );
}