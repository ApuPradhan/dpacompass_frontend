import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import { FiEye, FiArrowLeft } from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditViewModal from "./AuditViewModal";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";



export default function DataBreachScanner_old() {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [startingAuditId, setStartingAuditId] = useState(null);
    const [globalLoading, setGlobalLoading] = useState(false);

    // ---------------- UTILS ----------------

    // ---------------- START AUDIT ----------------
    const handleStartAudit = async (row) => {
        try {
            setStartingAuditId(row.id);
            setGlobalLoading(true);

            // 1. START AUDIT
            const res = await fetchWithAuth(`/api/audits/start/${row.id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Failed to start audit");
            }

            const audit_id = data.audit_id;

            toast.success("Audit started");

            // 2. EXTRACT SCANNERS FROM CHECKLIST
            const scanners = extractScanners(row.domains);

            if (scanners.length === 0) {
                toast.warning("No automated scanners found");
                navigate(`/auditor/ongoing/${row.application_id}`);
                return;
            }

            // 3. SEQUENTIAL SCANNER EXECUTION
            for (let scanner of scanners) {
                try {
                    await fetchWithAuth("/api/scanner/webscan/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            scanner_key: scanner,
                            target: row.url,
                            audit_id: audit_id,
                        }),
                    });

                    await delay(1000); // 🔥 1 sec gap
                } catch (err) {
                    console.error("Scanner error:", scanner, err);
                }
            }

            // 4. NAVIGATE TO ONGOING PAGE
            navigate(`/auditor/ongoingaudits`);

        } catch (err) {
            toast.error(err.message || "Failed to start audit");
        } finally {
            setStartingAuditId(null);
            setGlobalLoading(false);
        }
    };

    // ---------------- FETCH ----------------
    const fetchAssignedAudits = async () => {
        try {
            const res = await fetchWithAuth("/api/audits/assigned/");

            const data = await res.json();
            // console.log(data);

            if (!res.ok) {
                setError("Failed to fetch assigned audits");
                return;
            }

            // console.log("assigned audits", data);

            // ✅ Use correct key: application_id
            const applicationIds = [...new Set(data.map(a => a.application_id))];
            console.log("applicationIds", applicationIds);

            // =========================
            // APPLICATION FETCH
            // =========================
            const appResponses = await Promise.all(
                applicationIds.map(id =>
                    fetchWithAuth(`/api/applications/applications/${id}/`)
                        .then(res => res.json())
                )
            );

            const appMap = {};
            appResponses.forEach(app => {
                if (app?.data) {
                    appMap[app.data.id] = app.data;
                }
            });

            // console.log("appMap", appMap);

            // =========================
            // CHECKLIST FETCH
            // =========================
            const checklistResponses = await Promise.all(
                applicationIds.map(id =>
                    fetchWithAuth(`/api/checklists/application/${id}/`)
                        .then(res => res.json())
                )
            );

            // console.log("checklistResponses", checklistResponses);

            const checklistMap = {};
            checklistResponses.forEach(res => {
                if (res?.application?.id) {
                    checklistMap[res.application.id] = res.domains || [];
                }
            });

            // console.log("checklistMap", checklistMap);

            // =========================
            // FINAL MERGE (FIXED)
            // =========================
            const enrichedAudits = data.map(a => ({
                ...a,
                application_details: appMap[a.application_id] || null,
                domains: checklistMap[a.application_id] || [],
            }));

            // console.log("enrichedAudits", enrichedAudits);

            setAudits(enrichedAudits);

        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    };
    // const fetchAssignedAudits = async () => {
    //     try {
    //         const res = await fetch(`${BASE_URL}/api/audits/assigned/`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });

    //         const data = await res.json();

    //         if (!res.ok) {
    //             setError("Failed to fetch assigned audits");
    //             return;
    //         }

    //         console.log("fetch assigned audits", data);

    //         // UNIQUE APPLICATION IDS
    //         const applicationIds = [...new Set(data.map(a => a.application))];
    //         console.log("applicationIds", applicationIds);

    //         // =========================
    //         // APPLICATION FETCH
    //         // =========================
    //         const appResponses = await Promise.all(
    //             applicationIds.map(id =>
    //                 fetch(`${BASE_URL}/api/applications/applications/${id}/`, {
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }).then(res => res.json())
    //             )
    //         );

    //         console.log("application responses", appResponses);

    //         const appMap = {};
    //         appResponses.forEach(app => {
    //             if (app?.data) {
    //                 appMap[app.data.id] = app.data;
    //             }
    //         });

    //         // =========================
    //         // CHECKLIST FETCH (FIXED)
    //         // =========================
    //         const checklistResponses = await Promise.all(
    //             applicationIds.map(id =>
    //                 fetch(`${BASE_URL}/api/checklists/application/${id}/`, {
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 })
    //                     .then(res => res.json())
    //                     .catch(() => null) // prevent crash if one fails
    //             )
    //         );

    //         console.log("checklist responses", checklistResponses);

    //         const checklistMap = {};

    //         checklistResponses.forEach((res, index) => {
    //             if (!res) return;

    //             const payload = res.data || res;

    //             // Case 1: API returns array
    //             if (Array.isArray(payload)) {
    //                 checklistMap[applicationIds[index]] = payload;
    //             }

    //             // Case 2: API returns object with application id
    //             else if (payload?.application) {
    //                 checklistMap[payload.application] = payload.domains || [];
    //             }
    //         });

    //         console.log("checklistMap", checklistMap);

    //         // =========================
    //         // MERGE FINAL DATA
    //         // =========================
    //         const enrichedAudits = data.map(a => ({
    //             ...a,
    //             application_details: appMap[a.application] || null,
    //             domains: checklistMap[a.application] || [],
    //         }));

    //         setAudits(enrichedAudits);

    //     } catch (err) {
    //         console.error(err);
    //         setError("Server error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        fetchAssignedAudits();
    }, []);

    // ---------------- FORMAT ----------------
    const formattedAudits = audits.map(a => ({
        id: a.audit_id,
        application_id: a.application_id,
        name: a.application_details?.name || "N/A",
        auditor_name: a.auditor_name || "N/A",
        status: a.status || "N/A",
        created_at: a.created_at,
        url: a.application_details?.url,
        domains: a.domains
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

            {/* GLOBAL LOADING OVERLAY */}
            {globalLoading && (
                <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white">
                    <div className="animate-spin border-4 border-indigo-500 border-t-transparent rounded-full w-12 h-12 mb-4"></div>
                    <p className="text-lg font-semibold">
                        Initializing Security Scans...
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Please wait while scanners are triggered
                    </p>
                </div>
            )}

            {/* BACK */}
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