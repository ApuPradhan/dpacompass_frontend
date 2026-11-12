import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
import {
    RefreshCw,
    Search,
    FileText,
    FileCheck2,
    Eye,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    X,
    ShieldCheck,
    Download,
    Send,
    Undo2,
    Clock3,
} from "lucide-react";

// ============================================================
// API CONFIGURATION
// ============================================================

const ADMIN_REPORTS_ENDPOINT =
    "/api/audits/report-generated-audits/";

const ADMIN_PUBLISHED_REPORTS_ENDPOINT =
    "/api/checklists/audits/published-reports/";

// ============================================================
// HELPERS
// ============================================================

const getApplicationName = (audit) =>
    audit.application?.name ||
    audit.application_name ||
    (typeof audit.application === "string"
        ? audit.application
        : "") ||
    "Unnamed application";

const getApplicationType = (audit) =>
    audit.application?.type ||
    audit.application_type ||
    "—";

const getApplicationUrl = (audit) =>
    audit.application?.url ||
    audit.application_url ||
    "—";

const getReportStatus = (audit) =>
    String(
        audit.report?.status ||
        audit.report_status ||
        ""
    ).toUpperCase();

const isPublished = (audit) => {
    const status = getReportStatus(audit);

    return (
        status === "PUBLISHED" ||
        audit.published === true ||
        String(audit.audit_status || "").toLowerCase() ===
            "published" ||
        Boolean(
            audit.report?.published_at ||
            audit.report?.published_on ||
            audit.published_at ||
            audit.published_on
        )
    );
};

const isGenerated = (audit) => {
    const status = getReportStatus(audit);
    const auditStatus = String(
        audit.audit_status || ""
    ).toLowerCase();

    return (
        status === "REPORT_GENERATED" ||
        status === "PUBLISHED" ||
        auditStatus === "report_generated" ||
        auditStatus === "published" ||
        audit.published === true ||
        Boolean(
            audit.report?.generated_at ||
            audit.report_generated_at ||
            audit.generated_at
        )
    );
};

const getGeneratedAt = (audit) =>
    audit.report?.generated_at ||
    audit.report_generated_at ||
    audit.generated_at ||
    null;

const getPublishedAt = (audit) =>
    audit.report?.published_at ||
    audit.report?.published_on ||
    audit.published_at ||
    audit.published_on ||
    null;

