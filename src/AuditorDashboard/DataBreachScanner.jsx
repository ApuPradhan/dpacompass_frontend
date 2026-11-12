
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";
import {
    FiEye,
    FiPlay,
    FiArrowLeft,
    FiRefreshCw,
    FiClipboard,
} from "react-icons/fi";
import Loader from "../utilities/Loader";
import AuditViewModal from "./AuditViewModal";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

export default function DataBreachScanner() {
    const navigate = useNavigate();

    const [pendingAudits, setPendingAudits] = useState([]);
    const [runningAudits, setRunningAudits] = useState([]);
    const [completedAudits, setCompletedAudits] = useState([]);
    const [failedAudits, setFailedAudits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [selectedAudit, setSelectedAudit] = useState(null);
    const [mappingAuditId, setMappingAuditId] = useState(null);

    const isFetchingRef = useRef(false);

    // =====================================================
    // FETCH DATA BREACH AUDITS
    // =====================================================

    const fetchDataBreachAudits = useCallback(async (showLoader = false) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        try {
            if (showLoader) {
                setLoading(true);
            }

            setError(null);

            const res = await fetchWithAuth(
                "/api/audits/assigned/tool-status/",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to fetch audit tool statuses"
                );
            }

            const audits = Array.isArray(data?.results)
                ? data.results
                : [];

            const formattedAudits = audits.map((audit) => {
                const application = audit.application || {};
                const auditor = audit.auditor || {};
                const breachTool = audit.tools?.breach_management || {};

                const toolStatus = String(
                    breachTool.status || "NOT_EXECUTED"
                ).toUpperCase();

                let scanStatus = "pending";

                if (toolStatus === "RUNNING") {
                    scanStatus = "running";
                } else if (toolStatus === "COMPLETED") {
                    scanStatus = "completed";
                } else if (toolStatus === "FAILED") {
                    scanStatus = "failed";
                }

                return {
                    id: audit.audit_id,
                    audit_id: audit.audit_id,
                    public_audit_id: audit.public_audit_id,

                    application_id: application.id,
                    name: application.name || "N/A",

                    auditor_name:
                        auditor.username ||
                        auditor.name ||
                        "N/A",

                    url: application.url || "",

                    status: audit.dpacompass_status || "assigned",
                    scan_status: scanStatus,
                    tool_status: toolStatus,

                    tool_exists: Boolean(breachTool.exists),
                    progress: breachTool.progress ?? 0,
                    started_at: breachTool.started_at || null,
                    completed_at: breachTool.completed_at || null,
                    error_message: breachTool.error_message || null,
                    findings_count: breachTool.findings_count ?? null,

                    application,
                    auditor,
                    original_audit: audit,
                };
            });

            setPendingAudits(
                formattedAudits.filter(
                    (audit) => audit.scan_status === "pending"
                )
            );

            setRunningAudits(
                formattedAudits.filter(
                    (audit) => audit.scan_status === "running"
                )
            );

            setCompletedAudits(
                formattedAudits.filter(
                    (audit) => audit.scan_status === "completed"
                )
            );

            setFailedAudits(
                formattedAudits.filter(
                    (audit) => audit.scan_status === "failed"
                )
            );
        } catch (err) {
            console.error("Data Breach Scanner fetch error:", err);

            setError(
                err.message ||
                "Failed to load Data Breach Scanner data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
            isFetchingRef.current = false;
        }
    }, []);

    // =====================================================
    // INITIAL LOAD + AUTOMATIC POLLING EVERY 4 SECONDS
    // =====================================================

    useEffect(() => {
        fetchDataBreachAudits(true);

        const interval = setInterval(() => {
            fetchDataBreachAudits(false);
        }, 4000);

        return () => clearInterval(interval);
    }, [fetchDataBreachAudits]);

    // =====================================================
    // MANUAL REFRESH
    // =====================================================

    const handleRefresh = () => {
        if (isFetchingRef.current) return;

        setRefreshing(true);
        fetchDataBreachAudits(false);
    };

    // =====================================================
    // START DATA BREACH SCAN
    // =====================================================

    const handleScan = (row) => {
        if (!row?.audit_id) {
            toast.error("Audit ID is missing. Cannot configure the scan.");
            return;
        }

        if (!row?.public_audit_id) {
            toast.error("Public Audit ID is missing.");
            return;
        }

        navigate(
            `/data-breach-scan-config/${encodeURIComponent(row.audit_id)}`,
            {
                state: {
                    audit: row,
                },
            }
        );
    };

    // =====================================================
    // NAVIGATE TO DATA BREACH SCAN RESULT PAGE
    // =====================================================

    const handleViewScanResults = (row) => {
        if (!row?.public_audit_id) {
            toast.error("Public Audit ID is missing.");
            return;
        }

        navigate(
            `/user/data-breach-scan/${encodeURIComponent(
                row.public_audit_id
            )}/result`,
            {
                state: {
                    audit_id: row.audit_id,
                    public_audit_id: row.public_audit_id,
                    application: row.application,
                    auditor: row.auditor,
                },
            }
        );
    };

    // =====================================================
    // MAP COMPLETED DATA BREACH RESULT TO CHECKLIST
    // =====================================================

    const handleMapToChecklist = async (row) => {
        const publicAuditId = row?.public_audit_id;

        if (!publicAuditId) {
            toast.error("Public Audit ID is missing. Cannot map checklist results.");
            return;
        }

        if (mappingAuditId) return;

        setMappingAuditId(publicAuditId);

        try {
            const response = await fetchWithAuth(
                `/api/checklists/fetch-breach-result/${encodeURIComponent(publicAuditId)}/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data?.success !== true) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to map Data Breach results to the checklist."
                );
            }

            toast.success(
                `Checklist mapped successfully. ${data.total_saved ?? 0} results saved.`
            );
        } catch (err) {
            console.error("Data Breach checklist mapping error:", err);
            toast.error(
                err?.message || "Unable to map Data Breach results to checklist."
            );
        } finally {
            setMappingAuditId(null);
        }
    };

    // =====================================================
    // TABLE COLUMNS
    // =====================================================

    const columns = [
        {
            key: "name",
            label: "Application",
        },
        {
            key: "auditor_name",
            label: "Auditor",
        },
        {
            key: "url",
            label: "URL",
            render: (value) => (
                <span
                    className="block max-w-75 truncate text-gray-400"
                    title={value}
                >
                    {value || "-"}
                </span>
            ),
        },
        {
            key: "scan_status",
            label: "Scan Status",
            render: (value) => {
                const status = String(value || "").toLowerCase();

                const styles = {
                    pending:
                        "border-yellow-500/30 bg-yellow-500/20 text-yellow-400",
                    running:
                        "border-blue-500/30 bg-blue-500/20 text-blue-400",
                    completed:
                        "border-green-500/30 bg-green-500/20 text-green-400",
                    failed:
                        "border-red-500/30 bg-red-500/20 text-red-400",
                };

                return (
                    <span
                        className={`px-3 py-1 text-xs rounded-full border ${styles[status] || styles.pending
                            }`}
                    >
                        {status
                            ? status.charAt(0).toUpperCase() + status.slice(1)
                            : "Pending"}
                    </span>
                );
            },
        },
    ];

    // =====================================================
    // PENDING ACTIONS
    // View Application + Start Scan
    // =====================================================

    const renderPendingActions = (row) => (
        <div className="flex justify-center items-center gap-4">
            <button
                onClick={() => setSelectedAudit(row)}
                className="text-indigo-400 hover:text-indigo-300 transition"
                title="View Application"
            >
                <FiEye size={17} />
            </button>

            <button
                onClick={() => handleScan(row)}
                className="text-green-400 hover:text-green-300 transition"
                title="Start Data Breach Scan"
            >
                <FiPlay size={17} />
            </button>
        </div>
    );

    // =====================================================
    // RUNNING ACTIONS
    // No action button
    // =====================================================

    const renderRunningActions = () => null;

    // =====================================================
    // COMPLETED ACTIONS
    // =====================================================

    const renderCompletedActions = (row) => (
        <div className="flex justify-center items-center gap-3">
            <button
                onClick={() => handleViewScanResults(row)}
                className="text-indigo-400 hover:text-indigo-300 transition"
                title="View Scan Result"
            >
                <FiEye size={17} />
            </button>

            <button
                onClick={() => handleMapToChecklist(row)}
                disabled={Boolean(mappingAuditId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${mappingAuditId === row.public_audit_id
                        ? "border-gray-600 bg-gray-700/40 text-gray-500 cursor-not-allowed"
                        : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
            >
                {mappingAuditId === row.public_audit_id ? (
                    <span className="flex items-center gap-2">
                        <FiRefreshCw size={13} className="animate-spin" />
                        Mapping...
                    </span>
                ) : (
                    "Map to Checklist"
                )}
            </button>
        </div>
    );

    // =====================================================
    // FAILED ACTIONS
    // =====================================================

    const renderFailedActions = (row) => (
        <div className="flex justify-center items-center">
            <button
                onClick={() => handleViewScanResults(row)}
                className="text-indigo-400 hover:text-indigo-300 transition"
                title="View Scan Details"
            >
                <FiEye size={17} />
            </button>
        </div>
    );

    // =====================================================
    // REUSABLE AUDIT SECTION
    // =====================================================

    const renderAuditSection = ({
        title,
        description,
        audits,
        statusLabel,
        statusColor,
        actions,
        emptyMessage,
    }) => (
        <section>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-200">
                        {title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        {description}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs border ${statusColor}`}
                >
                    {audits.length} {statusLabel}
                </span>
            </div>

            <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">
                {audits.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    <DynamicAuditTable
                        audits={audits}
                        columns={columns}
                        customActions={actions}
                        expandableContent={true}
                    />
                )}
            </div>
        </section>
    );

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            {/* BACK TO DASHBOARD */}

            <div
                className="mb-8 flex items-center gap-2 text-xl text-indigo-400 cursor-pointer"
                onClick={() => navigate("/auditdashboard")}
            >
                <FiArrowLeft size={16} />
                <span>Back to Dashboard</span>
            </div>

            {/* HEADER */}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-indigo-400">
                        Data Breach Scanner
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        Website security and data breach checks for accepted audits
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Status automatically refreshes every 4 seconds.
                    </p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#111827] text-gray-300 hover:text-white hover:border-indigo-500/50 transition"
                >
                    <FiRefreshCw
                        size={15}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* CONTENT */}

            {loading ? (
                <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-6">
                    <Loader text="Loading Data Breach Scanner..." />
                </div>
            ) : error ? (
                <div className="bg-[#111827]/80 border border-red-500/30 rounded-xl p-6">
                    <p className="text-red-400 mb-4">{error}</p>

                    <button
                        onClick={() => fetchDataBreachAudits(true)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="space-y-8">

                    {renderAuditSection({
                        title: "Pending Applications",
                        description:
                            "Applications where Data Breach scanning has not been executed",
                        audits: pendingAudits,
                        statusLabel: "Pending",
                        statusColor:
                            "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
                        actions: renderPendingActions,
                        emptyMessage: "No pending applications.",
                    })}

                    {renderAuditSection({
                        title: "Running Applications",
                        description:
                            "Data Breach scans currently in progress",
                        audits: runningAudits,
                        statusLabel: "Running",
                        statusColor:
                            "border-blue-500/30 bg-blue-500/10 text-blue-400",
                        actions: renderRunningActions,
                        emptyMessage: "No running applications.",
                    })}

                    {renderAuditSection({
                        title: "Completed Applications",
                        description:
                            "Applications with successfully completed Data Breach scans",
                        audits: completedAudits,
                        statusLabel: "Completed",
                        statusColor:
                            "border-green-500/30 bg-green-500/10 text-green-400",
                        actions: renderCompletedActions,
                        emptyMessage: "No completed applications.",
                    })}

                    {renderAuditSection({
                        title: "Failed Applications",
                        description:
                            "Applications where the Data Breach scan failed",
                        audits: failedAudits,
                        statusLabel: "Failed",
                        statusColor:
                            "border-red-500/30 bg-red-500/10 text-red-400",
                        actions: renderFailedActions,
                        emptyMessage: "No failed applications.",
                    })}

                </div>
            )}

            {/* VIEW APPLICATION MODAL */}

            <AuditViewModal
                audit={selectedAudit}
                onClose={() => setSelectedAudit(null)}
            />
        </div>
    );
}
