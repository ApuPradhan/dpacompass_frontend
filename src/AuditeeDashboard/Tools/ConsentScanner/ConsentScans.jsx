
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
    ShieldCheck,
    Plus,
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
    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleString();
};

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
    steps.length > 0 &&
    steps.every((step) =>
        TERMINAL_STEP_STATUSES.has(normalizeStatus(step.status))
    );

const getScanGroups = (scans) => {
    const groups = {
        QUEUED: [],
        RUNNING: [],
        COMPLETED: [],
        FAILED: [],
    };

    scans.forEach((scan) => {
        const status = normalizeStatus(getStatus(scan));

        if (["QUEUED", "PENDING"].includes(status)) {
            groups.QUEUED.push(scan);
        } else if (["RUNNING", "IN_PROGRESS"].includes(status)) {
            groups.RUNNING.push(scan);
        } else if (["COMPLETED", "SUCCESS"].includes(status)) {
            groups.COMPLETED.push(scan);
        } else if (["FAILED", "ERROR", "CANCELLED"].includes(status)) {
            groups.FAILED.push(scan);
        }
    });

    return groups;
};

const sections = [
    {
        key: "QUEUED",
        title: "Queued Scans",
        description: "Scans waiting to begin.",
        color: "text-amber-700",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
    },
    {
        key: "RUNNING",
        title: "Running Scans",
        description: "Scans currently being processed.",
        color: "text-blue-700",
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        icon: LoaderCircle,
    },
    {
        key: "COMPLETED",
        title: "Completed Scans",
        description: "Scans that have finished successfully.",
        color: "text-emerald-700",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CircleCheck,
    },
    {
        key: "FAILED",
        title: "Failed Scans",
        description: "Scans that failed or were cancelled.",
        color: "text-red-700",
        badge: "border-red-200 bg-red-50 text-red-700",
        icon: CircleX,
    },
];

const checklistItemsFromResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    return [];
};

