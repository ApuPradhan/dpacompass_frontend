import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    RefreshCw,
    Globe,
    Clock3,
    Eye,
    LoaderCircle,
    CircleCheck,
    CircleX,
    ListChecks,
    FileSearch,
    ClipboardCheck,
    Download,
    Printer,
    X,
    FileText,
} from "lucide-react";

import {
    getDpacompassAudits,
    getCompleteConsentScanResult,
    getConsentChecklistAssessment,
    getSelfCheckConsentReport,
} from "./selfCheckConsentApi";

const normalizeStatus = (value) =>
    String(value || "UNKNOWN").trim().toUpperCase();

const getStatus = (scan) =>
    scan?.consent_management?.status ??
    scan?.consent_status ??
    scan?.status ??
    "UNKNOWN";

const getId = (scan) =>
    scan?.public_audit_id ?? scan?.audit_id ?? scan?.id;

const getUrl = (scan) =>
    scan?.application?.url ?? scan?.url ?? scan?.website_url ?? "URL unavailable";

const getDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
};

// These are fallback labels for queued steps, where the API currently returns result: {}.
// Prefer result.title whenever the backend supplies it.
const STEP_TITLES = {
    "STEP-01": "Identify Personal Data Collection Points",
    "STEP-02": "Verify Notice Before or at Personal-Data Collection",
    "STEP-04": "Verify Collection Form and Notice Evidence",
    "STEP-05": "Assess Processing Purpose and Consent Dependency",
    "STEP-07": "Verify Optional Consent Controls",
    "STEP-11": "Assess Preference Management Interface",
    "STEP-13": "Inspect Cookies and Browser Storage",
};

const getStepTitle = (step, index) =>
    step?.result?.title ||
    step?.title ||
    STEP_TITLES[String(step?.step_id || "").toUpperCase()] ||
    step?.step_id ||
    `Step ${index + 1}`;

const TERMINAL_STEP_STATUSES = new Set([
    "COMPLETED",
    "SUCCESS",
    "FAILED",
    "ERROR",
    "CANCELLED",
    "SKIPPED",
]);

const getStepsFromResponse = (data) => {
    const raw = data?.steps ?? data?.step_results ?? data?.results ?? [];
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
        return Object.entries(raw).map(([step_id, value]) =>
            typeof value === "object" && value !== null
                ? { step_id, ...value }
                : { step_id, status: value, result: {} }
        );
    }
    return [];
};

const areAllStepsFinished = (steps) =>
    steps.length > 0 && steps.every((step) =>
        TERMINAL_STEP_STATUSES.has(normalizeStatus(step.status))
    );

const getScanGroups = (scans) => {
    const groups = { QUEUED: [], RUNNING: [], COMPLETED: [], FAILED: [] };
    scans.forEach((scan) => {
        const status = normalizeStatus(getStatus(scan));
        if (["QUEUED", "PENDING"].includes(status)) groups.QUEUED.push(scan);
        else if (["RUNNING", "IN_PROGRESS"].includes(status)) groups.RUNNING.push(scan);
        else if (["COMPLETED", "SUCCESS"].includes(status)) groups.COMPLETED.push(scan);
        else if (["FAILED", "ERROR", "CANCELLED"].includes(status)) groups.FAILED.push(scan);
    });
    return groups;
};

const sections = [
    { key: "QUEUED", title: "Queued Scans", description: "Scans waiting to begin.", color: "text-amber-300", badge: "border-amber-700 bg-amber-950/30 text-amber-300" },
    { key: "RUNNING", title: "Running Scans", description: "Scans currently being processed.", color: "text-blue-300", badge: "border-blue-700 bg-blue-950/30 text-blue-300" },
    { key: "COMPLETED", title: "Completed Scans", description: "Scans that have finished successfully.", color: "text-emerald-300", badge: "border-emerald-700 bg-emerald-950/30 text-emerald-300" },
    { key: "FAILED", title: "Failed Scans", description: "Scans that failed or were cancelled.", color: "text-red-300", badge: "border-red-800 bg-red-950/30 text-red-300" },
];

const checklistItemsFromResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    return [];
};
function ConsentReportModal({ html, scanId, onClose }) {
    const [actionError, setActionError] = useState("");

    const handleDownloadHtml = () => {
        try {
            const blob = new Blob([html], {
                type: "text/html;charset=utf-8",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${scanId}-consent-report.html`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            setActionError("Unable to download the HTML report.");
        }
    };

    const handleDownloadPdf = () => {
        setActionError("");

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            setActionError(
                "Pop-up blocked. Please allow pop-ups and try again."
            );
            return;
        }

        try {
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();

            const printReport = () => {
                printWindow.focus();
                printWindow.print();
            };

            if (printWindow.document.readyState === "complete") {
                printReport();
            } else {
                printWindow.onload = printReport;
            }
        } catch (error) {
            printWindow.close();
            setActionError("Unable to open the PDF print dialog.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
            onClick={onClose}
        >
            <div
                className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1324] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-400">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                Consent Assessment Report
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Scan ID: {scanId}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleDownloadHtml}
                            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-indigo-500 hover:text-white"
                        >
                            <Download size={15} />
                            Download HTML
                        </button>

                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            <Printer size={15} />
                            Save as PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {actionError && (
                    <div className="border-b border-red-800 bg-red-950/30 px-5 py-3 text-sm text-red-300">
                        {actionError}
                    </div>
                )}

                {/* Report Preview */}
                <div className="min-h-0 flex-1 bg-white">
                    <iframe
                        title="Consent Scan Report"
                        srcDoc={html}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full bg-white border-0"
                        style={{
                            minHeight: "75vh",
                            display: "block",
                        }}
                        onLoad={() => console.log("Report iframe loaded")}
                    />
                </div>
            </div>
        </div>
    );
}
export default function ConsentScans() {
    const navigate = useNavigate();
    const location = useLocation();
    const newScanId = location.state?.newScanId;
    const [scans, setScans] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
    const [technicalResult, setTechnicalResult] = useState(null);
    const [checklistResult, setChecklistResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");
    const [detailsError, setDetailsError] = useState("");
    const [checklistError, setChecklistError] = useState("");

    const [reportLoadingId, setReportLoadingId] = useState(null);
    const [reportError, setReportError] = useState("");
    const [reportModal, setReportModal] = useState(null);

    const loadScans = useCallback(async (manual = false) => {
        if (manual) setRefreshing(true);
        setError("");
        try {
            const data = await getDpacompassAudits();
            const list = Array.isArray(data)
                ? data
                : data?.audits ?? data?.results ?? data?.data ?? [];
            if (!Array.isArray(list)) {
                throw new Error("Unexpected response format from the scan history API.");
            }
            setScans(list);
        } catch (err) {
            setError(err.message || "Unable to load scans.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    const handleViewReport = async (scan) => {
        const status = normalizeStatus(getStatus(scan));

        // Only completed scans can access reports.
        if (!["COMPLETED", "SUCCESS"].includes(status)) {
            return;
        }

        // The report endpoint specifically requires public_audit_id.
        const publicAuditId = scan?.public_audit_id;

        if (!publicAuditId) {
            setReportError(
                "Public Audit ID is unavailable for this scan."
            );
            return;
        }

        try {
            setReportLoadingId(publicAuditId);
            setReportError("");

            const html = await getSelfCheckConsentReport(publicAuditId);

            setReportModal({
                scanId: publicAuditId,
                html,
            });
        } catch (err) {
            console.error("Consent report error:", err);

            setReportError(
                err.message || "Unable to load the consent report."
            );
        } finally {
            setReportLoadingId(null);
        }
    };


    useEffect(() => {
        loadScans();
    }, [loadScans]);

    // Automatically open and start polling the scan just submitted by the user.
    useEffect(() => {
        if (!newScanId || selectedScan) return;
        const matchingScan = scans.find((scan) => String(getId(scan)) === String(newScanId));
        if (matchingScan) {
            setSelectedScan(matchingScan);
        } else if (!loading) {
            // The history endpoint may take a moment to include the newly-created record.
            setSelectedScan({ public_audit_id: String(newScanId) });
        }
    }, [newScanId, scans, loading, selectedScan]);

    // Keep scan history fresh while one or more scans are queued/running.
    useEffect(() => {
        const hasActiveScans = scans.some((scan) =>
            ["QUEUED", "PENDING", "RUNNING", "IN_PROGRESS"].includes(normalizeStatus(getStatus(scan)))
        );
        if (!hasActiveScans) return undefined;
        const timer = window.setInterval(() => loadScans(), 10000);
        return () => window.clearInterval(timer);
    }, [scans, loadScans]);

    // Poll complete-result every 2.5 seconds while the selected scan has unfinished steps.
    useEffect(() => {
        const publicAuditId = getId(selectedScan);
        if (!publicAuditId) return undefined;

        let cancelled = false;
        let requestInProgress = false;
        let checklistRequested = false;
        let timer;

        const poll = async (initial = false) => {
            if (cancelled || requestInProgress) return;
            requestInProgress = true;
            if (initial) setDetailsLoading(true);

            try {
                const data = await getCompleteConsentScanResult(publicAuditId);
                if (cancelled) return;

                setTechnicalResult(data);
                setDetailsError("");

                const steps = getStepsFromResponse(data);
                const allFinished = areAllStepsFinished(steps);

                if (allFinished && !checklistRequested) {
                    checklistRequested = true;
                    try {
                        const checklistData = await getConsentChecklistAssessment(publicAuditId);
                        if (!cancelled) {
                            setChecklistResult(checklistData);
                            setChecklistError("");
                        }
                    } catch (err) {
                        if (!cancelled) {
                            setChecklistError(err.message || "Unable to load checklist assessment.");
                        }
                    }
                    if (!cancelled) await loadScans();
                    if (timer) window.clearInterval(timer);
                }
            } catch (err) {
                if (!cancelled) setDetailsError(err.message || "Unable to retrieve scan progress.");
            } finally {
                requestInProgress = false;
                if (initial && !cancelled) setDetailsLoading(false);
            }
        };

        setTechnicalResult(null);
        setChecklistResult(null);
        setChecklistError("");
        setDetailsError("");

        poll(true);
        timer = window.setInterval(() => poll(), 2500);

        return () => {
            cancelled = true;
            if (timer) window.clearInterval(timer);
        };
    }, [selectedScan, loadScans]);

    const groups = useMemo(() => getScanGroups(scans), [scans]);
    const steps = useMemo(() => getStepsFromResponse(technicalResult), [technicalResult]);
    const allStepsFinished = useMemo(() => areAllStepsFinished(steps), [steps]);
    const checklistItems = useMemo(() => checklistItemsFromResponse(checklistResult), [checklistResult]);

    const handleViewScan = (scan) => {
        const status = normalizeStatus(getStatus(scan));

        if (["COMPLETED", "SUCCESS"].includes(status)) {
            const publicAuditId = getId(scan);

            if (!publicAuditId) {
                setError("Unable to identify this scan.");
                return;
            }

            navigate(
                `/user/self-check/scans/${encodeURIComponent(publicAuditId)}/results`
            );

            return;
        }

        // Queued, running and failed scans retain the existing same-page behaviour.
        setSelectedScan(scan);
    };

    const renderStepStatus = (step) => {
        const status = normalizeStatus(step.status);
        if (["COMPLETED", "SUCCESS"].includes(status)) {
            return <CircleCheck size={19} className="text-emerald-400" />;
        }
        if (["FAILED", "ERROR", "CANCELLED"].includes(status)) {
            return <CircleX size={19} className="text-red-400" />;
        }
        if (status === "RUNNING" || status === "IN_PROGRESS") {
            return <LoaderCircle size={19} className="animate-spin text-blue-400" />;
        }
        return <Clock3 size={19} className="text-slate-500" />;
    };

    return (
        <div className="min-h-screen bg-[#070d1d] text-white">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <button type="button" onClick={() => navigate("/devdashboard")} className="mb-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">My Consent Scans</h1>
                        <p className="mt-2 text-sm text-slate-400">Track scan history, live execution steps and both assessment results.</p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => loadScans(true)} disabled={refreshing} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0b1324] px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-60">
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button type="button" onClick={() => navigate("/user/self-check/consent-scanner")} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500">Start New Scan</button>
                    </div>
                </div>

                {error && <div role="alert" className="mb-6 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}

                <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {sections.map((section) => (
                        <div key={section.key} className="rounded-xl border border-slate-800 bg-[#0b1324] p-4">
                            <p className="text-sm text-slate-400">{section.title}</p>
                            <p className={`mt-2 text-2xl font-semibold ${section.color}`}>{groups[section.key].length}</p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0b1324] p-12 text-slate-400"><LoaderCircle size={20} className="animate-spin" /> Fetching your scans...</div>
                ) : (
                    <div className="space-y-8">
                        {sections.map((section) => (
                            <section key={section.key}>
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div><h2 className="text-lg font-semibold">{section.title}</h2><p className="mt-1 text-sm text-slate-500">{section.description}</p></div>
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${section.badge}`}>{groups[section.key].length}</span>
                                </div>
                                {groups[section.key].length === 0 ? (
                                    <div className="rounded-xl border border-slate-800 bg-[#0b1324] p-6 text-sm text-slate-500">No {section.title.toLowerCase()}.</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1324]">
                                        <table className="w-full min-w-190">
                                            <thead><tr className="border-b border-slate-800 text-left text-xs text-slate-400"><th className="px-5 py-4">Website</th><th className="px-5 py-4">Scan ID</th><th className="px-5 py-4">Created</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-center">Action</th></tr></thead>
                                            <tbody>
                                                {groups[section.key].map((scan, index) => (
                                                    <tr key={getId(scan) ?? index} className={`border-b border-slate-800 last:border-0 hover:bg-slate-900/50 ${getId(selectedScan) === getId(scan) ? "bg-indigo-500/5" : ""}`}>
                                                        <td className="max-w-xs break-all px-5 py-4 text-sm"><span className="inline-flex items-start gap-2"><Globe size={16} className="mt-0.5 shrink-0 text-indigo-400" />{getUrl(scan)}</span></td>
                                                        <td className="px-5 py-4 text-sm text-slate-400">{getId(scan) ?? "N/A"}</td>
                                                        <td className="px-5 py-4 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><Clock3 size={14} />{getDate(scan.created_at ?? scan.started_at)}</span></td>
                                                        <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${section.badge}`}>{section.key}</span></td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-center gap-3">

                                                                {/* Existing View Results / View Progress */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewScan(scan)}
                                                                    className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                                                                >
                                                                    <Eye size={16} />

                                                                    {["COMPLETED", "SUCCESS"].includes(
                                                                        normalizeStatus(getStatus(scan))
                                                                    )
                                                                        ? "View Results"
                                                                        : getId(selectedScan) === getId(scan)
                                                                            ? "Selected"
                                                                            : "View Progress"}
                                                                </button>

                                                                {/* View Report - Completed scans only */}
                                                                {["COMPLETED", "SUCCESS"].includes(
                                                                    normalizeStatus(getStatus(scan))
                                                                ) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleViewReport(scan)}
                                                                            disabled={
                                                                                reportLoadingId === scan.public_audit_id ||
                                                                                !scan.public_audit_id
                                                                            }
                                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            {reportLoadingId === scan.public_audit_id ? (
                                                                                <>
                                                                                    <LoaderCircle
                                                                                        size={15}
                                                                                        className="animate-spin"
                                                                                    />
                                                                                    Loading...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <FileText size={15} />
                                                                                    View Report
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                <section className="mt-10 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">
                    <div className="border-b border-slate-800 px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold"><ListChecks size={18} className="text-indigo-400" /> Live Scan Step Progress</h2>
                        {selectedScan && <p className="mt-2 break-all text-sm text-slate-400">{getUrl(selectedScan)} · {getId(selectedScan)}</p>}
                    </div>
                    {!selectedScan ? (
                        <p className="p-8 text-sm text-slate-500">Select a scan using View Progress / Results to monitor its steps and open its results.</p>
                    ) : detailsLoading ? (
                        <div className="flex items-center gap-2 p-8 text-sm text-slate-400"><LoaderCircle size={18} className="animate-spin" /> Loading live scan progress...</div>
                    ) : detailsError ? (
                        <p role="alert" className="p-5 text-sm text-red-300">{detailsError}</p>
                    ) : steps.length === 0 ? (
                        <p className="p-8 text-sm text-slate-500">The complete-result API has not returned step records yet. The screen will keep checking automatically.</p>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {steps.map((step, index) => {
                                const status = normalizeStatus(step.status);
                                return (
                                    <div key={step.step_id ?? index} className="flex items-start gap-3 p-5">
                                        <div className="mt-0.5">{renderStepStatus(step)}</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="wrap-break-word text-sm font-medium">{getStepTitle(step, index)}</p>
                                            <p className="mt-1 text-xs text-slate-400">{status.replaceAll("_", " ")}</p>
                                            {step.updated_at && <p className="mt-1 text-xs text-slate-500">Updated: {getDate(step.updated_at)}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {selectedScan && allStepsFinished && (
                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">
                            <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4"><FileSearch size={18} className="text-indigo-400" /><h2 className="font-semibold">Technical Assessment</h2></div>
                            <div className="p-5">
                                <p className="mb-3 text-sm text-emerald-300">All scan steps have reached a final state.</p>
                                <div className="max-h-130 space-y-3 overflow-auto">
                                    {steps.map((step, index) => (
                                        <div key={step.step_id ?? index} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                                            <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{getStepTitle(step, index)}</p><span className="text-xs text-slate-400">{normalizeStatus(step.status)}</span></div>
                                            {step.result && Object.keys(step.result).length > 0 && <pre className="mt-3 overflow-x-auto whitespace-pre-wrap wrap-break-word text-xs leading-5 text-slate-400">{JSON.stringify(step.result, null, 2)}</pre>}
                                        </div>
                                    ))}
                                </div>
                                <details className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                                    <summary className="cursor-pointer text-xs font-medium text-slate-300">View complete technical API response</summary>
                                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word text-xs leading-5 text-slate-400">{JSON.stringify(technicalResult, null, 2)}</pre>
                                </details>
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">
                            <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4"><ClipboardCheck size={18} className="text-indigo-400" /><h2 className="font-semibold">Checklist Assessment</h2></div>
                            {checklistError ? <p role="alert" className="p-5 text-sm text-red-300">{checklistError}</p> : !checklistResult ? (
                                <div className="flex items-center gap-2 p-6 text-sm text-slate-400"><LoaderCircle size={18} className="animate-spin" /> Loading checklist assessment...</div>
                            ) : (
                                <div className="p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-400">Total checklist items: {checklistResult.total_checklists ?? checklistItems.length}</p><span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">{checklistItems.length} results</span></div>
                                    <div className="max-h-130 space-y-3 overflow-auto">
                                        {checklistItems.map((item, index) => (
                                            <div key={`${index}-${item.question || "item"}`} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                                                <p className="text-sm leading-6 text-slate-200">{index + 1}. {item.question || item.title || "Checklist item"}</p>
                                                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.status === "PARTIALLY_COMPLIANT" ? "border-amber-700 bg-amber-950/30 text-amber-300" : item.status === "COMPLIANT" ? "border-emerald-700 bg-emerald-950/30 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-300"}`}>{String(item.status || "UNKNOWN").replaceAll("_", " ")}</span>
                                                {item.comment && <p className="mt-2 text-xs leading-5 text-slate-400">{item.comment}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
            {/* Report API Error */}
            {reportError && (
                <div
                    role="alert"
                    className="fixed bottom-5 right-5 z-[110] max-w-md rounded-xl border border-red-800 bg-[#1c1018] p-4 text-sm text-red-300 shadow-xl"
                >
                    <div className="flex items-start justify-between gap-4">
                        <p>{reportError}</p>

                        <button
                            onClick={() => setReportError("")}
                            className="text-red-300 hover:text-white"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>
            )}

            {/* Consent Report Modal */}
            {reportModal && (
                <ConsentReportModal
                    html={reportModal.html}
                    scanId={reportModal.scanId}
                    onClose={() => setReportModal(null)}
                />
            )}
        </div>
    );
}
