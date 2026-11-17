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
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                published
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
        >
            <span className={`h-2 w-2 rounded-full ${published ? "bg-emerald-500" : "bg-blue-500"}`} />
            {published ? "Published" : "Generated"}
        </span>
    );
}

// ============================================================
// COMBINED REPORT TABLE
// ============================================================

function ReportTable({
    audits,
    onView,
    onPublish,
    busyAuditId,
    errors,
}) {
    const styles = {
        section: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        header: "flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between",
        title: "text-xl font-bold text-[#14213D]",
        description: "mt-1 text-base text-slate-600",
        summary: "flex flex-wrap items-center gap-2",
        summaryBadge: "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        tableViewport: "overflow-x-auto",
        table: "w-full min-w-[1450px] border-separate border-spacing-0 text-left",
        tableHead: "bg-[#EAF3FF]",
        th: "whitespace-nowrap border-b border-blue-100 px-5 py-4 text-sm font-bold uppercase tracking-wide text-[#24466F]",
        thActions: "whitespace-nowrap border-b border-blue-100 px-5 py-4 text-right text-sm font-bold uppercase tracking-wide text-[#24466F]",
        row: "transition-colors hover:bg-blue-50/70",
        cell: "border-b border-slate-100 px-5 py-4 text-base text-slate-700",
        idBadge: "inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-sm font-medium text-slate-700",
        application: "block max-w-[220px] truncate font-semibold text-[#14213D]",
        url: "block max-w-[220px] truncate font-medium text-blue-700 hover:text-blue-900 hover:underline",
        actions: "flex items-center justify-end gap-2",
        viewButton: "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-700 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
        actionButton: "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
        empty: "px-5 py-16 text-center",
    };

    const generatedCount = audits.filter((audit) => !isPublished(audit)).length;
    const publishedCount = audits.filter(isPublished).length;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>All Audit Reports</h2>
                    <p className={styles.description}>
                        View, publish and manage auditor-generated reports from one place.
                    </p>
                </div>

                <div className={styles.summary}>
                    <span className={`${styles.summaryBadge} bg-blue-50 text-blue-700`}>
                        <Clock3 size={15} />
                        Generated: {generatedCount}
                    </span>
                    <span className={`${styles.summaryBadge} bg-emerald-50 text-emerald-700`}>
                        <ShieldCheck size={15} />
                        Published: {publishedCount}
                    </span>
                    <span className={`${styles.summaryBadge} bg-slate-100 text-slate-700`}>
                        Total: {audits.length}
                    </span>
                </div>
            </div>

            <div className={styles.tableViewport}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.tableHead}>
                            <th className={styles.th}>Audit ID</th>
                            <th className={styles.th}>Application</th>
                            <th className={styles.th}>Type</th>
                            <th className={styles.th}>Application URL</th>
                            <th className={styles.th}>Auditor</th>
                            <th className={styles.th}>Generation Time</th>
                            <th className={styles.th}>Published Time</th>
                            <th className={styles.th}>Report Status</th>
                            <th className={styles.thActions}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {audits.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.empty}>
                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                            <FileText size={23} />
                                        </div>
                                        <p className="text-base font-semibold text-slate-700">
                                            No audit reports found
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Generated and published reports will appear here.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            audits.map((audit, index) => {
                                const published = isPublished(audit);
                                const busy = busyAuditId === audit.public_audit_id;

                                return (
                                    <tr
                                        key={audit.public_audit_id || audit.audit_id}
                                        className={`${styles.row} ${index % 2 ? "bg-slate-50/60" : "bg-white"}`}
                                    >
                                        <td className={`${styles.cell} whitespace-nowrap`}>
                                            <span className={styles.idBadge}>
                                                {audit.public_audit_id || "—"}
                                            </span>
                                        </td>

                                        <td className={styles.cell}>
                                            <span
                                                className={styles.application}
                                                title={getApplicationName(audit)}
                                            >
                                                {getApplicationName(audit)}
                                            </span>
                                        </td>

                                        <td className={styles.cell}>
                                            {getApplicationType(audit)}
                                        </td>

                                        <td className={styles.cell}>
                                            {getApplicationUrl(audit) !== "—" ? (
                                                <a
                                                    href={getApplicationUrl(audit)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title={getApplicationUrl(audit)}
                                                    className={styles.url}
                                                >
                                                    {getApplicationUrl(audit)}
                                                </a>
                                            ) : "—"}
                                        </td>

                                        <td className={`${styles.cell} whitespace-nowrap font-medium`}>
                                            {getAuditorUsername(audit)}
                                        </td>

                                        <td className={`${styles.cell} whitespace-nowrap`}>
                                            {formatDateTime(getGeneratedAt(audit))}
                                        </td>

                                        <td className={`${styles.cell} whitespace-nowrap`}>
                                            {published ? formatDateTime(getPublishedAt(audit)) : "—"}
                                        </td>

                                        <td className={styles.cell}>
                                            <StatusBadge published={published} />
                                            {errors[audit.public_audit_id] && (
                                                <p className="mt-2 max-w-56 text-sm font-medium text-red-700">
                                                    {errors[audit.public_audit_id]}
                                                </p>
                                            )}
                                        </td>

                                        <td className={styles.cell}>
                                            <div className={styles.actions}>
                                                <button
                                                    type="button"
                                                    onClick={() => onView(audit)}
                                                    disabled={busy}
                                                    className={styles.viewButton}
                                                >
                                                    {busy
                                                        ? <LoaderCircle size={16} className="animate-spin" />
                                                        : <Eye size={16} />}
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onPublish(audit, !published)}
                                                    disabled={busy}
                                                    className={`${styles.actionButton} ${
                                                        published
                                                            ? "border-red-700 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                                                            : "border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500"
                                                    }`}
                                                >
                                                    {published ? (
                                                        <>
                                                            <Undo2 size={16} />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={16} />
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

    const styles = {
        page: "min-h-screen bg-[#F4F7FB] px-4 py-6 text-slate-700 sm:px-6 lg:px-8",
        container: "mx-auto max-w-[1800px] space-y-7",
        backButton: "inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-blue-700 transition hover:text-blue-900",
        refreshButton: "inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60",
        pageError: "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-700",
        statCard: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        statLabel: "text-base font-medium text-slate-600",
        statValue: "mt-2 text-4xl font-bold text-[#14213D]",
        statDescription: "mt-3 text-base text-slate-500",
        searchWrapper: "relative max-w-xl",
        searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500",
        searchInput: "w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-base text-[#14213D] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        categoryBar: "flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm",
        categoryButton: "inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        categoryCount: "rounded-full px-2 py-0.5 text-xs font-bold",
        loadingPanel: "rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm",
        loadingText: "mt-3 text-base text-slate-700",
        previewOverlay: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-3 backdrop-blur-sm sm:p-6",
        previewModal: "flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
        modalHeader: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4",
        modalTitle: "text-xl font-bold text-[#14213D]",
        pageDescription: "mt-1 text-base leading-6 text-slate-600",
        modalSubtitle: "mt-1 text-base text-slate-600",
        modalAction: "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm transition",
        modalClose: "cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-[#14213D]",
        previewFrameArea: "min-h-0 flex-1 bg-slate-100 p-2 sm:p-4",
        previewFrame: "h-[72vh] w-full rounded-lg border border-slate-300 bg-white",
        previewFooter: "flex items-center gap-2 border-t border-slate-200 px-5 py-3 text-sm text-slate-600",
        confirmOverlay: "fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm",
        confirmModal: "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
        confirmTitle: "text-lg font-bold text-[#14213D]",
        confirmDescription: "mt-2 text-base leading-6 text-slate-600",
        confirmIdentifier: "mt-3 font-mono text-base text-slate-700",
        cancelButton: "cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100",
        confirmButton: "inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
    };

    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");

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

    const visibleAudits = useMemo(() => {
        const searchedAudits = filterBySearch(audits);

        if (category === "generated") {
            return searchedAudits.filter((audit) => !isPublished(audit));
        }

        if (category === "published") {
            return searchedAudits.filter(isPublished);
        }

        return searchedAudits;
    }, [audits, search, category]);

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
        <div className={styles.page}>

            <div className={styles.container}>

                {/* PAGE HEADER */}

                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>

                        <div className="mb-5">

                            <button
                                onClick={
                                    onBack ||
                                    (() => window.history.back())
                                }
                                className={styles.backButton}
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                Back to Dashboard
                            </button>

                        </div>

                        <div className="flex items-start gap-3">

                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-700">
                                <FileCheck2 size={27} />
                            </div>

                            <div>

                                <h1 className="text-3xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
                                    Audit Reports
                                </h1>

                                <p className={styles.pageDescription}>
                                    Review auditor-generated reports and manage publication.
                                </p>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={fetchReports}
                        disabled={refreshing}
                        className={styles.refreshButton}
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
                    <div className={styles.pageError}>

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

                    <div className={styles.statCard}>

                        <p className={styles.statLabel}>
                            Total Reports
                        </p>

                        <p className={styles.statValue}>
                            {loading ? "—" : audits.length}
                        </p>

                        <p className={styles.statDescription}>
                            All generated and published reports
                        </p>

                    </div>

                    <div className={`${styles.statCard} border-blue-200`}>

                        <p className="text-base text-slate-600">
                            Generated
                        </p>

                        <p className={`${styles.statValue} text-blue-700`}>
                            {loading
                                ? "—"
                                : generatedAudits.length}
                        </p>

                        <p className="mt-3 text-base text-slate-500">
                            Awaiting administrator publication
                        </p>

                    </div>

                    <div className={`${styles.statCard} border-emerald-200`}>

                        <p className="text-base text-slate-600">
                            Published
                        </p>

                        <p className={`${styles.statValue} text-emerald-700`}>
                            {loading
                                ? "—"
                                : publishedAudits.length}
                        </p>

                        <p className="mt-3 text-base text-slate-500">
                            Reports published by administrators
                        </p>

                    </div>

                </div>

                {/* SEARCH */}

                <div className={styles.searchWrapper}>

                    <Search
                        size={16}
                        className={styles.searchIcon}
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search audit ID, application, URL or auditor..."
                        className={styles.searchInput}
                    />

                </div>

                {/* REPORT SECTIONS */}

                {loading ? (

                    <div className={styles.loadingPanel}>

                        <LoaderCircle
                            size={30}
                            className="mx-auto animate-spin text-blue-700"
                        />

                        <p className={styles.loadingText}>
                            Loading audit reports...
                        </p>

                    </div>

                ) : (

                    <>

                        {/* CATEGORY SWITCHER */}

                        <div className={styles.categoryBar} role="tablist" aria-label="Report categories">
                            {[
                                {
                                    id: "all",
                                    label: "All Reports",
                                    count: audits.length,
                                    activeClass: "bg-[#075EB5] text-white shadow-sm",
                                    inactiveClass: "text-slate-600 hover:bg-slate-100 hover:text-[#14213D]",
                                    countActive: "bg-white/20 text-white",
                                    countInactive: "bg-slate-200 text-slate-700",
                                },
                                {
                                    id: "generated",
                                    label: "Generated",
                                    count: generatedAudits.length,
                                    activeClass: "bg-blue-600 text-white shadow-sm",
                                    inactiveClass: "text-blue-700 hover:bg-blue-50",
                                    countActive: "bg-white/20 text-white",
                                    countInactive: "bg-blue-100 text-blue-700",
                                },
                                {
                                    id: "published",
                                    label: "Published",
                                    count: publishedAudits.length,
                                    activeClass: "bg-emerald-600 text-white shadow-sm",
                                    inactiveClass: "text-emerald-700 hover:bg-emerald-50",
                                    countActive: "bg-white/20 text-white",
                                    countInactive: "bg-emerald-100 text-emerald-700",
                                },
                            ].map((item) => {
                                const active = category === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setCategory(item.id)}
                                        className={`${styles.categoryButton} ${
                                            active ? item.activeClass : item.inactiveClass
                                        }`}
                                    >
                                        {item.label}
                                        <span className={`${styles.categoryCount} ${
                                            active ? item.countActive : item.countInactive
                                        }`}>
                                            {item.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* SINGLE REPORT TABLE WITH CATEGORY FILTER */}

                        <ReportTable
                            audits={visibleAudits}
                            onView={openReport}
                            onPublish={(audit, published) =>
                                setConfirmAction({
                                    audit,
                                    published,
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
                    className={styles.previewOverlay}
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setSelectedReport(null);
                        }
                    }}
                >

                    <div className={styles.previewModal}>

                        {/* MODAL HEADER */}

                        <div className={styles.modalHeader}>

                            <div>

                                <h2 className={styles.modalTitle}>
                                    Report Preview
                                </h2>

                                <p className="mt-1 text-base text-slate-600">
                                    {getApplicationName(selectedReport)}
                                    {" · "}
                                    {selectedReport.public_audit_id}
                                </p>

                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    onClick={downloadHTML}
                                    className={`${styles.modalAction} border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200`}
                                >
                                    <Download size={14} />
                                    HTML
                                </button>

                                <button
                                    onClick={downloadPDF}
                                    className={`${styles.modalAction} border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700`}
                                >
                                    <Download size={14} />
                                    PDF
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedReport(null)
                                    }
                                    aria-label="Close report preview"
                                    className={styles.modalClose}
                                >
                                    <X size={17} />
                                </button>

                            </div>

                        </div>

                        {/* REPORT HTML */}

                        <div className={styles.previewFrameArea}>

                            <iframe
                                title={`Report preview - ${selectedReport.public_audit_id}`}
                                srcDoc={selectedReport.report_html}
                                sandbox=""
                                className={styles.previewFrame}
                            />

                        </div>

                        <div className={styles.previewFooter}>

                            <CheckCircle2
                                size={14}
                                className="text-emerald-700"
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

                <div className={styles.confirmOverlay}>

                    <div className={styles.confirmModal}>

                        <div className="flex items-start gap-3">

                            <div
                                className={`rounded-lg border p-2 ${
                                    confirmAction.published
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                            >

                                {confirmAction.published ? (
                                    <Send size={21} />
                                ) : (
                                    <Undo2 size={21} />
                                )}

                            </div>

                            <div>

                                <h3 className={styles.confirmTitle}>
                                    {confirmAction.published
                                        ? "Publish report?"
                                        : "Unpublish report?"}
                                </h3>

                                <p className={styles.confirmDescription}>
                                    {confirmAction.published
                                        ? "This will publish the report and move it to the Published Reports section."
                                        : "This will unpublish the report and move it back to Generated Reports."}
                                </p>

                                <p className={styles.confirmIdentifier}>
                                    {confirmAction.audit.public_audit_id}
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() =>
                                    setConfirmAction(null)
                                }
                                className={styles.cancelButton}
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
                                className={`${styles.confirmButton} ${
                                    confirmAction.published
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "bg-red-600 text-white hover:bg-red-700"
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