const getAuditorUsername = (audit) =>
    audit.auditor?.username ||
    audit.auditor_username ||
    audit.assigned_auditor?.username ||
    audit.auditor_name ||
    "—";

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ published }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                published
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
            }`}
        >
            <CheckCircle2 size={12} />

            {published ? "Published" : "Generated"}
        </span>
    );
}

// ============================================================
// REPORT SECTION
// ============================================================

function ReportSection({
    title,
    description,
    audits,
    published,
    onView,
    onPublish,
    busyAuditId,
    errors,
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#0c1425]">

            {/* SECTION HEADER */}

            <div className="flex flex-col gap-2 border-b border-slate-700/80 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 font-semibold text-white">

                        {published ? (
                            <ShieldCheck
                                size={19}
                                className="text-emerald-400"
                            />
                        ) : (
                            <Clock3
                                size={19}
                                className="text-indigo-400"
                            />
                        )}

                        {title}

                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {audits.length}
                        </span>

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

                <table className="w-full min-w-[1120px] text-left">

                    <thead className="border-b border-slate-700 bg-[#0a1120]">

                        <tr className="text-xs font-medium text-slate-400">

                            <th className="px-5 py-4">
                                Audit ID
                            </th>

                            <th className="px-5 py-4">
                                Application
                            </th>

                            <th className="px-5 py-4">
                                Type
                            </th>

                            <th className="px-5 py-4">
                                Application URL
                            </th>

                            <th className="px-5 py-4">
                                Auditor
                            </th>

                            <th className="px-5 py-4">
                                Generation Time
                            </th>

                            {published && (
                                <th className="px-5 py-4">
                                    Published Time
                                </th>
                            )}

                            <th className="px-5 py-4">
                                Status
                            </th>

                            <th className="px-5 py-4 text-right">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-700/70">

                        {audits.length === 0 ? (

                            <tr>
                                <td
                                    colSpan={published ? 9 : 8}
                                    className="px-5 py-12 text-center text-sm text-slate-500"
                                >
                                    <FileText
                                        size={25}
                                        className="mx-auto mb-3 text-slate-600"
                                    />

                                    No {published
                                        ? "published"
                                        : "generated"} reports found.
                                </td>
                            </tr>

                        ) : (

                            audits.map((audit) => {

                                const busy =
                                    busyAuditId ===
                                    audit.public_audit_id;

                                return (
                                    <tr
                                        key={
                                            audit.audit_id ||
                                            audit.public_audit_id
                                        }
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
                                            {getApplicationName(audit)}
                                        </td>

                                        {/* APPLICATION TYPE */}

                                        <td className="px-5 py-5 text-sm text-slate-300">
                                            {getApplicationType(audit)}
                                        </td>

                                        {/* APPLICATION URL */}

                                        <td className="max-w-[240px] px-5 py-5 text-sm">

                                            {getApplicationUrl(audit) !== "—" ? (
                                                <a
                                                    href={getApplicationUrl(audit)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title={getApplicationUrl(audit)}
                                                    className="block truncate text-indigo-300 hover:text-indigo-200 hover:underline"
                                                >
                                                    {getApplicationUrl(audit)}
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">
                                                    —
                                                </span>
                                            )}

                                        </td>

                                        {/* AUDITOR */}

                                        <td className="px-5 py-5 text-sm text-slate-300">
                                            {getAuditorUsername(audit)}
                                        </td>

                                        {/* GENERATION TIME */}

                                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                                            {formatDateTime(
                                                getGeneratedAt(audit)
                                            )}
                                        </td>

                                        {/* PUBLISHED TIME */}

                                        {published && (
                                            <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                                                {formatDateTime(
                                                    getPublishedAt(audit)
                                                )}
                                            </td>
                                        )}

                                        {/* STATUS */}

                                        <td className="px-5 py-5">

                                            <StatusBadge
                                                published={published}
                                            />

                                            {errors[audit.public_audit_id] && (
                                                <p className="mt-2 max-w-56 text-xs text-red-400">
                                                    {errors[audit.public_audit_id]}
                                                </p>
                                            )}

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-5 py-5">

                                            <div className="flex items-center justify-end gap-2">

                                                {/* VIEW BUTTON */}

                                                <button
                                                    onClick={() => onView(audit)}
                                                    disabled={busy}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-400 bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-950/40 transition hover:border-indigo-300 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0c1425] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {busy ? (
                                                        <LoaderCircle
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Eye size={14} />
                                                    )}

                                                    View
                                                </button>

                                                {/* PUBLISH / UNPUBLISH */}

                                                <button
                                                    onClick={() =>
                                                        onPublish(
                                                            audit,
                                                            !published
                                                        )
                                                    }
                                                    disabled={busy}
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0c1425] disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        published
                                                            ? "border-amber-400 bg-amber-600 hover:bg-amber-500 focus:ring-amber-400"
                                                            : "border-emerald-400 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400"
                                                    }`}
                                                >
                                                    {published ? (
                                                        <>
                                                            <Undo2 size={14} />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={14} />
                                                            Publish
                                                        </>
                                                    )}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })
                        )}

                    </tbody>

                </table>

            </div>
        </section>
    );
}

// ============================================================
// MAIN ADMIN REPORTS COMPONENT
// ============================================================

