import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Globe,
    Clock3,
    RefreshCw,
    ChevronDown,
} from "lucide-react";
import { breachApi, getDataBreachChecklistReport } from "../utilities/breachApi";


const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleString();
};

const titleCase = (value = "") =>
    String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());

const severityClass = (severity = "") => {
    switch (String(severity).toUpperCase()) {
        case "CRITICAL":
            return "border-red-700 bg-red-950/40 text-red-300";
        case "HIGH":
            return "border-orange-700 bg-orange-950/40 text-orange-300";
        case "MEDIUM":
            return "border-amber-700 bg-amber-950/40 text-amber-300";
        case "LOW":
            return "border-sky-700 bg-sky-950/40 text-sky-300";
        default:
            return "border-slate-700 bg-slate-800 text-slate-300";
    }
};

const assessmentStyle = (assessment = "") => {
    switch (String(assessment).toUpperCase()) {
        case "PASS":
            return {
                icon: CheckCircle2,
                text: "Passed",
                className: "text-emerald-300",
            };
        case "PARTIAL":
        case "WARNING":
            return {
                icon: AlertTriangle,
                text: "Needs attention",
                className: "text-amber-300",
            };
        case "FAIL":
            return {
                icon: XCircle,
                text: "Not passed",
                className: "text-red-300",
            };
        default:
            return {
                icon: Info,
                text: titleCase(assessment || "Not assessed"),
                className: "text-slate-300",
            };
    }
};

const checklistStatusStyle = (status = "") => {
    switch (String(status).toUpperCase()) {
        case "COMPLIANT":
            return "border-emerald-700 bg-emerald-950/30 text-emerald-300";
        case "NON_COMPLIANT":
            return "border-red-700 bg-red-950/30 text-red-300";
        case "PARTIALLY_COMPLIANT":
            return "border-amber-700 bg-amber-950/30 text-amber-300";
        case "REVIEW":
            return "border-blue-700 bg-blue-950/30 text-blue-300";
        case "NOT_APPLICABLE":
            return "border-violet-700 bg-violet-950/30 text-violet-300";
        case "NOT_EVALUATED":
        default:
            return "border-slate-600 bg-slate-800 text-slate-300";
    }
};

const checklistStatusLabel = (status = "") => {
    const labels = {
        COMPLIANT: "Compliant",
        NON_COMPLIANT: "Non-Compliant",
        PARTIALLY_COMPLIANT: "Partially Compliant",
        REVIEW: "Review",
        NOT_EVALUATED: "Not Evaluated",
        NOT_APPLICABLE: "Not Applicable",
    };

    return labels[String(status).toUpperCase()] || titleCase(status || "Unknown");
};

function ChecklistMetric({ label, value, className }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#070d1d] px-3 py-2.5">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
                {label}
            </span>
            <span className="text-sm font-semibold text-white">{value ?? 0}</span>
        </div>
    );
}

function MetricCard({ label, value, helper }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#0b1324] p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
    );
}