const statusBadge = (status) => {
    const normalized = normalizeStatus(status);

    if (["COMPLETED", "SUCCESS", "COMPLIANT"].includes(normalized)) {
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (["RUNNING", "IN_PROGRESS"].includes(normalized)) {
        return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (["QUEUED", "PENDING", "PARTIALLY_COMPLIANT"].includes(normalized)) {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (["FAILED", "ERROR", "CANCELLED"].includes(normalized)) {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            onClick={onClose}
        >
            <div
                className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-[#075EB5]">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-[#14213D]">
                                Consent Assessment Report
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Scan ID: {scanId}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadHtml}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5]"
                        >
                            <Download size={15} />
                            Download HTML
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#075EB5] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#064D94]"
                        >
                            <Printer size={15} />
                            Save as PDF
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {actionError && (
                    <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                        {actionError}
                    </div>
                )}

                <div className="min-h-0 flex-1 bg-slate-100">
                    <iframe
                        title="Consent Scan Report"
                        srcDoc={html}
                        sandbox="allow-scripts allow-same-origin"
                        className="h-full w-full border-0 bg-white"
                        style={{
                            minHeight: "75vh",
                            display: "block",
                        }}
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
                throw new Error(
                    "Unexpected response format from the scan history API."
                );
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

        if (!["COMPLETED", "SUCCESS"].includes(status)) {
            return;
        }

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

    useEffect(() => {
        if (!newScanId || selectedScan) return;

        const matchingScan = scans.find(
            (scan) => String(getId(scan)) === String(newScanId)
        );

        if (matchingScan) {
            setSelectedScan(matchingScan);
        } else if (!loading) {
            setSelectedScan({
                public_audit_id: String(newScanId),
            });
        }
    }, [newScanId, scans, loading, selectedScan]);

    useEffect(() => {
        const hasActiveScans = scans.some((scan) =>
            ["QUEUED", "PENDING", "RUNNING", "IN_PROGRESS"].includes(
                normalizeStatus(getStatus(scan))
            )
        );

        if (!hasActiveScans) return undefined;

        const timer = window.setInterval(() => loadScans(), 10000);

        return () => window.clearInterval(timer);
    }, [scans, loadScans]);

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
                const data =
                    await getCompleteConsentScanResult(publicAuditId);

                if (cancelled) return;

                setTechnicalResult(data);
                setDetailsError("");

                const currentSteps = getStepsFromResponse(data);
                const allFinished = areAllStepsFinished(currentSteps);

                if (allFinished && !checklistRequested) {
                    checklistRequested = true;

                    try {
                        const checklistData =
                            await getConsentChecklistAssessment(publicAuditId);

                        if (!cancelled) {
                            setChecklistResult(checklistData);
                            setChecklistError("");
                        }
                    } catch (err) {
                        if (!cancelled) {
                            setChecklistError(
                                err.message ||
                                "Unable to load checklist assessment."
                            );
                        }
                    }

                    if (!cancelled) await loadScans();

                    if (timer) window.clearInterval(timer);
                }
            } catch (err) {
                if (!cancelled) {
                    setDetailsError(
                        err.message ||
                        "Unable to retrieve scan progress."
                    );
                }
            } finally {
                requestInProgress = false;

                if (initial && !cancelled) {
                    setDetailsLoading(false);
                }
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

    const groups = useMemo(
        () => getScanGroups(scans),
        [scans]
    );

    const steps = useMemo(
        () => getStepsFromResponse(technicalResult),
        [technicalResult]
    );

    const allStepsFinished = useMemo(
        () => areAllStepsFinished(steps),
        [steps]
    );

    const checklistItems = useMemo(
        () => checklistItemsFromResponse(checklistResult),
        [checklistResult]
    );

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

        setSelectedScan(scan);
    };

    const renderStepStatus = (step) => {
        const status = normalizeStatus(step.status);

        if (["COMPLETED", "SUCCESS"].includes(status)) {
            return (
                <CircleCheck
                    size={19}
                    className="text-emerald-600"
                />
            );
        }

        if (["FAILED", "ERROR", "CANCELLED"].includes(status)) {
            return (
                <CircleX
                    size={19}
                    className="text-red-600"
                />
            );
        }

        if (["RUNNING", "IN_PROGRESS"].includes(status)) {
            return (
                <LoaderCircle
                    size={19}
                    className="animate-spin text-blue-600"
                />
            );
        }

        return <Clock3 size={19} className="text-amber-600" />;
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] text-[#14213D]">
            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                {/* Back Navigation */}
                <button
                    type="button"
                    onClick={() => navigate("/devdashboard")}
                    className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#075EB5] transition hover:bg-blue-50"
                >
                    <ArrowLeft size={17} />
                    Back to Dashboard
                </button>

                {/* Page Header */}
                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 p-2 text-[#075EB5]">
                                <ShieldCheck size={21} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#075EB5]">
                                Consent Management
                            </span>
                        </div>

                        <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] sm:text-3xl">
                            My Consent Scans
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Track scan history, live execution steps and both assessment results.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => loadScans(true)}
                            disabled={refreshing}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={16}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/user/self-check/consent-scanner")
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#064D94]"
                        >
                            <Plus size={17} />
                            Start New Scan
                        </button>
                    </div>
                </div>

                {/* API Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <CircleX size={18} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {sections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <div
                                key={section.key}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                                        {section.title}
                                    </p>

                                    <div className="rounded-xl bg-slate-50 p-2">
                                        <Icon
                                            size={18}
                                            className={section.color}
                                        />
                                    </div>
                                </div>

                                <p
                                    className={`mt-3 text-2xl font-extrabold ${section.color}`}
                                >
                                    {groups[section.key].length}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    {section.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Scan History */}
                {loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500 shadow-sm">
                        <LoaderCircle
                            size={21}
                            className="animate-spin text-[#075EB5]"
                        />
                        Fetching your scans...
                    </div>
                ) : (
                    <div className="space-y-7">
                        {sections.map((section) => (
                            <section key={section.key}>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-bold text-[#14213D] sm:text-lg">
                                            {section.title}
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            {section.description}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${section.badge}`}
                                    >
                                        {groups[section.key].length}
                                    </span>
                                </div>

                                {groups[section.key].length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-slate-400">
                                        No {section.title.toLowerCase()}.
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[850px]">
                                                <thead>
                                                    <tr className="border-b border-slate-200 bg-[#EAF3FF] text-left text-xs font-bold uppercase tracking-wide text-[#173B70]">
                                                        <th className="px-5 py-4">Website</th>
                                                        <th className="px-5 py-4">Scan ID</th>
                                                        <th className="px-5 py-4">Created</th>
                                                        <th className="px-5 py-4">Status</th>
                                                        <th className="px-5 py-4 text-center">Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {groups[section.key].map((scan, index) => (
                                                        <tr
                                                            key={getId(scan) ?? index}
                                                            className={`border-b border-slate-100 last:border-0 transition hover:bg-blue-50/50 ${
                                                                getId(selectedScan) === getId(scan)
                                                                    ? "bg-blue-50"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <td className="max-w-xs break-all px-5 py-4 text-sm font-medium text-slate-700">
                                                                <span className="inline-flex items-start gap-2">
                                                                    <Globe
                                                                        size={16}
                                                                        className="mt-0.5 shrink-0 text-[#075EB5]"
                                                                    />
                                                                    {getUrl(scan)}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                                {getId(scan) ?? "N/A"}
                                                            </td>

                                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                                    <Clock3 size={14} />
                                                                    {getDate(scan.created_at ?? scan.started_at)}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${section.badge}`}
                                                                >
                                                                    {section.key}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleViewScan(scan)}
                                                                        className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#075EB5] transition hover:text-[#064D94]"
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
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                {/* Live Scan Progress */}
                <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="flex items-center gap-2 font-bold text-[#14213D]">
                            <ListChecks
                                size={19}
                                className="text-[#075EB5]"
                            />
                            Live Scan Step Progress
                        </h2>

                        {selectedScan && (
                            <span className="break-all text-xs text-slate-500">
                                {getUrl(selectedScan)} · {getId(selectedScan)}
                            </span>
                        )}
                    </div>

                    {!selectedScan ? (
                        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                            <div className="mb-3 rounded-2xl bg-blue-50 p-4 text-[#075EB5]">
                                <ListChecks size={28} />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                                No scan selected
                            </p>
                            <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                                Select a scan using View Progress / Results to monitor its steps and open its results.
                            </p>
                        </div>
                    ) : detailsLoading ? (
                        <div className="flex items-center gap-3 p-8 text-sm text-slate-500">
                            <LoaderCircle
                                size={19}
                                className="animate-spin text-[#075EB5]"
                            />
                            Loading live scan progress...
                        </div>
                    ) : detailsError ? (
                        <p
                            role="alert"
                            className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {detailsError}
                        </p>
                    ) : steps.length === 0 ? (
                        <div className="flex items-center gap-3 p-8 text-sm text-slate-500">
                            <LoaderCircle
                                size={18}
                                className="animate-spin text-[#075EB5]"
                            />
                            The complete-result API has not returned step records yet. The screen will keep checking automatically.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {steps.map((step, index) => {
                                const status = normalizeStatus(step.status);

                                return (
                                    <div
                                        key={step.step_id ?? index}
                                        className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50"
                                    >
                                        <div className="mt-0.5">
                                            {renderStepStatus(step)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="break-words text-sm font-semibold text-[#14213D]">
                                                {getStepTitle(step, index)}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge(status)}`}
                                                >
                                                    {status.replaceAll("_", " ")}
                                                </span>

                                                {step.updated_at && (
                                                    <span className="text-[11px] text-slate-400">
                                                        Updated: {getDate(step.updated_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Assessment Results */}
                {selectedScan && allStepsFinished && (
                    <div className="mt-7 grid gap-6 xl:grid-cols-2">

                        {/* Technical Assessment */}
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-200 bg-[#F8FAFD] px-5 py-4">
                                <FileSearch
                                    size={19}
                                    className="text-[#075EB5]"
                                />
                                <h2 className="font-bold text-[#14213D]">
                                    Technical Assessment
                                </h2>
                            </div>

                            <div className="p-5">
                                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    <CircleCheck size={16} />
                                    All scan steps have reached a final state.
                                </div>

                                <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.step_id ?? index}
                                            className="rounded-xl border border-slate-200 bg-white p-3.5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-semibold text-[#14213D]">
                                                    {getStepTitle(step, index)}
                                                </p>

                                                <span
                                                    className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${statusBadge(step.status)}`}
                                                >
                                                    {normalizeStatus(step.status)}
                                                </span>
                                            </div>

                                            {step.result &&
                                                Object.keys(step.result).length > 0 && (
                                                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                                        {JSON.stringify(step.result, null, 2)}
                                                    </pre>
                                                )}
                                        </div>
                                    ))}
                                </div>

                                <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <summary className="cursor-pointer text-xs font-semibold text-[#075EB5]">
                                        View complete technical API response
                                    </summary>

                                    <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                                        {JSON.stringify(technicalResult, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </section>

                        {/* Checklist Assessment */}
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-200 bg-[#F8FAFD] px-5 py-4">
                                <ClipboardCheck
                                    size={19}
                                    className="text-[#075EB5]"
                                />
                                <h2 className="font-bold text-[#14213D]">
                                    Checklist Assessment
                                </h2>
                            </div>

                            {checklistError ? (
                                <p
                                    role="alert"
                                    className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                >
                                    {checklistError}
                                </p>
                            ) : !checklistResult ? (
                                <div className="flex items-center gap-3 p-8 text-sm text-slate-500">
                                    <LoaderCircle
                                        size={19}
                                        className="animate-spin text-[#075EB5]"
                                    />
                                    Loading checklist assessment...
                                </div>
                            ) : (
                                <div className="p-5">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm text-slate-500">
                                            Total checklist items:{" "}
                                            {checklistResult.total_checklists ?? checklistItems.length}
                                        </p>

                                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#075EB5]">
                                            {checklistItems.length} results
                                        </span>
                                    </div>

                                    <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
                                        {checklistItems.map((item, index) => (
                                            <div
                                                key={`${index}-${item.question || "item"}`}
                                                className="rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-blue-200 hover:bg-blue-50/30"
                                            >
                                                <p className="text-sm font-semibold leading-6 text-[#14213D]">
                                                    {index + 1}.{" "}
                                                    {item.question || item.title || "Checklist item"}
                                                </p>

                                                <span
                                                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusBadge(item.status)}`}
                                                >
                                                    {String(item.status || "UNKNOWN").replaceAll("_", " ")}
                                                </span>

                                                {item.comment && (
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        {item.comment}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 border-t border-slate-200 py-5 text-center">
                    <p className="text-[10px] font-semibold tracking-wider text-slate-400">
                        DPACOMPASS · DATA PRIVACY · SECURITY · COMPLIANCE
                    </p>
                </div>
            </div>

            {/* Report API Error */}
            {reportError && (
                <div
                    role="alert"
                    className="fixed bottom-5 right-5 z-[110] max-w-md rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-xl"
                >
                    <div className="flex items-start justify-between gap-4">
                        <p>{reportError}</p>

                        <button
                            type="button"
                            onClick={() => setReportError("")}
                            className="cursor-pointer text-red-500 transition hover:text-red-800"
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