export default function AdminReports({ onBack }) {

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [busyAuditId, setBusyAuditId] = useState(null);

    const [errors, setErrors] = useState({});
    const [pageError, setPageError] = useState("");

    const [selectedReport, setSelectedReport] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // ========================================================
    // FETCH GENERATED AND PUBLISHED REPORTS
    // ========================================================

    const fetchReports = useCallback(async () => {

        setRefreshing(true);
        setPageError("");

        try {

            const [
                generatedResponse,
                publishedResponse,
            ] = await Promise.all([

                fetchWithAuth(
                    ADMIN_REPORTS_ENDPOINT,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                ),

                fetchWithAuth(
                    ADMIN_PUBLISHED_REPORTS_ENDPOINT,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                ),

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

            const [
                generatedData,
                publishedData,
            ] = await Promise.all([
                generatedResponse.json(),
                publishedResponse.json(),
            ]);

            /*
                Generated API response:
                {
                    success: true,
                    results: [...]
                }

                Published API response:
                {
                    success: true,
                    count: 1,
                    data: [...]
                }
            */

            if (
                !Array.isArray(generatedData.results) ||
                !Array.isArray(publishedData.data)
            ) {
                throw new Error(
                    "Invalid API response. Expected results from the generated API and data from the published API."
                );
            }

            // Normalize published API response.

            const normalizedPublishedReports =
                publishedData.data.map((report) => ({
                    ...report,

                    audit_id: report.application_id,

                    application_name:
                        report.application_name,

                    report_status:
                        report.report_status,

                    published:
                        report.published,

                    generated_at:
                        report.generated_at,

                    auditor_name:
                        report.auditor_name,

                    auditor: {
                        id: report.auditor_id,
                        username: report.auditor_name,
                    },

                    report: {
                        status: report.report_status,
                        generated_at: report.generated_at,
                    },
                }));

            // Merge both APIs and avoid duplicate audit IDs.

            const combinedReports = [
                ...generatedData.results,
                ...normalizedPublishedReports,
            ];

            const uniqueReports = Array.from(
                new Map(
                    combinedReports.map((audit) => [
                        audit.public_audit_id ||
                            audit.audit_id,
                        audit,
                    ])
                ).values()
            );

            setAudits(
                uniqueReports.filter(isGenerated)
            );

        } catch (error) {

            setPageError(
                error.message ||
                "Unable to load reports."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // ========================================================
    // SEPARATE GENERATED AND PUBLISHED REPORTS
    // ========================================================

    const publishedAudits = useMemo(
        () => audits.filter(isPublished),
        [audits]
    );

    const generatedAudits = useMemo(
        () => audits.filter(
            (audit) => !isPublished(audit)
        ),
        [audits]
    );

    // ========================================================
    // SEARCH
    // ========================================================

    const filterBySearch = (items) => {

        const query = search.trim().toLowerCase();

        if (!query) return items;

        return items.filter((audit) =>
            [
                audit.public_audit_id,
                getApplicationName(audit),
                getApplicationType(audit),
                getApplicationUrl(audit),
                getAuditorUsername(audit),
            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(query)
            )
        );
    };

    // ========================================================
    // PUBLISH / UNPUBLISH REPORT
    //
    // PATCH /api/checklists/audits/{public_audit_id}/publish-report/
    //
    // Publish:
    // { "published": true }
    //
    // Unpublish:
    // { "published": false }
    // ========================================================

    const handlePublish = async (audit, published) => {

        const publicAuditId = audit.public_audit_id;

        if (!publicAuditId) {
            setPageError("Public audit ID is missing.");
            return;
        }

        setBusyAuditId(publicAuditId);

        setErrors((previous) => {
            const next = { ...previous };
            delete next[publicAuditId];
            return next;
        });

        try {

            const endpoint =
                `/api/checklists/audits/${encodeURIComponent(
                    publicAuditId
                )}/publish-report/`;

            const requestBody = {
                published: published === true,
            };

            const response = await fetchWithAuth(
                endpoint,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },

                    body: JSON.stringify(requestBody),
                }
            );

            const responseText = await response.text();

            let result = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch {
                    result = {};
                }
            }

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.detail ||
                    `Unable to ${
                        published ? "publish" : "unpublish"
                    } report. HTTP ${response.status}`
                );
            }

            // Refresh both lists after successful operation.
            // The audit will move to the correct section.

            await fetchReports();

            setConfirmAction(null);

        } catch (error) {

            setErrors((previous) => ({
                ...previous,
                [publicAuditId]:
                    error.message ||
                    `Unable to ${
                        published ? "publish" : "unpublish"
                    } report.`,
            }));

        } finally {

            setBusyAuditId(null);

        }
    };

    // ========================================================
    // FETCH HTML REPORT
    //
    // GET /api/checklists/html_report/{public_audit_id}/
    // ========================================================

    const fetchReportHTML = async (audit) => {

        const publicAuditId = audit.public_audit_id;

        if (!publicAuditId) {
            throw new Error("Public audit ID is missing.");
        }

        const endpoint =
            `/api/checklists/html_report/${encodeURIComponent(
                publicAuditId
            )}/`;

        const response = await fetchWithAuth(
            endpoint,
            {
                method: "GET",
                headers: {
                    Accept: "text/html, application/json",
                },
            }
        );

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

            if (data.success === false) {
                throw new Error(
                    data.message ||
                    "Unable to retrieve report."
                );
            }

            html =
                data.html ||
                data.report_html ||
                data.content ||
                "";
        }

        if (
            typeof html !== "string" ||
            !html.trim()
        ) {
            throw new Error(
                "The server returned an empty HTML report."
            );
        }

        return html;
    };

    // ========================================================
    // OPEN REPORT MODAL
    // ========================================================

    const openReport = async (audit) => {

        const publicAuditId = audit.public_audit_id;

        setBusyAuditId(publicAuditId);

        setErrors((previous) => {
            const next = { ...previous };
            delete next[publicAuditId];
            return next;
        });

        try {

            const html = await fetchReportHTML(audit);

            setSelectedReport({
                ...audit,
                report_html: html,
            });

        } catch (error) {

            setErrors((previous) => ({
                ...previous,
                [publicAuditId]:
                    error.message ||
                    "Unable to load report.",
            }));

        } finally {

            setBusyAuditId(null);

        }
    };

    // ========================================================
    // DOWNLOAD HTML
    // ========================================================

    const downloadHTML = () => {

        if (!selectedReport?.report_html) return;

        const blob = new Blob(
            [selectedReport.report_html],
            {
                type: "text/html;charset=utf-8",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
            `${selectedReport.public_audit_id}_report.html`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    };

    // ========================================================
    // DOWNLOAD PDF
    // ========================================================

    const downloadPDF = () => {

        if (!selectedReport?.report_html) return;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            setPageError(
                "Pop-up blocked. Allow pop-ups to print or save the PDF."
            );
            return;
        }

        printWindow.document.open();

        printWindow.document.write(
            selectedReport.report_html
        );

        printWindow.document.close();

        printWindow.document.title =
            `${selectedReport.public_audit_id}_report`;

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-[#080e1d] px-4 py-5 text-slate-200 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-[1800px] space-y-7">

                {/* PAGE HEADER */}

                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>

                        <div className="mb-5">

                            <button
                                onClick={
                                    onBack ||
                                    (() => window.history.back())
                                }
                                className="inline-flex items-center gap-2 text-sm text-indigo-400 transition hover:text-indigo-300"
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                Back to Dashboard
                            </button>

                        </div>

                        <div className="flex items-start gap-3">

                            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
                                <FileCheck2 size={27} />
                            </div>

                            <div>

                                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                    Audit Reports
                                </h1>

                                <p className="mt-1 text-sm text-slate-400">
                                    Review auditor-generated reports and manage publication.
                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={fetchReports}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm text-slate-200 transition hover:border-indigo-500/60 hover:bg-slate-800 disabled:opacity-60"
                    >

                        <RefreshCw
                            size={15}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </header>

                {/* PAGE ERROR */}

                {pageError && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            {pageError}
                        </div>

                    </div>
                )}

                {/* STATISTICS */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-slate-700/70 bg-[#111827]/80 p-5">

                        <p className="text-sm text-slate-400">
                            Total Reports
                        </p>

                        <p className="mt-2 text-3xl font-semibold text-white">
                            {loading ? "—" : audits.length}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                            All generated and published reports
                        </p>

                    </div>

                    <div className="rounded-xl border border-indigo-500/30 bg-[#111827]/80 p-5">

                        <p className="text-sm text-slate-400">
                            Generated
                        </p>

                        <p className="mt-2 text-3xl font-semibold text-indigo-300">
                            {loading
                                ? "—"
                                : generatedAudits.length}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                            Awaiting administrator publication
                        </p>

                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-[#111827]/80 p-5">

                        <p className="text-sm text-slate-400">
                            Published
                        </p>

                        <p className="mt-2 text-3xl font-semibold text-emerald-300">
                            {loading
                                ? "—"
                                : publishedAudits.length}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                            Reports published by administrators
                        </p>

                    </div>

                </div>

                {/* SEARCH */}

                <div className="relative max-w-xl">

                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search audit ID, application, URL or auditor..."
                        className="w-full rounded-lg border border-slate-700 bg-[#0c1425] py-3 pl-9 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
                    />

                </div>

                {/* REPORT SECTIONS */}

                {loading ? (

                    <div className="rounded-xl border border-slate-700 bg-[#0c1425] py-16 text-center">

                        <LoaderCircle
                            size={30}
                            className="mx-auto animate-spin text-indigo-400"
                        />

                        <p className="mt-3 text-sm text-slate-300">
                            Loading audit reports...
                        </p>

                    </div>

                ) : (

                    <>

                        {/* GENERATED REPORTS */}

                        <ReportSection
                            title="Generated Reports"
                            description="Reports generated by auditors and awaiting administrator publication."
                            audits={filterBySearch(generatedAudits)}
                            published={false}
                            onView={openReport}
                            onPublish={(audit) =>
                                setConfirmAction({
                                    audit,
                                    published: true,
                                })
                            }
                            busyAuditId={busyAuditId}
                            errors={errors}
                        />

                        {/* PUBLISHED REPORTS */}

                        <ReportSection
                            title="Published Reports"
                            description="Reports already published by an administrator."
                            audits={filterBySearch(publishedAudits)}
                            published={true}
                            onView={openReport}
                            onPublish={(audit) =>
                                setConfirmAction({
                                    audit,
                                    published: false,
                                })
                            }
                            busyAuditId={busyAuditId}
                            errors={errors}
                        />

                    </>
                )}

            </div>

            {/* =================================================
                REPORT PREVIEW MODAL
            ================================================= */}

            {selectedReport && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setSelectedReport(null);
                        }
                    }}
                >

                    <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0c1425] shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">

                            <div>

                                <h2 className="font-semibold text-white">
                                    Report Preview
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    {getApplicationName(selectedReport)}
                                    {" · "}
                                    {selectedReport.public_audit_id}
                                </p>

                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={downloadHTML}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                                >
                                    <Download size={14} />
                                    HTML
                                </button>

                                <button
                                    onClick={downloadPDF}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    <Download size={14} />
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

                        {/* REPORT HTML */}

                        <div className="min-h-0 flex-1 bg-slate-200 p-2 sm:p-4">

                            <iframe
                                title={`Report preview - ${selectedReport.public_audit_id}`}
                                srcDoc={selectedReport.report_html}
                                sandbox=""
                                className="h-[72vh] w-full rounded-lg border border-slate-300 bg-white"
                            />

                        </div>

                        <div className="flex items-center gap-2 border-t border-slate-700 px-5 py-3 text-xs text-slate-400">

                            <CheckCircle2
                                size={14}
                                className="text-emerald-400"
                            />

                            HTML report loaded from the report API

                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                PUBLISH / UNPUBLISH CONFIRMATION MODAL
            ================================================= */}

            {confirmAction && (

                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-2xl">

                        <div className="flex items-start gap-3">

                            <div
                                className={`rounded-lg border p-2 ${
                                    confirmAction.published
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                }`}
                            >

                                {confirmAction.published ? (
                                    <Send size={21} />
                                ) : (
                                    <Undo2 size={21} />
                                )}

                            </div>

                            <div>

                                <h3 className="text-lg font-semibold text-white">
                                    {confirmAction.published
                                        ? "Publish report?"
                                        : "Unpublish report?"}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {confirmAction.published
                                        ? "This will publish the report and move it to the Published Reports section."
                                        : "This will unpublish the report and move it back to Generated Reports."}
                                </p>

                                <p className="mt-3 font-mono text-xs text-slate-300">
                                    {confirmAction.audit.public_audit_id}
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() =>
                                    setConfirmAction(null)
                                }
                                className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() =>
                                    handlePublish(
                                        confirmAction.audit,
                                        confirmAction.published
                                    )
                                }
                                disabled={
                                    busyAuditId ===
                                    confirmAction.audit.public_audit_id
                                }
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    confirmAction.published
                                        ? "bg-emerald-600 hover:bg-emerald-500"
                                        : "bg-amber-600 hover:bg-amber-500"
                                }`}
                            >

                                {busyAuditId ===
                                    confirmAction.audit.public_audit_id && (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                )}

                                {confirmAction.published
                                    ? "Confirm Publish"
                                    : "Confirm Unpublish"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}