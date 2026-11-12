import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import {
    ArrowLeft,
    RefreshCw,
    Search,
    FileText,
    FileCheck2,
    FileCode2,
    FileDown,
    Eye,
    Play,
    LoaderCircle,
    CheckCircle2,
    Clock3,
    AlertCircle,
    X,
    ShieldCheck,
    Database,
    Globe,
    Download,
    Sparkles,
} from "lucide-react";
// ============================================================
// API CONFIGURATION
// ============================================================
const COMPLETED_AUDITS_ENDPOINT = `/api/audits/completed-both/`;
const REPORT_GENERATION_BASE_URL = import.meta.env.VITE_REPORT_GENERATION_BASE_URL;
// ============================================================
// HELPERS
// ============================================================
const STATUS_LABELS = {
    completed: "Completed",
    running: "Running",
    pending: "Pending",
    failed: "Failed",
};
function normalizeStatus(status) {
    return String(status || "pending").toLowerCase();
}
function ScannerBadge({ status }) {
    const normalized = normalizeStatus(status);
    const styles = {
        completed:
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        running:
            "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
        pending:
            "border-amber-500/40 bg-amber-500/10 text-amber-400",
        failed:
            "border-red-500/40 bg-red-500/10 text-red-400",
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${styles[normalized] || styles.pending
                }`}
        >
            {normalized === "completed" ? (
                <CheckCircle2 size={12} />
            ) : normalized === "running" ? (
                <LoaderCircle size={12} className="animate-spin" />
            ) : normalized === "failed" ? (
                <AlertCircle size={12} />
            ) : (
                <Clock3 size={12} />
            )}
            {STATUS_LABELS[normalized] || normalized}
        </span>
    );
}
function StatCard({
    icon: Icon,
    label,
    value,
    description,
    accent,
}) {
    return (
        <div className="rounded-xl border border-slate-700/70 bg-[#111827]/80 p-5 transition-all duration-200 hover:border-indigo-500/40">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <h3 className="mt-2 text-3xl font-semibold text-white">
                        {value}
                    </h3>
                </div>
                <div className={`rounded-lg border p-2.5 ${accent}`}>
                    <Icon size={21} />
                </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{description}</p>
        </div>
    );
}
function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CompletedReports({ onBack }) {
    const token = localStorage.getItem("access");
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [generatingIds, setGeneratingIds] = useState([]);
    const [generatedReports, setGeneratedReports] = useState({});
    const [errors, setErrors] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);
    // ==========================================================
    // GET COMPLETED AUDITS
    //
    // GET /api/audits/completed-both/
    //
    // Expected response:
    // {
    //   "count": 2,
    //   "results": [...]
    // }
    // ==========================================================
    const fetchCompletedAudits = useCallback(async (showLoader = true) => {
        if (showLoader) {
            setRefreshing(true);
        }
        setErrors((previous) => {
            const next = { ...previous };
            delete next.refresh;
            return next;
        });
        try {
            const response = await fetchWithAuth(COMPLETED_AUDITS_ENDPOINT, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(
                    `Unable to fetch completed audits. HTTP ${response.status}`
                );
            }
            const data = await response.json();
            if (!Array.isArray(data.results)) {
                throw new Error(
                    "Invalid API response: expected a results array."
                );
            }
            const normalizedAudits = data.results.map((audit) => ({
                ...audit,
                // Use the actual backend field names.
                id: audit.audit_id,
                consent_management_status:
                    normalizeStatus(audit.consent_management_status),
                breach_management_status:
                    normalizeStatus(audit.breach_management_status),
                report_ready: audit.report_ready === true,
                report_exists: audit.report_exists === true,
                report_status: String(audit.report_status || "NOT_GENERATED").toUpperCase(),
                report_generated_at: audit.report_generated_at || null,
            }));
            setAudits(normalizedAudits);
        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                refresh:
                    error.message || "Unable to load completed audits.",
            }));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);
    useEffect(() => {
        fetchCompletedAudits();
    }, [fetchCompletedAudits]);
    const handleRefresh = () => {
        fetchCompletedAudits();
    };
    // ==========================================================
    // ELIGIBILITY
    //
    // Both scanners must be completed and report_ready must be
    // true before showing the Generate Report action.
    // ==========================================================
    const eligibleAudits = useMemo(
        () =>
            audits.filter(
                (audit) =>
                    audit.consent_management_status === "completed" &&
                    audit.breach_management_status === "completed" &&
                    audit.report_ready === true
            ),
        [audits]
    );
    const generatedCount = eligibleAudits.filter(
        (audit) => audit.report_exists === true
    ).length;
    const pendingCount = eligibleAudits.length - generatedCount;
    const filteredAudits = useMemo(() => {
        const query = search.trim().toLowerCase();
        return eligibleAudits.filter((audit) => {
            const matchesSearch =
                !query ||
                [
                    audit.application,
                    audit.public_audit_id,
                    String(audit.audit_id),
                    audit.audit_status,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(query)
                );
            const hasReport = audit.report_exists === true;
            const matchesFilter =
                filter === "all" ||
                (filter === "generated" && hasReport) ||
                (filter === "pending" && !hasReport);
            return matchesSearch && matchesFilter;
        });
    }, [eligibleAudits, search, filter, generatedReports]);
    // FETCH SAVED / GENERATE REPORT
    // GET /api/checklists/html_report/{public_audit_id}/
    const fetchReportHTML = async (audit) => {
        const auditId = audit.audit_id;
        const publicAuditId = audit.public_audit_id;

        if (!publicAuditId) {
            throw new Error("The public audit ID is missing; the report cannot be fetched.");
        }
        const endpoint = `/api/checklists/html_report/${encodeURIComponent(String(publicAuditId))}/`;

        const response = await fetchWithAuth(endpoint, {
            method: "GET",
            headers: {
                Accept: "text/html, application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Report request failed. HTTP ${response.status}`);
        }
        const responseText = await response.text();
        const contentType = response.headers.get("content-type") || "";
        let html = responseText;
        if (contentType.includes("application/json")) {
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("The report API returned invalid JSON.");
            }
            html = data.html || data.report_html || data.content || "";
            if (data.success === false) {
                throw new Error(data.message || "The backend could not retrieve the report.");
            }
        }
        if (typeof html !== "string" || !html.trim()) {
            throw new Error("The server returned an empty HTML report.");
        }
        if (!contentType.includes("application/json") && !/<(?:!doctype\s+html|html|body|head)\b/i.test(html)) {
            throw new Error("The API response does not appear to contain an HTML document.");
        }
        const report = {
            audit_id: auditId,
            public_audit_id: publicAuditId,
            application: audit.application,
            html,
            generated_at: audit.report_generated_at || new Date().toISOString(),
        };
        setGeneratedReports((previous) => ({ ...previous, [auditId]: report }));
        return report;
    };

    // Generate action is shown only when the backend says report_exists=false.
    const handleGenerateReport = async (audit) => {
        const auditId = audit.audit_id;
        if (generatingIds.includes(auditId)) return;
        if (
            audit.consent_management_status !== "completed" ||
            audit.breach_management_status !== "completed" ||
            !audit.report_ready
        ) {
            setErrors((previous) => ({ ...previous, [auditId]: "This audit is not eligible for report generation." }));
            return;
        }
        setErrors((previous) => {
            const next = { ...previous };
            delete next[auditId];
            return next;
        });
        setGeneratingIds((previous) => [...previous, auditId]);
        try {
            await fetchReportHTML(audit);
            setAudits((previous) => previous.map((item) => item.audit_id === auditId
                ? { ...item, report_exists: true, report_status: "REPORT_GENERATED", report_generated_at: item.report_generated_at || new Date().toISOString() }
                : item));
        } catch (error) {
            setErrors((previous) => ({ ...previous, [auditId]: error.message || "Unable to generate or fetch the HTML report." }));
        } finally {
            setGeneratingIds((previous) => previous.filter((id) => id !== auditId));
        }
    };

    // Existing reports are fetched from the backend on demand, then viewed/downloaded.
    const loadReportForAction = async (audit, action) => {
        const auditId = audit.audit_id;
        setErrors((previous) => {
            const next = { ...previous };
            delete next[auditId];
            return next;
        });
        setGeneratingIds((previous) => previous.includes(auditId) ? previous : [...previous, auditId]);
        try {
            const report = generatedReports[auditId] || await fetchReportHTML(audit);
            if (action === "view") {
                setSelectedReport({ ...audit, report_html: report.html });
            } else if (action === "html") {
                downloadHTMLFile(audit, report);
            } else if (action === "pdf") {
                printPDFFile(audit, report);
            }
        } catch (error) {
            setErrors((previous) => ({ ...previous, [auditId]: error.message || "Unable to load the saved report." }));
        } finally {
            setGeneratingIds((previous) => previous.filter((id) => id !== auditId));
        }
    };

    const downloadHTMLFile = (audit, report) => {
        if (!report?.html) return;
        const blob = new Blob([report.html], { type: "text/html;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${audit.public_audit_id || audit.audit_id}_report.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };

    const printPDFFile = (audit, report) => {
        if (!report?.html) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            setErrors((previous) => ({ ...previous, [audit.audit_id]: "The report window was blocked. Allow pop-ups and try again." }));
            return;
        }
        printWindow.document.open();
        printWindow.document.write(report.html);
        printWindow.document.close();
        printWindow.document.title = `${audit.public_audit_id || audit.audit_id}_report`;
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const handleDownloadHTML = (audit) => loadReportForAction(audit, "html");
    const handleDownloadPDF = (audit) => loadReportForAction(audit, "pdf");
    const openReport = (audit) => loadReportForAction(audit, "view");

    // ==========================================================
    // RENDER
    // ==========================================================
    return (
        <div className="min-h-screen bg-[#080e1d] px-4 py-5 text-slate-200 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-450 space-y-7">
                {/* PAGE HEADER */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                        <button
                            onClick={onBack || (() => window.history.back())}
                            className="mb-5 inline-flex items-center gap-2 text-sm text-indigo-400 transition hover:text-indigo-300"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
                                <FileCheck2 size={27} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                    Completed Reports
                                </h1>
                                <p className="mt-1 text-sm text-slate-400">
                                    Generate, review and download consolidated audit reports.
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    Audits appear when both scanners are completed and the
                                    backend marks them report-ready.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm text-slate-200 transition hover:border-indigo-500/60 hover:bg-slate-800 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </header>
                {/* API ERROR */}
                {errors.refresh && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium">Unable to load audits</p>
                            <p className="mt-1">{errors.refresh}</p>
                            <button
                                onClick={handleRefresh}
                                className="mt-2 text-xs font-semibold text-red-200 underline underline-offset-4"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}
                {/* INFORMATION BANNER */}
                <section className="rounded-xl border border-indigo-500/20 bg-linear-to-r from-indigo-500/9 to-transparent p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                            <Sparkles size={19} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Consolidated report generation
                            </h2>
                            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                                Each report combines the Data Breach Management scanner
                                and Consent Management scanner results for the same audit.
                                The Generate Report action will use the configured backend
                                endpoint to retrieve the actual HTML report.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#080e1d]/70 px-2.5 py-1.5 text-xs text-slate-300">
                                    <Database size={13} className="text-cyan-400" />
                                    Breach Management
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#080e1d]/70 px-2.5 py-1.5 text-xs text-slate-300">
                                    <Globe size={13} className="text-indigo-400" />
                                    Consent Management
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
                {/* REPORT TABLE */}
                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0c1425]">
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-700/80 p-4 sm:flex-row sm:items-center sm:p-5">
                        <div>
                            <h2 className="font-semibold text-white">List of Audits : </h2>
                        </div>
                        <div className="flex w-full flex-row items-center gap-3">
                            {/* Search - 80% width */}
                            <div className="relative min-w-0 flex-4">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search application, ID..."
                                    className="w-full rounded-lg border border-slate-700 bg-[#080e1d] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500"
                                />
                            </div>
                            {/* Filter - 20% width */}
                            <div className="min-w-0 flex-1">
                                <select
                                    value={filter}
                                    onChange={(event) => setFilter(event.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-[#080e1d] px-3 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
                                >
                                    <option value="all">All Reports</option>
                                    <option value="generated">Generated</option>
                                    <option value="pending">Not Generated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-250 text-left">
                            <thead className="border-b border-slate-700 bg-[#0a1120]">
                                <tr className="text-xs font-medium text-slate-400">
                                    <th className="px-5 py-4">Application</th>
                                    <th className="px-5 py-4">Audit ID</th>
                                    <th className="px-5 py-4">Scanner Status</th>
                                    <th className="px-5 py-4">Report Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/70">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <LoaderCircle
                                                size={28}
                                                className="mx-auto animate-spin text-indigo-400"
                                            />
                                            <p className="mt-3 text-sm text-slate-300">
                                                Fetching completed audits...
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Connecting to the DPACOMPASS backend
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAudits.map((audit) => {
                                        const auditId = audit.audit_id;
                                        const isGenerating = generatingIds.includes(auditId);
                                        const report = generatedReports[auditId];
                                        return (
                                            <tr
                                                key={auditId}
                                                className="transition-colors hover:bg-indigo-500/[0.035]"
                                            >
                                                <td className="px-5 py-5">
                                                    <div className="font-medium text-white">
                                                        {audit.application || "Unnamed application"}
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Internal audit ID: {auditId}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-5">
                                                    <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 font-mono text-xs text-slate-300">
                                                        {audit.public_audit_id || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-5">
                                                    <div className="flex flex-col items-start gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Database size={13} className="text-cyan-400" />
                                                            <span className="text-xs text-slate-300">
                                                                Breach Management
                                                            </span>
                                                            <ScannerBadge
                                                                status={audit.breach_management_status}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Globe size={13} className="text-indigo-400" />
                                                            <span className="text-xs text-slate-300">
                                                                Consent Management
                                                            </span>
                                                            <ScannerBadge
                                                                status={audit.consent_management_status}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-5">
                                                    {isGenerating ? (
                                                        <div className="min-w-45">
                                                            <div className="flex items-center gap-2 text-xs text-indigo-300">
                                                                <LoaderCircle
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                                Generating report...
                                                            </div>
                                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                                                <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500" />
                                                            </div>
                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                Waiting for backend response
                                                            </p>
                                                        </div>
                                                    ) : audit.report_exists ? (
                                                        <div className="flex flex-col items-start gap-2">
                                                            <ScannerBadge status="completed" />
                                                            <span className="text-[11px] text-emerald-400/80">
                                                                {audit.report_generated_at
                                                                    ? `Generated ${formatDate(audit.report_generated_at)}`
                                                                    : "Report available"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <ScannerBadge status="pending" />
                                                    )}
                                                    {errors[auditId] && (
                                                        <p className="mt-2 max-w-65 text-xs leading-5 text-red-400">
                                                            {errors[auditId]}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {audit.report_exists ? (
                                                            <>
                                                                <button
                                                                    onClick={() => openReport(audit)}
                                                                    title="View report"
                                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/20"
                                                                >
                                                                    <Eye size={14} />
                                                                    View
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownloadHTML(audit)}
                                                                    title="Download HTML"
                                                                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
                                                                >
                                                                    <FileCode2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownloadPDF(audit)}
                                                                    title="Print or save as PDF"
                                                                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                                                                >
                                                                    <FileDown size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleGenerateReport(audit)}
                                                                disabled={isGenerating || !audit.report_ready}
                                                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {isGenerating ? (
                                                                    <LoaderCircle
                                                                        size={14}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Play size={14} />
                                                                )}
                                                                {isGenerating
                                                                    ? "Generating..."
                                                                    : "Generate Report"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                {!loading && filteredAudits.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-slate-500">
                                                    <FileText size={28} />
                                                </div>
                                                <h3 className="mt-4 font-medium text-white">
                                                    {errors.refresh
                                                        ? "Unable to load reports"
                                                        : "No eligible reports found"}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {errors.refresh
                                                        ? "Check your backend connection and try refreshing."
                                                        : "No audits currently match both scanner completion and report readiness."}
                                                </p>
                                                <button
                                                    onClick={handleRefresh}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                                                >
                                                    <RefreshCw size={13} />
                                                    Refresh audits
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col justify-between gap-2 border-t border-slate-700/70 bg-[#0a1120]/70 px-5 py-3 text-xs text-slate-500 sm:flex-row">
                        <span>
                            Showing {loading ? "—" : filteredAudits.length} of{" "}
                            {loading ? "—" : eligibleAudits.length} eligible audits
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-400" />
                            Both scanners must be completed
                        </span>
                    </div>
                </section>
                {/* REPORT PREVIEW MODAL */}
                {selectedReport && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setSelectedReport(null);
                            }
                        }}
                    >
                        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0c1425] shadow-2xl shadow-black/50">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-400">
                                        <FileCheck2 size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-white">
                                            Report Preview
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {selectedReport.application} ·{" "}
                                            {selectedReport.public_audit_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownloadHTML(selectedReport)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
                                    >
                                        <Download size={14} />
                                        HTML
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPDF(selectedReport)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-800"
                                    >
                                        <FileDown size={14} />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => setSelectedReport(null)}
                                        aria-label="Close report preview"
                                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 bg-slate-200 p-2 sm:p-4">
                                <iframe
                                    title={`Report preview - ${selectedReport.public_audit_id}`}
                                    srcDoc={selectedReport.report_html}
                                    sandbox=""
                                    className="h-[72vh] w-full rounded-lg border border-slate-300 bg-white"
                                />
                            </div>
                            <div className="flex items-center gap-2 border-t border-slate-700 px-5 py-3 text-xs text-slate-400">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                HTML received from the report-generation API
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
