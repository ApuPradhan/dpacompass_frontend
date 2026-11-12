import React, { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    RefreshCw,
    Eye,
    Play,
    ClipboardCheck,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../../utilities/fetchWithAuth";


// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
// const CONSENT_API_BASE_URL =
//     import.meta.env.VITE_CONSENT_API_BASE_URL || "";

// const CONSENT_RUN_ENDPOINT =
//     import.meta.env.VITE_CONSENT_RUN_ENDPOINT || "";

const ConsentScanner = () => {
    const navigate = useNavigate();

    const [pendingApplications, setPendingApplications] =
        useState([]);

    const [scannedApplications, setScannedApplications] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [pendingError, setPendingError] =
        useState("");

    const [scannedError, setScannedError] =
        useState("");

    const [runningAuditId, setRunningAuditId] =
        useState(null);

    const [mappingAuditId, setMappingAuditId] =
        useState(null);

    const [mappingFeedback, setMappingFeedback] =
        useState({});

    // ============================================================
    // TOOL STATUS API
    // GET /api/audits/assigned/tool-status/
    // ============================================================

    const isFetchingRef = useRef(false);

    const fetchConsentStatus = async () => {
        const response = await fetchWithAuth(
            "/api/audits/assigned/tool-status/"
        );

        if (!response.ok) {
            throw new Error(
                `Tool Status API returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log("TOOL STATUS API RESPONSE:", data);

        return Array.isArray(data?.results)
            ? data.results
            : [];
    };

    // ============================================================
    // LOAD PENDING AND SCANNED APPLICATIONS
    // ============================================================

    const fetchAllData = async (showLoader = true) => {
        // Prevent overlapping requests during automatic polling.
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;

        if (showLoader) {
            setLoading(true);
        }

        setPendingError("");
        setScannedError("");

        try {
            const auditData = await fetchConsentStatus();
            const pending = [];
            const scanned = [];

            auditData.forEach((item) => {
                const consentTool = item?.tools?.consent_management || {};
                const consentStatus = String(
                    consentTool?.status || ""
                ).toUpperCase();

                // Preserve the property expected by the existing UI.
                const formattedItem = {
                    ...item,
                    consent_management: consentTool,
                };

                if (consentStatus === "NOT_EXECUTED") {
                    pending.push(formattedItem);
                } else if (
                    ["QUEUED", "RUNNING", "COMPLETED", "FAILED"].includes(
                        consentStatus
                    )
                ) {
                    scanned.push(formattedItem);
                }
            });

            console.log("PENDING CONSENT APPLICATIONS:", pending);
            console.log("SCANNED CONSENT APPLICATIONS:", scanned);

            setPendingApplications(pending);
            setScannedApplications(scanned);
        } catch (error) {
            console.error("Consent Tool Status Error:", error);

            setPendingApplications([]);
            setScannedApplications([]);

            const message =
                error?.message || "Failed to fetch consent applications.";

            setPendingError(message);
            setScannedError(message);
        } finally {
            isFetchingRef.current = false;

            if (showLoader) {
                setLoading(false);
            }
        }
    };

    // ============================================================
    // INITIAL LOAD + AUTOMATIC STATUS POLLING
    // ============================================================

    useEffect(() => {
        fetchAllData(true);

        const interval = setInterval(() => {
            fetchAllData(false);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // ============================================================
    // RUN CONSENT SCANNER
    // ============================================================

    const handleRunScanner = (audit) => {
        const publicAuditId =
            audit?.public_audit_id;

        const url =
            audit?.application?.url || "";

        const username =
            audit?.application?.username || "";

        const password =
            audit?.application?.password || "";

        if (!publicAuditId) {
            setPendingError(
                "Unable to start scanner: Public Audit ID is missing."
            );
            return;
        }

        if (!url) {
            setPendingError(
                "Unable to start scanner: Application URL is missing."
            );
            return;
        }

        navigate(
            "/consent-auto-audit",
            {
                state: {
                    configuration: {
                        public_audit_id:
                            publicAuditId,

                        url,

                        username,

                        password,

                        audit_id: publicAuditId
                    },
                },
            }
        );
    };

    // ============================================================
    // MAP CONSENT SCAN RESULTS TO AUDIT CHECKLISTS
    // POST /api/checklists/fetch-consent-result/<public_audit_id>/
    // ============================================================

    const handleMapToChecklist = async (application) => {
        const publicAuditId = application?.public_audit_id;
        const auditKey = application?.audit_id || publicAuditId;

        if (!publicAuditId) {
            setMappingFeedback((previous) => ({
                ...previous,
                [auditKey]: {
                    type: "error",
                    message: "Public Audit ID is missing. Cannot map checklist results.",
                },
            }));
            return;
        }

        if (mappingAuditId !== null) return;

        setMappingAuditId(auditKey);
        setMappingFeedback((previous) => ({
            ...previous,
            [auditKey]: null,
        }));

        try {
            const response = await fetchWithAuth(
                `/api/checklists/fetch-consent-result/${encodeURIComponent(publicAuditId)}/`,
                { method: "POST" }
            );

            let data = {};
            try {
                data = await response.json();
                console.log("Data from consent-fetch:", data);
                
            } catch {
                // The API may return an empty or non-JSON response.
            }

            if (!response.ok || data?.success !== true) {
                throw new Error(
                    data?.message ||
                    data?.detail ||
                    data?.error ||
                    `Checklist mapping failed (${response.status}).`
                );
            }

            setMappingFeedback((previous) => ({
                ...previous,
                [auditKey]: {
                    type: "success",
                    message: "Checklist Mapping done successfully.",
                    details: data,
                },
            }));
        } catch (error) {
            setMappingFeedback((previous) => ({
                ...previous,
                [auditKey]: {
                    type: "error",
                    message: error?.message || "Failed to map consent results to checklists.",
                },
            }));
        } finally {
            setMappingAuditId(null);
        }
    };

    // ============================================================
    // VIEW
    // ============================================================

    const handleView = (application) => {
        /*
         * View must always use the PUBLIC AUDIT ID.
         *
         * The result page uses:
         *
         * GET /api/audits/consent/result/<public_audit_id>/
         *
         * Therefore we must NOT use application.audit_id here.
         */

        const publicAuditId =
            application?.public_audit_id;

        if (!publicAuditId) {
            console.error(
                "Cannot view consent audit. Public Audit ID missing:",
                application
            );

            return;
        }

        console.log(
            "[Consent Scanner] Opening audit:",
            publicAuditId
        );

        navigate(
            `/consent-management/${encodeURIComponent(
                publicAuditId
            )}`
        );
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const getApplicationName = (item) =>
        item?.application?.name ||
        item?.application_name ||
        item?.name ||
        "Unknown Application";

    const getAuditorName = (item) =>
        item?.auditor?.username ||
        item?.auditor?.name ||
        "N/A";

    const getApplicationUrl = (item) =>
        item?.application?.url ||
        item?.url ||
        "N/A";

    const getFrontendStatus = (item) => {

        const status =
            String(
                item?.consent_management?.status ||
                ""
            ).toUpperCase();


        switch (status) {

            case "QUEUED":
                return "Queued";

            case "RUNNING":
                return "Running";

            case "COMPLETED":
                return "Completed";

            case "FAILED":
                return "Failed";

            case "NOT_EXECUTED":
                return "Pending";

            default:
                return "Pending";
        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070d1d] text-white">

                <div className="max-w-475 mx-auto px-4 py-8">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-10"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center justify-center min-h-100">

                        <div className="flex items-center gap-3 text-slate-400">

                            <RefreshCw
                                size={20}
                                className="animate-spin"
                            />

                            Loading consent management data...

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-[#070d1d] text-white">

            <div className="max-w-475 mx-auto px-4 py-8">

                {/* ==================================================
                    HEADER
                   ================================================== */}

                <div className="flex items-start justify-between">

                    <div>

                        <button
                            onClick={() =>
                                navigate(-1)
                            }
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-10"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                        <h1 className="text-xl font-semibold text-indigo-400">
                            Consent Management Scanner
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Website consent management checks for accepted audits
                        </p>

                    </div>

                    <button
                        onClick={fetchAllData}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0d1527] hover:bg-[#121c31] text-sm text-white"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                </div>

                {/* ==================================================
                    PENDING APPLICATIONS
                   ================================================== */}

                <section className="mt-8">

                    <div className="flex items-center justify-between mb-4">

                        <div>

                            <h2 className="text-lg font-semibold">
                                Pending Applications
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Accepted applications waiting for Consent scanning
                            </p>

                        </div>

                        <span className="px-3 py-1.5 rounded-full border border-yellow-600 bg-yellow-950/20 text-yellow-400 text-xs font-semibold">
                            {pendingApplications.length} Pending
                        </span>

                    </div>

                    {pendingError && (
                        <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950/30 text-red-400 text-sm">
                            {pendingError}
                        </div>
                    )}

                    <div className="border border-slate-700 rounded-xl bg-[#0b1324] overflow-hidden">

                        {pendingApplications.length === 0 ? (

                            <div className="min-h-25 flex items-center justify-center">

                                <p className="text-sm text-slate-500">
                                    No pending applications.
                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-slate-700">

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400">
                                                Application
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400">
                                                Auditor
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400">
                                                URL
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400">
                                                Scan Status
                                            </th>

                                            <th className="text-center px-6 py-4 text-xs font-semibold text-slate-400">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {pendingApplications.map(
                                            (item, index) => {

                                                const status =
                                                    getFrontendStatus(
                                                        item
                                                    );

                                                const isRunning =
                                                    runningAuditId ===
                                                    item?.audit_id ||
                                                    status ===
                                                    "Running";

                                                return (
                                                    <tr
                                                        key={
                                                            item?.audit_id ??
                                                            index
                                                        }
                                                        className="border-b border-slate-700 last:border-b-0 hover:bg-[#101a2d]"
                                                    >

                                                        {/* Application */}

                                                        <td className="px-6 py-4">

                                                            <div className="text-sm text-white font-medium">
                                                                {getApplicationName(
                                                                    item
                                                                )}
                                                            </div>

                                                        </td>

                                                        {/* Auditor */}

                                                        <td className="px-6 py-4">

                                                            <div className="text-sm text-slate-300">
                                                                {getAuditorName(
                                                                    item
                                                                )}
                                                            </div>

                                                        </td>

                                                        {/* URL */}

                                                        <td className="px-6 py-4">

                                                            <a
                                                                href={getApplicationUrl(
                                                                    item
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-slate-400 hover:text-indigo-400"
                                                            >
                                                                {getApplicationUrl(
                                                                    item
                                                                )}
                                                            </a>

                                                        </td>

                                                        {/* Status */}

                                                        <td className="px-6 py-4">

                                                            <span
                                                                className={
                                                                    isRunning
                                                                        ? "inline-flex px-3 py-1 rounded-full text-xs font-medium border border-blue-600 bg-blue-950/30 text-blue-400"
                                                                        : "inline-flex px-3 py-1 rounded-full text-xs font-medium border border-yellow-600 bg-yellow-950/30 text-yellow-400"
                                                                }
                                                            >
                                                                {isRunning
                                                                    ? "Running"
                                                                    : "Pending"}
                                                            </span>

                                                        </td>

                                                        {/* Actions */}

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center">

                                                                {!isRunning && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRunScanner(item)}
                                                                        disabled={runningAuditId !== null}
                                                                        title="Run Consent Scanner"
                                                                        className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 disabled:cursor-not-allowed transition"
                                                                    >
                                                                        <Play size={18} />
                                                                    </button>
                                                                )}

                                                                {isRunning && (
                                                                    <RefreshCw
                                                                        size={18}
                                                                        className="text-blue-400 animate-spin"
                                                                    />
                                                                )}

                                                            </div>
                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>

                {/* ==================================================
                    SCANNED APPLICATIONS
                   ================================================== */}

                <section className="mt-10">

                    <div className="flex items-center justify-between mb-4">

                        <div>

                            <h2 className="text-lg font-semibold">
                                Scanned Applications
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Applications with queued, running or completed Consent scans
                            </p>

                        </div>


                        <span className="
            px-3
            py-1.5
            rounded-full
            border
            border-emerald-600
            bg-emerald-950/20
            text-emerald-400
            text-xs
            font-semibold
        ">
                            {scannedApplications.length} Scanned
                        </span>

                    </div>


                    {/* Error */}

                    {scannedError && (

                        <div className="
            mb-4
            px-4
            py-3
            rounded-lg
            border
            border-red-800
            bg-red-950/30
            text-red-400
            text-sm
        ">
                            {scannedError}
                        </div>

                    )}


                    {/* Table */}

                    <div className="
        border
        border-slate-700
        rounded-xl
        bg-[#0b1324]
        overflow-hidden
    ">

                        {scannedApplications.length === 0 ? (

                            <div className="
                min-h-25
                flex
                items-center
                justify-center
            ">

                                <p className="
                    text-sm
                    text-slate-500
                ">
                                    No scanned applications.
                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="
                            border-b
                            border-slate-700
                        ">

                                            <th className="
                                text-left
                                px-6
                                py-4
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                                Application
                                            </th>


                                            <th className="
                                text-left
                                px-6
                                py-4
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                                Auditor
                                            </th>


                                            <th className="
                                text-left
                                px-6
                                py-4
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                                URL
                                            </th>


                                            <th className="
                                text-left
                                px-6
                                py-4
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                                Scan Status
                                            </th>


                                            <th className="
                                text-center
                                px-6
                                py-4
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {scannedApplications.map(
                                            (item, index) => {

                                                const status =
                                                    getFrontendStatus(
                                                        item
                                                    );


                                                const normalizedStatus =
                                                    String(
                                                        item?.consent_management?.status ||
                                                        ""
                                                    ).toUpperCase();


                                                return (

                                                    <tr
                                                        key={
                                                            item?.audit_id ||
                                                            item?.public_audit_id ||
                                                            index
                                                        }
                                                        className="
                                            border-b
                                            border-slate-700
                                            last:border-b-0
                                            hover:bg-[#101a2d]
                                        "
                                                    >

                                                        {/* Application */}

                                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                                            <div className="
                                                text-sm
                                                text-white
                                                font-medium
                                            ">
                                                                {getApplicationName(
                                                                    item
                                                                )}
                                                            </div>

                                                        </td>


                                                        {/* Auditor */}

                                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                                            <div className="
                                                text-sm
                                                text-slate-300
                                            ">
                                                                {getAuditorName(
                                                                    item
                                                                )}
                                                            </div>

                                                        </td>


                                                        {/* URL */}

                                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                                            <a
                                                                href={getApplicationUrl(
                                                                    item
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="
                                                    text-sm
                                                    text-slate-400
                                                    hover:text-indigo-400
                                                "
                                                            >
                                                                {getApplicationUrl(
                                                                    item
                                                                )}
                                                            </a>

                                                        </td>


                                                        {/* Status */}

                                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                                            <span
                                                                className={`
                                                    inline-flex
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-medium

                                                    ${normalizedStatus ===
                                                                        "COMPLETED"

                                                                        ? `
                                                                border
                                                                border-emerald-600
                                                                bg-emerald-950/30
                                                                text-emerald-400
                                                              `

                                                                        : normalizedStatus ===
                                                                            "RUNNING"

                                                                            ? `
                                                                border
                                                                border-blue-600
                                                                bg-blue-950/30
                                                                text-blue-400
                                                              `

                                                                            : normalizedStatus ===
                                                                                "FAILED"
                                                                                ? `
                                                                border
                                                                border-red-600
                                                                bg-red-950/30
                                                                text-red-400
                                                              `
                                                                                : normalizedStatus ===
                                                                                    "QUEUED"
                                                                                    ? `
                                                                border
                                                                border-indigo-600
                                                                bg-indigo-950/30
                                                                text-indigo-400
                                                              `
                                                                                    : `
                                                                border
                                                                border-yellow-600
                                                                bg-yellow-950/30
                                                                text-yellow-400
                                                              `
                                                                    }
                                                `}
                                                            >
                                                                {status}
                                                            </span>

                                                        </td>


                                                        {/* Actions */}

                                                        <td className="
                                            px-6
                                            py-4
                                        ">

                                                            <div className="
                                                flex
                                                flex-col
                                                items-center
                                                justify-center
                                                gap-2
                                            ">

                                                                <div className="flex items-center justify-center gap-4">
                                                                    {/* VIEW SCAN RESULTS */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleView(item)}
                                                                        title="View scan results"
                                                                        className="text-indigo-400 hover:text-indigo-300 transition"
                                                                    >
                                                                        <Eye size={18} />
                                                                    </button>

                                                                    {/* MAP ONLY AFTER SCAN COMPLETION */}
                                                                    {normalizedStatus === "COMPLETED" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMapToChecklist(item)}
                                                                            disabled={mappingAuditId !== null}
                                                                            title="Map to Checklist"
                                                                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-500/60 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 transition"
                                                                        >
                                                                            {mappingAuditId === (item?.audit_id || item?.public_audit_id) ? (
                                                                                <Loader2 size={14} className="animate-spin" />
                                                                            ) : (
                                                                                <ClipboardCheck size={14} />
                                                                            )}
                                                                            Map to Checklist
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {mappingFeedback[item?.audit_id || item?.public_audit_id] && (
                                                                    <div
                                                                        className={`max-w-xs text-center text-xs ${
                                                                            mappingFeedback[item?.audit_id || item?.public_audit_id]?.type === "success"
                                                                                ? "text-emerald-400"
                                                                                : "text-red-400"
                                                                        }`}
                                                                    >
                                                                        <span className="inline-flex items-center gap-1">
                                                                            {mappingFeedback[item?.audit_id || item?.public_audit_id]?.type === "success" && (
                                                                                <CheckCircle2 size={13} />
                                                                            )}
                                                                            {mappingFeedback[item?.audit_id || item?.public_audit_id]?.message}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
};

export default ConsentScanner;