function ScannerResult({ scanner }) {
    const assessment = assessmentStyle(
        scanner.assessment || scanner.status
    );
    const AssessmentIcon = assessment.icon;
    const issues = Array.isArray(scanner.issues) ? scanner.issues : [];

    return (
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h4 className="font-semibold text-slate-100">
                        {titleCase(scanner.scanner)}
                    </h4>
                    <div className={`mt-2 flex items-center gap-2 text-sm ${assessment.className}`}>
                        <AssessmentIcon size={16} />
                        {assessment.text}
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-white">
                        {scanner.score ?? "—"}
                        <span className="text-sm font-normal text-slate-500">
                            {" "}/ {scanner.max_score ?? "—"}
                        </span>
                    </p>
                    <p className="text-xs text-slate-500">Assessment score</p>
                </div>
            </div>

            {issues.length > 0 ? (
                <div className="mt-4 space-y-3">
                    {issues.map((issue, index) => (
                        <div
                            key={`${issue.title || "issue"}-${index}`}
                            className="rounded-lg border border-slate-800 bg-[#070d1d] p-3"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-200">
                                    {issue.title || "Finding"}
                                </p>
                                {issue.severity && (
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] ${severityClass(issue.severity)}`}
                                    >
                                        {titleCase(issue.severity)}
                                    </span>
                                )}
                            </div>

                            {issue.description && (
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {issue.description}
                                </p>
                            )}

                            {issue.recommendation && (
                                <div className="mt-3 rounded-lg bg-indigo-500/5 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                                        Recommended action
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-300">
                                        {issue.recommendation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 rounded-lg bg-emerald-500/5 p-3 text-sm text-emerald-200">
                    No issues were reported by this check.
                </p>
            )}
        </article>
    );
}

export default function DataBreachScannerResult() {
    const navigate = useNavigate();
    const { publicAuditId } = useParams();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [checklistReport, setChecklistReport] = useState(null);
    const [checklistLoading, setChecklistLoading] = useState(true);
    const [checklistError, setChecklistError] = useState("");
    const loadResult = async (manual = false) => {
        if (manual) setRefreshing(true);
        setError("");

        try {
            const response = await breachApi(
                `/api/scanner/webscan/${encodeURIComponent(publicAuditId)}/`,
                { method: "GET" }
            );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    response?.error_message ||
                    "Unable to retrieve the scan result."
                );
            }

            setResult(response);
        } catch (err) {
            setError(err?.message || "Unable to load the scan result.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const loadChecklist = async () => {
        if (!publicAuditId) return;

        try {
            setChecklistLoading(true);
            setChecklistError("");

            const checklistData =
                await getDataBreachChecklistReport(publicAuditId);

            setChecklistReport(checklistData);
            console.log("BREACH CHECKLIST REPORT:", checklistData);
        } catch (err) {
            console.error("Checklist Report Error:", err);
            setChecklistError(
                err?.message || "Unable to load the checklist assessment."
            );
            setChecklistReport(null);
        } finally {
            setChecklistLoading(false);
        }
    };

    const refreshAllResults = async () => {
        await Promise.all([loadResult(true), loadChecklist()]);
    };

    useEffect(() => {
        if (!publicAuditId) return;

        loadResult();
        loadChecklist();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicAuditId]);

    const scan = result?.scan || {};
    const executionGate = result?.execution_gate || {};
    const summary = result?.summary || {};
    const severityCounts = summary.severity_counts || {};
    const scanners = Array.isArray(result?.scanners) ? result.scanners : [];
    const indicators = Array.isArray(scan.personal_data_indicators)
        ? scan.personal_data_indicators
        : [];
    const skippedScanners = Array.isArray(summary.skipped_scanners)
        ? summary.skipped_scanners
        : [];

    const checklistSummary = checklistReport?.summary || {};
    const checklistItems = Array.isArray(checklistReport?.checklists)
        ? checklistReport.checklists
        : [];
    const checklistAudit = checklistReport?.audit || {};
    const checklistTotal =
        checklistSummary.total ?? checklistItems.length;

    const piiSummary = useMemo(() => {
        if (scan.pii_detected === true) {
            return {
                title: "Potential personal information was detected",
                description:
                    "The scan found patterns that may represent personal information. Please review the indicators below and confirm them manually.",
                className: "border-amber-700/60 bg-amber-950/20 text-amber-200",
                icon: AlertTriangle,
            };
        }

        return {
            title: "No personal information patterns were detected",
            description:
                "The scan did not identify personal information patterns on the pages it checked. This does not guarantee that the website contains no personal information.",
            className: "border-sky-700/60 bg-sky-950/20 text-sky-200",
            icon: Info,
        };
    }, [scan.pii_detected]);

    const PiiIcon = piiSummary.icon;

    return (
        <div className="min-h-screen bg-[#070d1d] px-4 py-8 text-white">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => navigate("/auditor/databreachscanner/")}
                    className="mb-7 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                    <ArrowLeft size={17} />
                    Back to Data Breach Scanner
                </button>

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-emerald-300">
                            <CheckCircle2 size={17} />
                            Scan completed
                        </div>
                        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                            Data Breach Scan Result
                        </h1>
                        <p className="mt-2 break-all text-sm text-slate-400">
                            {publicAuditId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={refreshAllResults}
                        disabled={refreshing || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0b1324] px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh Result
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0b1324] p-12 text-slate-400">
                        <RefreshCw size={19} className="animate-spin" />
                        Loading scan result...
                    </div>
                ) : result ? (
                    <>
                        <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                label="Website"
                                value={
                                    <span className="break-all text-base">
                                        {result.target_url || "Not available"}
                                    </span>
                                }
                            />
                            <MetricCard
                                label="Pages / security checks"
                                value={summary.scanners_run ?? 0}
                                helper="Security checks completed"
                            />
                            <MetricCard
                                label="Findings"
                                value={summary.findings_count ?? 0}
                                helper="Items that may need attention"
                            />
                            <MetricCard
                                label="PII confidence"
                                value={titleCase(scan.pii_confidence || "Unknown")}
                                helper={
                                    scan.manual_confirmation_required
                                        ? "Manual confirmation is recommended"
                                        : "No manual confirmation flagged"
                                }
                            />
                        </section>

                        <section className={`mb-7 rounded-xl border p-5 ${piiSummary.className}`}>
                            <div className="flex items-start gap-3">
                                <PiiIcon size={21} className="mt-0.5 shrink-0" />
                                <div>
                                    <h2 className="font-semibold">
                                        {piiSummary.title}
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 opacity-90">
                                        {piiSummary.description}
                                    </p>
                                    {indicators.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {indicators.map((indicator) => (
                                                <span
                                                    key={indicator}
                                                    className="rounded-full border border-current/20 bg-black/10 px-3 py-1 text-xs"
                                                >
                                                    {titleCase(indicator)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="space-y-4">
                            <details
                                open
                                className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
                                    <div>
                                        <h2 className="font-semibold text-white">
                                            1. Checklist-Based Assessment
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Compliance checklist results and recommendations.
                                        </p>
                                    </div>
                                    <ChevronDown size={19} className="shrink-0 text-slate-400" />
                                </summary>

                                <div className="border-t border-slate-800 p-5">
                                    {checklistLoading ? (
                                        <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-400">
                                            <RefreshCw size={17} className="animate-spin" />
                                            Loading checklist assessment...
                                        </div>
                                    ) : checklistError ? (
                                        <div className="rounded-lg border border-red-800 bg-red-950/20 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={19} className="mt-0.5 shrink-0 text-red-300" />
                                                <div>
                                                    <h3 className="font-medium text-red-200">
                                                        Unable to load checklist assessment
                                                    </h3>
                                                    <p className="mt-1 text-sm leading-6 text-red-200/80">
                                                        {checklistError}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : checklistReport ? (
                                        <div className="space-y-5">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-200">
                                                        Total checklist items:{" "}
                                                        <strong>{checklistTotal}</strong>
                                                    </p>
                                                    <p className="mt-1 break-all text-xs text-slate-500">
                                                        Assessment ID: {checklistAudit.public_audit_id || publicAuditId}
                                                    </p>
                                                    {checklistAudit.target_url && (
                                                        <p className="mt-1 break-all text-xs text-slate-500">
                                                            Target: {checklistAudit.target_url}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                    <ChecklistMetric
                                                        label="Compliant"
                                                        value={checklistSummary.COMPLIANT}
                                                        className="border-emerald-700 bg-emerald-950/30 text-emerald-300"
                                                    />
                                                    <ChecklistMetric
                                                        label="Non-Compliant"
                                                        value={checklistSummary.NON_COMPLIANT}
                                                        className="border-red-700 bg-red-950/30 text-red-300"
                                                    />
                                                    <ChecklistMetric
                                                        label="Partially Compliant"
                                                        value={checklistSummary.PARTIALLY_COMPLIANT}
                                                        className="border-amber-700 bg-amber-950/30 text-amber-300"
                                                    />
                                                    <ChecklistMetric
                                                        label="Review"
                                                        value={checklistSummary.REVIEW}
                                                        className="border-blue-700 bg-blue-950/30 text-blue-300"
                                                    />
                                                    <ChecklistMetric
                                                        label="Not Evaluated"
                                                        value={checklistSummary.NOT_EVALUATED}
                                                        className="border-slate-600 bg-slate-800 text-slate-300"
                                                    />
                                                    <ChecklistMetric
                                                        label="Not Applicable"
                                                        value={checklistSummary.NOT_APPLICABLE}
                                                        className="border-violet-700 bg-violet-950/30 text-violet-300"
                                                    />
                                                </div>
                                            </div>

                                            {checklistItems.length > 0 ? (
                                                <div className="space-y-3">
                                                    {checklistItems.map((item, index) => {
                                                        const checklist = item?.checklist || {};
                                                        const status = String(checklist.status || "NOT_EVALUATED").toUpperCase();

                                                        return (
                                                            <article
                                                                key={checklist.id ?? checklist.code ?? index}
                                                                className="rounded-xl border border-slate-800 bg-[#070d1d] p-4 sm:p-5"
                                                            >
                                                                <div className="flex flex-col gap-3">
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-800 px-2 text-xs font-semibold text-slate-200">
                                                                            {checklist.code || index + 1}
                                                                        </span>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-medium leading-6 text-slate-100">
                                                                                {checklist.description || "Checklist description not available."}
                                                                            </p>
                                                                            <div className="mt-2">
                                                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${checklistStatusStyle(status)}`}>
                                                                                    {checklistStatusLabel(status)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {checklist.comment && (
                                                                        <div className="ml-0 rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:ml-10">
                                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                                                Assessment Comment
                                                                            </p>
                                                                            <p className="mt-1 text-sm leading-6 text-slate-200">
                                                                                {checklist.comment}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <div className="ml-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 sm:ml-10">
                                                                        {checklist.clause && (
                                                                            <span>Clause: {checklist.clause}</span>
                                                                        )}
                                                                        {checklist.version && (
                                                                            <span>Version: {checklist.version}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">
                                                    No checklist items were returned for this assessment.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">
                                            Checklist assessment is not available for this scan.
                                        </div>
                                    )}
                                </div>
                            </details>

                            <details
                                open
                                className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
                                    <div>
                                        <h2 className="font-semibold text-white">
                                            2. Technical Scan Results
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Website security checks and technical findings.
                                        </p>
                                    </div>
                                    <ChevronDown size={19} className="shrink-0 text-slate-400" />
                                </summary>

                                <div className="space-y-6 border-t border-slate-800 p-5">
                                    <div>
                                        <h3 className="mb-3 font-semibold text-slate-200">
                                            Scan overview
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <MetricCard
                                                label="Security checks run"
                                                value={summary.scanners_run ?? 0}
                                            />
                                            <MetricCard
                                                label="Total findings"
                                                value={summary.findings_count ?? 0}
                                            />
                                            <MetricCard
                                                label="Security checks executed"
                                                value={executionGate.security_scans_run ? "Yes" : "No"}
                                            />
                                            <MetricCard
                                                label="Execution decision"
                                                value={titleCase(executionGate.decision || "Unknown")}
                                                helper={titleCase(executionGate.reason || "")}
                                            />
                                        </div>
                                    </div>

                                    {!executionGate.security_scans_run && (
                                        <div className="rounded-lg border border-amber-700/60 bg-amber-950/20 p-4">
                                            <p className="font-medium text-amber-200">
                                                Security checks were not run
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-amber-100/80">
                                                The initial scan did not detect personal information
                                                patterns, so the additional website security checks
                                                were skipped according to the scan settings.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="mb-3 font-semibold text-slate-200">
                                            Findings by severity
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                            {["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map((level) => (
                                                <div
                                                    key={level}
                                                    className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                                                >
                                                    <p className="text-xs text-slate-500">
                                                        {titleCase(level)}
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold text-slate-100">
                                                        {severityCounts[level] ?? 0}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {scanners.length > 0 ? (
                                        <div>
                                            <h3 className="mb-3 font-semibold text-slate-200">
                                                Individual security checks
                                            </h3>
                                            <div className="space-y-3">
                                                {scanners.map((scanner, index) => (
                                                    <ScannerResult
                                                        key={`${scanner.scanner || "scanner"}-${index}`}
                                                        scanner={scanner}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
                                            <p className="font-medium text-slate-200">
                                                No additional security checks were performed
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-400">
                                                The scanner did not identify personal information
                                                patterns during its initial check. As a result, the
                                                additional security checks were skipped.
                                            </p>
                                        </div>
                                    )}

                                    {skippedScanners.length > 0 && (
                                        <div>
                                            <h3 className="mb-2 font-semibold text-slate-200">
                                                Checks not performed
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skippedScanners.map((scanner) => (
                                                    <span
                                                        key={scanner}
                                                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300"
                                                    >
                                                        {titleCase(scanner)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Scan started</p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                {formatDate(result.started_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Scan completed</p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                {formatDate(result.completed_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Execution mode</p>
                                            <p className="mt-1 text-sm text-slate-300">
                                                {titleCase(result.execution_mode || "Not available")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {result.error_message && (
                            <div className="mt-6 rounded-xl border border-red-800 bg-red-950/20 p-4 text-sm text-red-200">
                                {result.error_message}
                            </div>
                        )}

                        <div className="mt-7 flex items-center gap-2 text-xs text-slate-500">
                            <Globe size={14} />
                            <span>Result for {result.target_url || "the submitted website"}</span>
                            <span className="mx-1">·</span>
                            <Clock3 size={14} />
                            <span>Completed {formatDate(result.completed_at)}</span>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
