import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import {
    ArrowLeft,
    RefreshCw,
    Search,
    FileText,
    FileCheck2,
    FileDown,
    Eye,
    LoaderCircle,
    CheckCircle2,
    Clock3,
    AlertCircle,
    X,
    ShieldCheck,
    Download,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// ============================================================

const COMPLETED_AUDITS_ENDPOINT =
    "/api/audits/report-generated-audits/";

const PUBLISHED_REPORTS_ENDPOINT =
    "/api/checklists/audits/published-reports/";

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

function ReportStatusBadge({ status }) {
    const published = String(status || "")
        .toLowerCase()
        .includes("publish");

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                published
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
            }`}
        >
            <CheckCircle2 size={12} />
            {published ? "Published" : "Report Generated"}
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
                    <p className="text-sm text-slate-400">
                        {label}
                    </p>

                    <h3 className="mt-2 text-3xl font-semibold text-white">
                        {value}
                    </h3>
                </div>

                <div className={`rounded-lg border p-2.5 ${accent}`}>
                    <Icon size={21} />
                </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
                {description}
            </p>
        </div>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CompletedReports({ onBack }) {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [generatingIds, setGeneratingIds] = useState([]);
    const [generatedReports, setGeneratedReports] = useState({});

    const [errors, setErrors] = useState({});
    const [selectedReport, setSelectedReport] = useState(null);

    // ========================================================
    // FETCH GENERATED + PUBLISHED REPORTS
    //
    // Generated:
    // GET /api/audits/report-generated-audits/
    //
    // Published:
    // GET /api/checklists/audits/published-reports/
    //
    // Merge both endpoints by public_audit_id.
    // ========================================================

    const fetchCompletedAudits = useCallback(async () => {
        setRefreshing(true);

        setErrors((previous) => {
            const next = { ...previous };
            delete next.refresh;
            return next;
        });

        try {
            const [generatedResponse, publishedResponse] =
                await Promise.all([
                    fetchWithAuth(COMPLETED_AUDITS_ENDPOINT, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }),
                    fetchWithAuth(PUBLISHED_REPORTS_ENDPOINT, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }),
                ]);

            if (!generatedResponse.ok) {
                throw new Error(
                    `Unable to fetch generated reports. HTTP ${generatedResponse.status}`
                );
            }

            if (!publishedResponse.ok) {
                throw new Error(
                    `Unable to fetch published reports. HTTP ${publishedResponse.status}`
                );
            }

            const [generatedData, publishedData] = await Promise.all([
                generatedResponse.json(),
                publishedResponse.json(),
            ]);

            const generatedRows = Array.isArray(generatedData.results)
                ? generatedData.results
                : Array.isArray(generatedData.data)
                    ? generatedData.data
                    : null;

            const publishedRows = Array.isArray(publishedData.data)
                ? publishedData.data
                : Array.isArray(publishedData.results)
                    ? publishedData.results
                    : null;

            if (!generatedRows) {
                throw new Error(
                    "Invalid generated-reports response: expected results or data array."
                );
            }

            if (!publishedRows) {
                throw new Error(
                    "Invalid published-reports response: expected data or results array."
                );
            }

            const reportMap = new Map();

            // Normalize generated reports first.
            generatedRows.forEach((audit) => {
                const publicAuditId = audit.public_audit_id;

                if (!publicAuditId) return;

                const reportStatus = String(
                    audit.report?.status ||
                    audit.report_status ||
                    ""
                ).toUpperCase();

                const auditStatus = String(
                    audit.audit_status || ""
                ).toLowerCase();

                const isPublished =
                    reportStatus === "PUBLISHED" ||
                    auditStatus === "published" ||
                    audit.published === true ||
                    audit.published_report === true ||
                    Boolean(
                        audit.report?.published_at ||
                        audit.report?.published_on ||
                        audit.published_at ||
                        audit.published_on
                    );

                reportMap.set(String(publicAuditId), {
                    ...audit,
                    id: audit.audit_id || publicAuditId,
                    audit_id: audit.audit_id || publicAuditId,
                    public_audit_id: String(publicAuditId),

                    application_name:
                        audit.application?.name ||
                        audit.application_name ||
                        "Unnamed application",

                    application_type:
                        audit.application?.type ||
                        audit.application_type ||
                        "—",

                    application_url:
                        audit.application?.url ||
                        audit.application_url ||
                        "—",

                    report_generated: true,
                    published_report: isPublished,
                    report_exists: true,

                    report_status: isPublished
                        ? "PUBLISHED"
                        : "REPORT_GENERATED",

                    report_generated_at:
                        audit.report?.generated_at ||
                        audit.report_generated_at ||
                        audit.generated_at ||
                        null,

                    report_published_at:
                        audit.report?.published_at ||
                        audit.report?.published_on ||
                        audit.published_at ||
                        audit.published_on ||
                        null,
                });
            });

            // Merge published reports. This endpoint is authoritative
            // for publication status and also contributes published-only rows.
            publishedRows.forEach((published) => {
                const publicAuditId = published.public_audit_id;

                if (!publicAuditId) return;

                const key = String(publicAuditId);
                const existing = reportMap.get(key) || {};

                const normalizedPublished = {
                    ...existing,
                    ...published,

                    id:
                        existing.audit_id ||
                        published.audit_id ||
                        published.application_id ||
                        key,

                    audit_id:
                        existing.audit_id ||
                        published.audit_id ||
                        published.application_id ||
                        key,

                    public_audit_id: key,

                    application_name:
                        published.application_name ||
                        published.application?.name ||
                        existing.application_name ||
                        "Unnamed application",

                    application_type:
                        published.application_type ||
                        published.application?.type ||
                        existing.application_type ||
                        "—",

                    application_url:
                        published.application_url ||
                        published.application?.url ||
                        existing.application_url ||
                        "—",

                    report_generated: true,
                    published_report: true,
                    report_exists: true,
                    report_status: "PUBLISHED",

                    report_generated_at:
                        published.generated_at ||
                        published.report_generated_at ||
                        existing.report_generated_at ||
                        null,

                    report_published_at:
                        published.published_at ||
                        published.published_on ||
                        published.report_published_at ||
                        existing.report_published_at ||
                        null,

                    auditor_name:
                        published.auditor_name ||
                        existing.auditor_name ||
                        published.auditor?.name ||
                        "—",
                };

                reportMap.set(key, normalizedPublished);
            });

            const mergedAudits = Array.from(reportMap.values()).sort(
                (a, b) => {
                    const dateA = new Date(
                        a.report_published_at ||
                        a.report_generated_at ||
                        0
                    ).getTime();

                    const dateB = new Date(
                        b.report_published_at ||
                        b.report_generated_at ||
                        0
                    ).getTime();

                    return dateB - dateA;
                }
            );

            setAudits(mergedAudits);

        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                refresh:
                    error.message ||
                    "Unable to load generated and published reports.",
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

    // ========================================================
    // STATISTICS AND FILTERING
    // ========================================================

    const eligibleAudits = useMemo(
        () => audits,
        [audits]
    );

    const generatedCount = eligibleAudits.length;

    const publishedCount = eligibleAudits.filter(
        (audit) => audit.published_report
    ).length;

    const filteredAudits = useMemo(() => {
        const query = search.trim().toLowerCase();

        return eligibleAudits.filter((audit) => {
            const matchesSearch =
                !query ||
                [
                    audit.application_name,
                    audit.application_type,
                    audit.application_url,
                    audit.public_audit_id,
                    audit.audit_status,
                    String(audit.audit_id),
                ].some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(query)
                );

            const matchesFilter =
                filter === "all" ||
                (filter === "generated" &&
                    !audit.published_report) ||
                (filter === "published" &&
                    audit.published_report);

            return matchesSearch && matchesFilter;
        });
    }, [eligibleAudits, search, filter]);

    // ========================================================
    // FETCH SAVED HTML REPORT
    //
    // GET /api/checklists/html_report/{public_audit_id}/
    // ========================================================

    const fetchReportHTML = async (audit) => {
        const auditId = audit.audit_id || audit.public_audit_id;
        const publicAuditId = audit.public_audit_id;

        if (!publicAuditId) {
            throw new Error(
                "The public audit ID is missing; the report cannot be fetched."
            );
        }

        const endpoint =
            `/api/checklists/html_report/${encodeURIComponent(
                String(publicAuditId)
            )}/`;

        const response = await fetchWithAuth(endpoint, {
            method: "GET",
            headers: {
                Accept: "text/html, application/json",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Report request failed. HTTP ${response.status}`
            );
        }

        const responseText = await response.text();

        const contentType =
            response.headers.get("content-type") || "";

        let html = responseText;

        if (contentType.includes("application/json")) {
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "The report API returned invalid JSON."
                );
            }

            html =
                data.html ||
                data.report_html ||
                data.content ||
                "";

            if (data.success === false) {
                throw new Error(
                    data.message ||
                    "The backend could not retrieve the report."
                );
            }
        }

        if (typeof html !== "string" || !html.trim()) {
            throw new Error(
                "The server returned an empty HTML report."
            );
        }

        if (
            !contentType.includes("application/json") &&
            !/<(?:!doctype\s+html|html|body|head)\b/i.test(html)
        ) {
            throw new Error(
                "The API response does not appear to contain an HTML document."
            );
        }

        const report = {
            audit_id: auditId,
            public_audit_id: publicAuditId,
            application: audit.application_name,
            application_name: audit.application_name,
            html,
            generated_at: audit.report_generated_at,
        };

        setGeneratedReports((previous) => ({
            ...previous,
            [auditId]: report,
        }));

        return report;
    };

    // ========================================================
    // LOAD REPORT FOR VIEW / DOWNLOAD
    // ========================================================

    const loadReportForAction = async (audit, action) => {
        const auditId = audit.audit_id || audit.public_audit_id;

        setErrors((previous) => {
            const next = { ...previous };
            delete next[auditId];
            return next;
        });

        setGeneratingIds((previous) =>
            previous.includes(auditId)
                ? previous
                : [...previous, auditId]
        );

        try {
            const report =
                generatedReports[auditId] ||
                await fetchReportHTML(audit);

            if (action === "view") {
                setSelectedReport({
                    ...audit,
                    report_html: report.html,
                });
            } else if (action === "html") {
                downloadHTMLFile(audit, report);
            } else if (action === "pdf") {
                printPDFFile(audit, report);
            }

        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                [auditId]:
                    error.message ||
                    "Unable to load the saved report.",
            }));

        } finally {
            setGeneratingIds((previous) =>
                previous.filter((id) => id !== auditId)
            );
        }
    };

    // ========================================================
    // DOWNLOAD HTML
    // ========================================================

    const downloadHTMLFile = (audit, report) => {
        if (!report?.html) return;

        const blob = new Blob(
            [report.html],
            { type: "text/html;charset=utf-8" }
        );

        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = objectUrl;

        link.download =
            `${audit.public_audit_id || audit.audit_id}_report.html`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.setTimeout(
            () => URL.revokeObjectURL(objectUrl),
            1000
        );
    };

    // ========================================================
    // PRINT / SAVE AS PDF
    // ========================================================

    const printPDFFile = (audit, report) => {
        if (!report?.html) return;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            setErrors((previous) => ({
                ...previous,
                [audit.audit_id]:
                    "The report window was blocked. Allow pop-ups and try again.",
            }));

            return;
        }

        printWindow.document.open();
        printWindow.document.write(report.html);
        printWindow.document.close();

        printWindow.document.title =
            `${audit.public_audit_id || audit.audit_id}_report`;

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const handleDownloadHTML = (audit) =>
        loadReportForAction(audit, "html");

    const handleDownloadPDF = (audit) =>
        loadReportForAction(audit, "pdf");

    const openReport = (audit) =>
        loadReportForAction(audit, "view");

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-[#080e1d] px-4 py-5 text-slate-200 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-[1800px] space-y-7">

                {/* PAGE HEADER */}

                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>
                        <button
                            onClick={
                                onBack ||
                                (() => window.history.back())
                            }
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
                                    Completed Audits
                                </h1>

                                <p className="mt-1 text-sm text-slate-400">
                                    View auditor-generated and administrator-published audit reports.
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    Generation and publication timestamps are shown separately.
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
                            className={
                                refreshing ? "animate-spin" : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </header>

                {/* API ERROR */}

                {errors.refresh && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="flex-1">
                            <p className="font-medium">
                                Unable to load audits
                            </p>

                            <p className="mt-1">
                                {errors.refresh}
                            </p>

                            <button
                                onClick={handleRefresh}
                                className="mt-2 text-xs font-semibold text-red-200 underline underline-offset-4"
                            >
                                Try again
                            </button>
                        </div>

                    </div>
                )}

                {/* STATISTICS */}

                <div className="grid gap-4 sm:grid-cols-2">

                    <StatCard
                        icon={FileCheck2}
                        label="Generated by Auditor"
                        value={loading ? "—" : generatedCount}
                        description="Reports finalized by auditors"
                        accent="border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                    />

                    <StatCard
                        icon={ShieldCheck}
                        label="Published by Admin"
                        value={loading ? "—" : publishedCount}
                        description="Reports verified and published by administrators"
                        accent="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    />

                </div>

                {/* COMPLETED AUDITS TABLE */}

                <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0c1425]">

                    <div className="flex flex-col justify-between gap-4 border-b border-slate-700/80 p-4 sm:flex-row sm:items-center sm:p-5">

                        <div>
                            <h2 className="font-semibold text-white">
                                Completed Audits
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Auditor-generated reports and reports published by the administrator.
                            </p>
                        </div>

                        <div className="flex w-full items-center gap-3 sm:max-w-xl">

                            <div className="relative min-w-0 flex-1">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search audit ID, application, URL..."
                                    className="w-full rounded-lg border border-slate-700 bg-[#080e1d] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                />
                            </div>

                            <select
                                value={filter}
                                onChange={(event) =>
                                    setFilter(event.target.value)
                                }
                                className="rounded-lg border border-slate-700 bg-[#080e1d] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                            >
                                <option value="all">All</option>
                                <option value="generated">Generated</option>
                                <option value="published">Published</option>
                            </select>

                        </div>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px] text-left">

                            <thead className="border-b border-slate-700 bg-[#0a1120]">

                                <tr className="text-xs font-medium text-slate-400">
                                    <th className="px-5 py-4">Audit ID</th>
                                    <th className="px-5 py-4">Application</th>
                                    <th className="px-5 py-4">Application Type</th>
                                    <th className="px-5 py-4">URL</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Generation Time</th>
                                    <th className="px-5 py-4">Published Time</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-700/70">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <LoaderCircle
                                                size={28}
                                                className="mx-auto animate-spin text-indigo-400"
                                            />

                                            <p className="mt-3 text-sm text-slate-300">
                                                Fetching completed audits...
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAudits.map((audit) => {
                                        const auditId =
                                            audit.audit_id || audit.public_audit_id;

                                        const isGenerating =
                                            generatingIds.includes(auditId);

                                        return (
                                            <tr
                                                key={auditId}
                                                className="transition-colors hover:bg-indigo-500/[0.035]"
                                            >

                                                {/* AUDIT ID */}

                                                <td className="px-5 py-5">
                                                    <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 font-mono text-xs text-slate-300">
                                                        {audit.public_audit_id || "—"}
                                                    </span>
                                                </td>

                                                {/* APPLICATION */}

                                                <td className="px-5 py-5 text-sm font-medium text-white">
                                                    {audit.application_name}
                                                </td>

                                                {/* APPLICATION TYPE */}

                                                <td className="px-5 py-5 text-sm text-slate-300">
                                                    {audit.application_type}
                                                </td>

                                                {/* URL */}

                                                <td className="max-w-[260px] px-5 py-5 text-sm">
                                                    {audit.application_url !== "—" ? (
                                                        <a
                                                            href={audit.application_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title={audit.application_url}
                                                            className="block truncate text-indigo-300 hover:text-indigo-200 hover:underline"
                                                        >
                                                            {audit.application_url}
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-5">
                                                    <ReportStatusBadge
                                                        status={audit.report_status}
                                                    />
                                                </td>

                                                {/* GENERATION TIME */}

                                                <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                                                    {formatDateTime(
                                                        audit.report_generated_at
                                                    )}
                                                </td>

                                                {/* PUBLISHED TIME */}

                                                <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                                                    {audit.published_report
                                                        ? formatDateTime(
                                                            audit.report_published_at
                                                        )
                                                        : "—"}
                                                </td>

                                                {/* VIEW ACTION */}

                                                <td className="px-5 py-5 text-right">

                                                    <button
                                                        onClick={() =>
                                                            openReport(audit)
                                                        }
                                                        disabled={isGenerating}
                                                        title="View HTML report and download PDF"
                                                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-400 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-950/40 transition-all hover:border-indigo-300 hover:bg-indigo-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0c1425] disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-700 disabled:text-slate-300 disabled:shadow-none"
                                                    >
                                                        {isGenerating ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Eye size={14} />
                                                        )}

                                                        {isGenerating
                                                            ? "Loading..."
                                                            : "View"}
                                                    </button>

                                                    {errors[auditId] && (
                                                        <p className="mt-2 max-w-52 text-left text-xs text-red-400">
                                                            {errors[auditId]}
                                                        </p>
                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    })
                                )}

                                {/* EMPTY STATE */}

                                {!loading &&
                                    filteredAudits.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-5 py-16 text-center"
                                            >
                                                <FileText
                                                    size={28}
                                                    className="mx-auto text-slate-500"
                                                />

                                                <h3 className="mt-4 font-medium text-white">
                                                    {errors.refresh
                                                        ? "Unable to load audits"
                                                        : "No completed audits found"}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {errors.refresh ||
                                                        "No generated or published reports match your search."}
                                                </p>

                                                <button
                                                    onClick={handleRefresh}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                                                >
                                                    <RefreshCw size={13} />
                                                    Refresh audits
                                                </button>
                                            </td>
                                        </tr>
                                    )}

                            </tbody>
                        </table>

                    </div>

                    <div className="flex flex-col justify-between gap-2 border-t border-slate-700/70 bg-[#0a1120]/70 px-5 py-3 text-xs text-slate-500 sm:flex-row">
                        <span>
                            Showing {loading ? "—" : filteredAudits.length} of{" "}
                            {loading ? "—" : eligibleAudits.length} audits
                        </span>

                        <span>
                            {generatedCount} generated · {publishedCount} published
                        </span>
                    </div>

                </section>

                {/* =================================================
                    REPORT PREVIEW MODAL
                ================================================= */}

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

                            {/* MODAL HEADER */}

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
                                            {selectedReport.application_name ||
                                                selectedReport.application?.name ||
                                                "Unnamed application"}
                                            {" · "}
                                            {selectedReport.public_audit_id}
                                        </p>
                                    </div>

                                </div>

                                {/* DOWNLOAD / CLOSE BUTTONS */}

                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={() =>
                                            handleDownloadHTML(selectedReport)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:border-cyan-400 hover:bg-slate-700"
                                    >
                                        <Download size={14} />
                                        HTML
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDownloadPDF(selectedReport)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                                    >
                                        <FileDown size={14} />
                                        PDF
                                    </button>

                                    <button
                                        onClick={() =>
                                            setSelectedReport(null)
                                        }
                                        aria-label="Close report preview"
                                        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                    >
                                        <X size={17} />
                                    </button>

                                </div>

                            </div>

                            {/* HTML REPORT */}

                            <div className="min-h-0 flex-1 bg-slate-200 p-2 sm:p-4">

                                <iframe
                                    title={`Report preview - ${selectedReport.public_audit_id}`}
                                    srcDoc={selectedReport.report_html}
                                    sandbox=""
                                    className="h-[72vh] w-full rounded-lg border border-slate-300 bg-white"
                                />

                            </div>

                            {/* MODAL FOOTER */}

                            <div className="flex items-center gap-2 border-t border-slate-700 px-5 py-3 text-xs text-slate-400">

                                <CheckCircle2
                                    size={14}
                                    className="text-emerald-400"
                                />

                                HTML received from the report-generation API

                            </div>

                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}