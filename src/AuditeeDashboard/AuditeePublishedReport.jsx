
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
    AlertCircle,
    ShieldCheck,
    ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
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
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <p className="mt-2 text-3xl font-bold tabular-nums text-[#14213D]">
                    {count}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>
            </div>

            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${color}`}
            >
                <Icon size={23} />
            </div>
        </div>
    </div>
);

// --------------------------------------------------
// Report Viewer Modal
// --------------------------------------------------

const ReportViewerModal = ({
    report,
    html,
    onClose,
}) => {
    const [actionError, setActionError] = useState("");

    if (!report || !html) return null;

    const handleDownloadHtml = () => {
        setActionError("");

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
            onClick={onClose}
        >
            <div
                className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#075EB5]">
                            <FileText size={21} />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-[#14213D]">
                                Audit Report
                            </h2>

                            <p className="mt-1 truncate text-xs text-slate-500">
                                {report.application_name} · {report.public_audit_id}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleDownloadHtml}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5]"
                        >
                            <Download size={15} />
                            Download HTML
                        </button>

                        <button
                            onClick={handleDownloadPdf}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#075EB5] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#064D94]"
                        >
                            <Printer size={15} />
                            Save as PDF
                        </button>

                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close report"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Action Error */}
                {actionError && (
                    <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
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
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
                    <div>
                        <p className="text-xs text-slate-500">
                            Report ID
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#14213D]">
                            {report.public_audit_id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">

                {/* Page Heading */}
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <button
                            onClick={() => navigate("/devdashboard")}
                            className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5]"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>

                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#075EB5]">
                            <ShieldCheck size={16} />
                            Auditee Dashboard
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                            Published Audit Reports
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Access and download audit reports published for your applications.
                        </p>
                    </div>

                    <button
                        onClick={fetchPublishedReports}
                        disabled={loading}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5] disabled:cursor-not-allowed disabled:opacity-60"
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
                        color="border-emerald-100 bg-emerald-50 text-emerald-600"
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
                        color="border-blue-100 bg-blue-50 text-[#075EB5]"
                    />
                </div>

                {/* Reports Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-[#14213D]">
                                Published Report Records
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredReports.length} report(s) found
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-md">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search application, audit ID, auditor..."
                                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#075EB5] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw
                                size={28}
                                className="animate-spin text-[#075EB5]"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-500">
                                Loading published reports...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                                <AlertCircle size={30} />
                            </div>

                            <p className="mt-3 font-semibold text-[#14213D]">
                                Failed to load published reports
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {error}
                            </p>

                            <button
                                onClick={fetchPublishedReports}
                                className="mt-5 cursor-pointer rounded-lg bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064D94]"
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                                    {search ? (
                                        <Search
                                            size={24}
                                            className="text-slate-400"
                                        />
                                    ) : (
                                        <FileText
                                            size={25}
                                            className="text-slate-400"
                                        />
                                    )}
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-[#14213D]">
                                    {search
                                        ? "No matching reports"
                                        : "No published reports yet"}
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-500">
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
                                    <thead className="bg-[#EAF3FF]">
                                        <tr className="border-b border-blue-100">
                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Application
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Audit ID
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Auditor
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Generated On
                                            </th>

                                            <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#173B70]">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredReports.map((report, index) => (
                                            <tr
                                                key={
                                                    report.public_audit_id ||
                                                    `${report.application_id}-${index}`
                                                }
                                                className="transition hover:bg-blue-50/60"
                                            >
                                                {/* Application */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#075EB5]">
                                                            <FileText size={19} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-[#14213D]">
                                                                {report.application_name ||
                                                                    "Unnamed Application"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Application ID: {report.application_id ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Audit ID */}
                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-semibold text-[#075EB5]">
                                                        {report.public_audit_id || "—"}
                                                    </span>
                                                </td>

                                                {/* Auditor */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                                                            <User size={15} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">
                                                                {report.auditor_name || "—"}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-500">
                                                                Auditor ID: {report.auditor_id ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Generation Date */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <CalendarDays
                                                            size={15}
                                                            className="shrink-0 text-slate-400"
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
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-[#075EB5] transition hover:border-[#075EB5] hover:bg-[#075EB5] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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

                <p className="mt-4 text-xs text-slate-400">
                    Only published reports returned by the published reports service are displayed.
                </p>
            </div>

            {/* Report Loading / Error Modal */}
            {selectedReport && !reportHtml && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onClick={closeReportViewer}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#14213D]">
                                {reportLoading
                                    ? "Loading Report"
                                    : "Unable to Open Report"}
                            </h3>

                            <button
                                onClick={closeReportViewer}
                                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {reportLoading ? (
                            <div className="flex flex-col items-center py-10">
                                <RefreshCw
                                    size={28}
                                    className="animate-spin text-[#075EB5]"
                                />

                                <p className="mt-3 text-sm text-slate-500">
                                    Fetching audit report...
                                </p>
                            </div>
                        ) : (
                            <div className="py-6 text-center">
                                <AlertCircle
                                    size={32}
                                    className="mx-auto text-red-500"
                                />

                                <p className="mt-3 text-sm text-slate-600">
                                    {reportError || "Unable to load this report."}
                                </p>

                                <button
                                    onClick={() => handleViewReport(selectedReport)}
                                    className="mt-5 cursor-pointer rounded-lg bg-[#075EB5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064D94]"
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
