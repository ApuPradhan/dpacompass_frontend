import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import DynamicAuditTable from "../AdminDashboard/DynamicAuditTable";

import { FiEye, FiPlay, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

import Loader from "../utilities/Loader";

import AuditViewModal from "./AuditViewModal";
import ScanResultViewer from "../utilities/ScanResultsViewer";

import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DataBreachScanner() {

    const navigate = useNavigate();

    const token = localStorage.getItem("access");

    const [pendingAudits, setPendingAudits] = useState([]);

    const [scannedAudits, setScannedAudits] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState(null);

    const [selectedAudit, setSelectedAudit] = useState(null);

    const [scanningAuditId, setScanningAuditId] = useState(null);

    const [selectedScanResult, setSelectedScanResult] = useState(null);
    const [resultLoading, setResultLoading] = useState(false);

    // =====================================================

    // FETCH DATA BREACH AUDITS

    // =====================================================

    const fetchDataBreachAudits = async (showLoader = true) => {

        try {

            if (showLoader) {

                setLoading(true);

            } else {

                setRefreshing(true);

            }

            setError(null);

            const res = await fetch(

                `${BASE_URL}/api/scanner/data-breach/audits/`,

                {

                    method: "GET",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`,

                    },

                }

            );

            const data = await res.json();

            if (!res.ok) {

                throw new Error(

                    data?.message ||

                    data?.error ||

                    "Failed to fetch Data Breach audits"

                );

            }

            setPendingAudits(data?.pending || []);

            setScannedAudits(data?.scanned || []);

        } catch (err) {

            console.error("Data Breach Scanner fetch error:", err);

            setError(

                err.message ||

                "Failed to load Data Breach Scanner data."

            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };

    // =====================================================

    // INITIAL LOAD

    // =====================================================

    useEffect(() => {

        fetchDataBreachAudits();

    }, []);

    // =====================================================

    // START DATA BREACH SCAN

    // =====================================================

    const handleScan = async (row) => {

        try {

            setScanningAuditId(row.audit_id);

            const res = await fetch(

                `${BASE_URL}/api/scanner/data-breach/${row.audit_id}/scan/`,

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

                throw new Error(

                    data?.message ||

                    data?.error ||

                    "Failed to start Data Breach scan"

                );

            }

            toast.success(

                data?.message ||

                "Data Breach scan started successfully."

            );

            // Refresh both lists after starting the scan

            await fetchDataBreachAudits(false);

        } catch (err) {

            console.error("Data Breach scan error:", err);

            toast.error(

                err.message ||

                "Failed to start Data Breach scan."

            );

        } finally {

            setScanningAuditId(null);

        }

    };

    // =====================================================

    // =====================================================
    // VIEW DATA BREACH SCAN RESULTS
    // =====================================================

    const handleViewScanResults = async (row) => {
        try {
            setResultLoading(true);
            setSelectedScanResult(null);

            const res = await fetch(
                `${BASE_URL}/api/scanner/data-breach/${row.audit_id}/results/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to fetch scan results"
                );
            }

            console.log("Data Breach Scan Results:", data);

            setSelectedScanResult(data);
        } catch (err) {
            console.error("Data Breach result error:", err);

            toast.error(
                err.message ||
                "Failed to load Data Breach scan results."
            );
        } finally {
            setResultLoading(false);
        }
    };

    // =====================================================
    // FORMAT PENDING AUDITS
    // =====================================================

    // =====================================================

    const formattedPendingAudits = pendingAudits.map((audit) => ({

        id: audit.audit_id,

        audit_id: audit.audit_id,

        application_id: audit.application_id,

        name:

            audit.application_name ||

            audit.name ||

            "N/A",

        auditor_name:

            audit.auditor_name ||

            "N/A",

        url:

            audit.url ||

            "",

        status:

            audit.status ||

            "pending",

        scan_status:

            audit.scan_status ||

            "pending",

        created_at:

            audit.created_at ||

            null,

    }));

    // =====================================================

    // FORMAT SCANNED AUDITS

    // =====================================================

    const formattedScannedAudits = scannedAudits.map((audit) => ({

        id: audit.audit_id,

        audit_id: audit.audit_id,

        application_id: audit.application_id,

        name:

            audit.application_name ||

            audit.name ||

            "N/A",

        auditor_name:

            audit.auditor_name ||

            "N/A",

        url:

            audit.url ||

            "",

        status:

            audit.status ||

            "completed",

        scan_status:

            audit.scan_status ||

            "completed",

        created_at:

            audit.created_at ||

            null,

        completed_at:

            audit.completed_at ||

            null,

    }));

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

                if (status === "running") {

                    return (

                        <span className="px-3 py-1 text-xs rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-400">

                            Running

                        </span>

                    );

                }

                if (status === "failed") {

                    return (

                        <span className="px-3 py-1 text-xs rounded-full border border-red-500/30 bg-red-500/20 text-red-400">

                            Failed

                        </span>

                    );

                }

                if (status === "completed") {

                    return (

                        <span className="px-3 py-1 text-xs rounded-full border border-green-500/30 bg-green-500/20 text-green-400">

                            Completed

                        </span>

                    );

                }

                return (

                    <span className="px-3 py-1 text-xs rounded-full border border-yellow-500/30 bg-yellow-500/20 text-yellow-400">

                        Pending

                    </span>

                );

            },

        },

    ];

    // =====================================================

    // PENDING ACTIONS

    // =====================================================

    const renderPendingActions = (row) => {

        const isScanning =

            scanningAuditId === row.audit_id;

        return (

            <div className="flex justify-center items-center gap-4">

                {/* VIEW */}

                <button

                    onClick={() => setSelectedAudit(row)}

                    className="text-indigo-400 hover:text-indigo-300 transition"

                    title="View Application"

                >

                    <FiEye size={17} />

                </button>

                {/* SCAN */}

                <button

                    disabled={isScanning}

                    onClick={() => handleScan(row)}

                    className={`transition ${isScanning

                            ? "text-gray-500 cursor-not-allowed"

                            : "text-green-400 hover:text-green-300"

                        }`}

                    title={

                        isScanning

                            ? "Starting scan..."

                            : "Start Data Breach Scan"

                    }

                >

                    {isScanning ? (

                        <FiRefreshCw

                            size={17}

                            className="animate-spin"

                        />

                    ) : (

                        <FiPlay size={17} />

                    )}

                </button>

            </div>

        );

    };

    // =====================================================

    // SCANNED ACTIONS

    // =====================================================

    const renderScannedActions = (row) => (

        <div className="flex justify-center items-center">

            <button

                onClick={() => handleViewScanResults(row)}

                className="text-indigo-400 hover:text-indigo-300 transition"

                title="View Scan Result"
                disabled={resultLoading}

            >

                <FiEye size={17} />

            </button>

        </div>

    );

    // =====================================================

    // UI

    // =====================================================

    return (

        <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

            {/* RESULT LOADING OVERLAY */}
            {resultLoading && !selectedScanResult && (
                <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center">
                    <div className="bg-[#111827] border border-gray-700 rounded-xl px-6 py-5">
                        <Loader text="Loading scan results..." />
                    </div>
                </div>
            )}

            {/* BACK */}

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

                </div>

                <button

                    onClick={() => fetchDataBreachAudits(false)}

                    disabled={refreshing}

                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#111827] text-gray-300 hover:text-white hover:border-indigo-500/50 transition"

                >

                    <FiRefreshCw

                        size={15}

                        className={

                            refreshing

                                ? "animate-spin"

                                : ""

                        }

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

                    <p className="text-red-400 mb-4">

                        {error}

                    </p>

                    <button

                        onClick={() => fetchDataBreachAudits()}

                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"

                    >

                        Retry

                    </button>

                </div>

            ) : (

                <div className="space-y-8">

                    {/* ================================================= */}

                    {/* PENDING APPLICATIONS */}

                    {/* ================================================= */}

                    <section>

                        <div className="flex items-center justify-between mb-4">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-200">

                                    Pending Applications

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    Accepted applications waiting for Data Breach scanning

                                </p>

                            </div>

                            <span className="px-3 py-1 rounded-full text-xs border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">

                                {formattedPendingAudits.length} Pending

                            </span>

                        </div>

                        <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">

                            {formattedPendingAudits.length === 0 ? (

                                <div className="py-10 text-center text-gray-500">

                                    No pending applications.

                                </div>

                            ) : (

                                <DynamicAuditTable

                                    audits={formattedPendingAudits}

                                    columns={columns}

                                    customActions={renderPendingActions}

                                    expandableContent={true}

                                />

                            )}

                        </div>

                    </section>

                    {/* ================================================= */}

                    {/* SCANNED APPLICATIONS */}

                    {/* ================================================= */}

                    <section>

                        <div className="flex items-center justify-between mb-4">

                            <div>

                                <h2 className="text-lg font-semibold text-gray-200">

                                    Scanned Applications

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    Applications with completed Data Breach scans

                                </p>

                            </div>

                            <span className="px-3 py-1 rounded-full text-xs border border-green-500/30 bg-green-500/10 text-green-400">

                                {formattedScannedAudits.length} Scanned

                            </span>

                        </div>

                        <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-4">

                            {formattedScannedAudits.length === 0 ? (

                                <div className="py-10 text-center text-gray-500">

                                    No scanned applications.

                                </div>

                            ) : (

                                <DynamicAuditTable

                                    audits={formattedScannedAudits}

                                    columns={columns}

                                    customActions={renderScannedActions}

                                    expandableContent={true}

                                />

                            )}

                        </div>

                    </section>

                </div>

            )}

            {/* SCANNER RESULT MODAL */}
            {selectedScanResult && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">

                    <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-[#111827] border border-gray-700 rounded-xl shadow-2xl">

                        {/* HEADER */}
                        <div className="sticky top-0 z-10 bg-[#111827] border-b border-gray-700 px-6 py-4 flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold text-indigo-400">
                                    Data Breach Scan Results
                                </h2>

                                <p className="text-sm text-gray-400 mt-1">
                                    {selectedScanResult.application?.name || "Application"}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedScanResult.application?.url || ""}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedScanResult(null)}
                                className="text-gray-400 hover:text-white text-2xl transition"
                                title="Close"
                            >
                                ×
                            </button>

                        </div>

                        {/* RESULTS */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">

                            {selectedScanResult.results?.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    No scanner results found.
                                </div>
                            ) : (
                                <div className="space-y-5">

                                    {selectedScanResult.results?.map((scanner) => {

                                        const scannerName = scanner.scanner
                                            ? scanner.scanner
                                                .replace(/_/g, " ")
                                                .replace(/\b\w/g, (c) => c.toUpperCase())
                                            : "Scanner";

                                        const scannerStatus =
                                            String(scanner.status || "").toUpperCase();

                                        return (
                                            <div
                                                key={scanner.job_id}
                                                className="border border-gray-700 rounded-xl overflow-hidden"
                                            >

                                                {/* SCANNER HEADER */}
                                                <div className="bg-[#0b1120] px-5 py-4 flex items-center justify-between">

                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-200">
                                                            {scannerName}
                                                        </h3>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Job ID: {scanner.job_id}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`px-3 py-1 text-xs rounded-full border ${scannerStatus === "COMPLETED"
                                                                ? "border-green-500/30 bg-green-500/20 text-green-400"
                                                                : scannerStatus === "FAILED"
                                                                    ? "border-red-500/30 bg-red-500/20 text-red-400"
                                                                    : "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                                                            }`}
                                                    >
                                                        {scannerStatus || "PENDING"}
                                                    </span>

                                                </div>

                                                {/* SCANNER RESULT */}
                                                <div className="p-5">

                                                    {scannerStatus === "COMPLETED" ? (
                                                        scanner.result ? (
                                                            <ScanResultViewer
                                                                result={scanner.result}
                                                            />
                                                        ) : (
                                                            <div className="py-6 text-center text-gray-500 text-sm">
                                                                Scanner completed but no formatted result was returned.
                                                            </div>
                                                        )
                                                    ) : scannerStatus === "FAILED" ? (
                                                        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10">
                                                            <p className="text-red-400 text-sm font-medium">
                                                                Scanner failed
                                                            </p>

                                                            <p className="text-sm text-gray-400 mt-1">
                                                                {scanner.error_message ||
                                                                    "No error message was provided."}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                                                            <p className="text-yellow-400 text-sm">
                                                                Scanner is still processing.
                                                            </p>
                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}

            <AuditViewModal

                audit={selectedAudit}

                onClose={() => setSelectedAudit(null)}

            />

        </div>

    );

}