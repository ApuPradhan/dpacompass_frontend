
import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    FileText,
    CalendarDays,
    User,
    ClipboardList,
    Eye,
    X,
    Download,
    Printer,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    ShieldCheck,
    Hash,
} from "lucide-react";

import { fetchWithAuth } from "../utilities/fetchWithAuth";

const PUBLISHED_REPORTS_ENDPOINT =
    "/api/checklists/audits/published-reports/";

const HTML_REPORT_ENDPOINT = "/api/checklists/html_report/";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const formatDateTime = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });
};

const getReportStatusStyle = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "PUBLISHED") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    return "border-gray-600 bg-gray-700/50 text-gray-300";
};

// Extract HTML from either a direct HTML response or JSON response.
const extractReportHtml = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        const data = await response.json();

        const html =
            data.html ??
            data.report_html ??
            data.content ??
            data.report ??
            data.data?.html ??
            data.data?.report_html;

        if (typeof html !== "string") {
            throw new Error(
                "The report API did not return HTML content."
            );
        }

        return html;
    }

    return await response.text();
};

// --------------------------------------------------
// Summary Card
// --------------------------------------------------

const SummaryCard = ({
    title,
    count,
    description,
    icon: Icon,
    color,
}) => (
    <div className="rounded-xl border border-gray-700 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-400">
                    {title}
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                    {count}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    {description}
                </p>
            </div>

            <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color}`}
            >
                <Icon size={23} />
            </div>
        </div>
    </div>
);

// --------------------------------------------------
// Report Details Modal
// --------------------------------------------------

const ReportViewerModal = ({
    report,
    html,
    onClose,
}) => {
    const [actionError, setActionError] = useState("");

    if (!report || !html) return null;

    const handleDownloadHtml = () => {
        try {
            const blob = new Blob([html], {
                type: "text/html;charset=utf-8",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${report.public_audit_id || "audit-report"}.html`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("HTML download error:", error);
            setActionError("Unable to download the HTML report.");
        }
    };

    const handleDownloadPdf = () => {
        setActionError("");

        try {
            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                setActionError(
                    "The print window was blocked. Please allow pop-ups and try again."
                );
                return;
            }

            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();

            // Wait for the report document to load before opening print dialog.
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

            // Fallback for HTML documents whose onload event has already fired.
            if (printWindow.document.readyState === "complete") {
                printWindow.focus();
                printWindow.print();
            }
        } catch (error) {
            console.error("PDF print error:", error);
            setActionError("Unable to open the PDF print dialog.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
            onClick={onClose}
        >
            <div
                className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#0f172a] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-gray-700 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <FileText size={21} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-white">
                                Audit Report
                            </h2>

                            <p className="mt-1 truncate text-xs text-gray-400">
                                {report.application_name} · {report.public_audit_id}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleDownloadHtml}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-[#1f2937] px-3.5 py-2 text-sm font-medium text-gray-300 transition hover:border-indigo-500 hover:text-white"
                        >
                            <Download size={15} />
                            Download HTML
                        </button>

                        <button
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            <Printer size={15} />
                            Save as PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                            aria-label="Close report"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Action error */}
                {actionError && (
                    <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-400">
                        {actionError}
                    </div>
                )}

                {/* Report Preview */}
                <div className="min-h-0 flex-1 bg-white">
                    <iframe
                        title={`Audit Report ${report.public_audit_id}`}
                        srcDoc={html}
                        className="h-[75vh] w-full border-0 bg-white"
                        sandbox="allow-same-origin"
                    />
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 bg-[#111827] px-5 py-3 sm:px-6">
                    <div>
                        <p className="text-xs text-gray-400">
                            Report ID
                        </p>

                        <p className="mt-0.5 text-sm font-medium text-gray-200">
                            {report.public_audit_id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-600 bg-[#1f2937] px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --------------------------------------------------
// Main Published Reports Component
// --------------------------------------------------

const AuditeePublishedReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [selectedReport, setSelectedReport] = useState(null);
    const [reportHtml, setReportHtml] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState("");

    // --------------------------------------------------
    // Fetch Published Reports
    // --------------------------------------------------

    const fetchPublishedReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetchWithAuth(
                PUBLISHED_REPORTS_ENDPOINT,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to fetch published reports.");
            }

            const result = await response.json();

            const reportList = Array.isArray(result)
                ? result
                : result.data || result.results || [];

            // Display only reports confirmed as published.
            const publishedReports = reportList.filter(
                (report) =>
                    String(report.report_status || "").trim().toUpperCase() ===
                    "PUBLISHED"
            );

            setReports(publishedReports);
        } catch (err) {
            console.error("Published reports error:", err);

            setError(
                err.message ||
                "Something went wrong while loading published reports."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishedReports();
    }, []);

    // --------------------------------------------------
    // View Report
    // --------------------------------------------------

    const handleViewReport = async (report) => {
        if (!report.public_audit_id) {
            setReportError("Public Audit ID is not available.");
            return;
        }

        try {
            setSelectedReport(report);
            setReportHtml("");
            setReportError("");
            setReportLoading(true);

            const endpoint =
                `${HTML_REPORT_ENDPOINT}${encodeURIComponent(
                    report.public_audit_id
                )}/`;

            const response = await fetchWithAuth(endpoint, {
                method: "GET",
                headers: {
                    Accept: "text/html, application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Unable to load the audit report.");
            }

            const html = await extractReportHtml(response);

            if (!html || !html.trim()) {
                throw new Error("The report is empty.");
            }

            setReportHtml(html);
        } catch (err) {
            console.error("Report viewing error:", err);

            setReportError(
                err.message || "Failed to load the audit report."
            );
        } finally {
            setReportLoading(false);
        }
    };

    const closeReportViewer = () => {
        setSelectedReport(null);
        setReportHtml("");
        setReportError("");
        setReportLoading(false);
    };

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    const filteredReports = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return reports;

        return reports.filter((report) => {
            const fields = [
                report.application_name,
                report.public_audit_id,
                report.auditor_name,
                report.report_status,
                report.application_id,
            ];

            return fields.some(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    String(value).toLowerCase().includes(query)
            );
        });
    }, [reports, search]);

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b1120] to-[#1e293b] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Page Heading */}
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-400">
                            <ShieldCheck size={16} />
                            Auditee Dashboard
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Published Audit Reports
                        </h1>

                        <p className="mt-2 text-sm text-gray-400">
                            Access and download audit reports published for your applications.
                        </p>
                    </div>

                    <button
                        onClick={fetchPublishedReports}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm font-medium text-gray-300 shadow-sm transition hover:border-indigo-500 hover:bg-[#1f2937] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SummaryCard
                        title="Published Reports"
                        count={reports.length}
                        description="Reports available for viewing"
                        icon={FileText}
                        color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    />

                    <SummaryCard
                        title="Applications Covered"
                        count={
                            new Set(
                                reports
                                    .map((report) => report.application_id)
                                    .filter((id) => id !== null && id !== undefined)
                            ).size
                        }
                        description="Unique applications with published reports"
                        icon={ClipboardList}
                        color="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                    />
                </div>

                {/* Reports Table */}
                <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#111827]/80 shadow-xl shadow-black/10">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-gray-700 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Published Report Records
                            </h2>

                            <p className="mt-1 text-xs text-gray-400">
                                {filteredReports.length} report(s) found
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search application, audit ID, auditor..."
                                className="w-full rounded-lg border border-gray-700 bg-[#1f2937] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw
                                size={28}
                                className="animate-spin text-indigo-400"
                            />

                            <p className="mt-3 text-sm text-gray-400">
                                Loading published reports...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                            <AlertCircle
                                size={32}
                                className="text-red-400"
                            />

                            <p className="mt-3 font-semibold text-white">
                                Failed to load published reports
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                                {error}
                            </p>

                            <button
                                onClick={fetchPublishedReports}
                                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading &&
                        !error &&
                        filteredReports.length === 0 && (
                            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-[#1f2937]">
                                    {search ? (
                                        <Search
                                            size={24}
                                            className="text-gray-400"
                                        />
                                    ) : (
                                        <FileText
                                            size={25}
                                            className="text-gray-400"
                                        />
                                    )}
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-white">
                                    {search
                                        ? "No matching reports"
                                        : "No published reports yet"}
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-gray-400">
                                    {search
                                        ? "Try changing your search keywords."
                                        : "Published audit reports will appear here when they are made available."}
                                </p>
                            </div>
                        )}

                    {/* Table */}
                    {!loading &&
                        !error &&
                        filteredReports.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left">
                                    <thead className="bg-[#0f172a]/90">
                                        <tr className="border-b border-gray-700">
                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Application
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Audit ID
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Auditor
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Generated On
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-700">
                                        {filteredReports.map((report, index) => (
                                            <tr
                                                key={
                                                    report.public_audit_id ||
                                                    `${report.application_id}-${index}`
                                                }
                                                className="transition hover:bg-[#2a3446]/60"
                                            >
                                                {/* Application */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                                                            <FileText size={19} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {report.application_name ||
                                                                    "Unnamed Application"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Application ID: {report.application_id ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Audit ID */}
                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-medium text-indigo-400">
                                                        {report.public_audit_id || "—"}
                                                    </span>
                                                </td>

                                                {/* Auditor */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-gray-300">
                                                            <User size={15} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-200">
                                                                {report.auditor_name || "—"}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                Auditor ID: {report.auditor_id ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Generation Date */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <CalendarDays
                                                            size={15}
                                                            className="shrink-0 text-gray-500"
                                                        />

                                                        {formatDateTime(report.generated_at)}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getReportStatusStyle(
                                                            report.report_status
                                                        )}`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                                        {report.report_status || "Unknown"}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewReport(report)}
                                                        disabled={!report.public_audit_id}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-400 transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Eye size={15} />
                                                        View Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>

                <p className="mt-4 text-xs text-gray-500">
                    Only published reports returned by the published reports service are displayed.
                </p>
            </div>

            {/* Report Loading / Error Modal */}
            {selectedReport && !reportHtml && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={closeReportViewer}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-gray-700 bg-[#0f172a] p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                                {reportLoading
                                    ? "Loading Report"
                                    : "Unable to Open Report"}
                            </h3>

                            <button
                                onClick={closeReportViewer}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {reportLoading ? (
                            <div className="flex flex-col items-center py-10">
                                <RefreshCw
                                    size={28}
                                    className="animate-spin text-indigo-400"
                                />

                                <p className="mt-3 text-sm text-gray-400">
                                    Fetching audit report...
                                </p>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <AlertCircle
                                    size={32}
                                    className="mx-auto text-red-400"
                                />

                                <p className="mt-3 text-sm text-gray-300">
                                    {reportError || "Unable to load this report."}
                                </p>

                                <button
                                    onClick={() => handleViewReport(selectedReport)}
                                    className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Report Viewer */}
            {selectedReport && reportHtml && (
                <ReportViewerModal
                    report={selectedReport}
                    html={reportHtml}
                    onClose={closeReportViewer}
                />
            )}
        </div>
    );
};

export default AuditeePublishedReports;
