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
import {
    breachApi,
    getDataBreachChecklistReport,
} from "../../../utilities/breachApi";

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
            return "border-red-200 bg-red-50 text-red-700";
        case "HIGH":
            return "border-orange-200 bg-orange-50 text-orange-700";
        case "MEDIUM":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "LOW":
            return "border-sky-200 bg-sky-50 text-sky-700";
        default:
            return "border-slate-200 bg-slate-100 text-slate-500";
    }
};

const assessmentStyle = (assessment = "") => {
    switch (String(assessment).toUpperCase()) {
        case "PASS":
            return {
                icon: CheckCircle2,
                text: "Passed",
                className: "text-emerald-700",
            };
        case "PARTIAL":
        case "WARNING":
            return {
                icon: AlertTriangle,
                text: "Needs attention",
                className: "text-amber-700",
            };
        case "FAIL":
            return {
                icon: XCircle,
                text: "Not passed",
                className: "text-red-700",
            };
        default:
            return {
                icon: Info,
                text: titleCase(assessment || "Not assessed"),
                className: "text-slate-500",
            };
    }
};

function MetricCard({ label, value, helper }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#14213D]">{value}</p>
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
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h4 className="font-semibold text-slate-800">
                        {titleCase(scanner.scanner)}
                    </h4>
                    <div className={`mt-2 flex items-center gap-2 text-sm ${assessment.className}`}>
                        <AssessmentIcon size={16} />
                        {assessment.text}
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-[#14213D]">
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
                            className="rounded-lg border border-slate-200 bg-[#F4F7FB] p-3"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-700">
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
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {issue.description}
                                </p>
                            )}

                            {issue.recommendation && (
                                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#075EB5]">
                                        Recommended action
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {issue.recommendation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                    No issues were reported by this check.
                </p>
            )}
        </article>
    );
}

const checklistStatusStyle = (status = "") => {
    switch (String(status).toUpperCase()) {
        case "COMPLIANT":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "NON_COMPLIANT":
            return "border-red-200 bg-red-50 text-red-700";
        case "PARTIALLY_COMPLIANT":
            return "border-amber-200 bg-amber-50 text-amber-700";
        case "REVIEW":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "NOT_APPLICABLE":
            return "border-violet-200 bg-violet-50 text-violet-700";
        case "NOT_EVALUATED":
        default:
            return "border-slate-200 bg-slate-100 text-slate-500";
    }
};

function ChecklistMetric({ label, value, colorClass = "text-[#14213D]" }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>
                {value ?? 0}
            </p>
        </div>
    );
}

export default function SelfCheckDataBreachResult() {
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
        setChecklistError("");
        setLoading(true);
        setChecklistLoading(true);

        // Load technical scan results and checklist assessment independently.
        // A failure in one endpoint must not prevent the other section loading.
        const technicalRequest = (async () => {
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
            }
        })();

        const checklistRequest = (async () => {
            try {
                const data = await getDataBreachChecklistReport(publicAuditId);
                setChecklistReport(data);
            } catch (err) {
                console.error("Checklist Report Error:", err);
                setChecklistError(
                    err?.message || "Unable to load the checklist assessment."
                );
                setChecklistReport(null);
            } finally {
                setChecklistLoading(false);
            }
        })();

        await Promise.all([technicalRequest, checklistRequest]);
        setRefreshing(false);
    };

    useEffect(() => {
        if (!publicAuditId) return;

        loadResult();
        // The result page is opened for completed scans; refresh is manual.
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

    // Do not display checklist questions that have not been evaluated.
    const evaluatedChecklistItems = checklistItems.filter((item) => {
        const checklist = item?.checklist || item || {};
        return String(checklist.status || "NOT_EVALUATED").toUpperCase() !== "NOT_EVALUATED";
    });

    const piiSummary = useMemo(() => {
        if (scan.pii_detected === true) {
            return {
                title: "Potential personal information was detected",
                description:
                    "The scan found patterns that may represent personal information. Please review the indicators below and confirm them manually.",
                className: "border-amber-200 bg-amber-50 text-amber-800",
                icon: AlertTriangle,
            };
        }

        return {
            title: "No personal information patterns were detected",
            description:
                "The scan did not identify personal information patterns on the pages it checked. This does not guarantee that the website contains no personal information.",
            className: "border-sky-200/60 bg-sky-50 text-sky-800",
            icon: Info,
        };
    }, [scan.pii_detected]);

    const PiiIcon = piiSummary.icon;

    return (
        <div className="min-h-screen bg-[#F4F7FB] px-4 py-6 text-slate-700 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
                <button
                    type="button"
                    onClick={() => navigate("/user/self-check/breach-scans")}
                    className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#075EB5] transition hover:text-[#064D94]"
                >
                    <ArrowLeft size={17} />
                    Back to My Scans
                </button>

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-emerald-700">
                            <CheckCircle2 size={17} />
                            Scan completed
                        </div>
                        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                            PII-in-Transit Scanner Scan Result
                        </h1>
                        <p className="mt-2 break-all text-sm text-slate-500">
                            {publicAuditId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadResult(true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#075EB5] disabled:opacity-60"
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
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-12 text-slate-500">
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
                                                    className="rounded-full border border-current/20 bg-white/70 px-3 py-1 text-xs"
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
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
                                    <div>
                                        <h2 className="font-semibold text-[#14213D]">
                                            1. Checklist-Based Assessment
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Compliance checklist results and recommendations.
                                        </p>
                                    </div>
                                    <ChevronDown size={19} className="shrink-0 text-slate-500" />
                                </summary>

                                <div className="border-t border-slate-200 p-5">
                                    {checklistLoading ? (
                                        <div className="flex items-center gap-3 py-8 text-sm text-slate-500">
                                            <RefreshCw size={17} className="animate-spin" />
                                            Loading checklist assessment...
                                        </div>
                                    ) : checklistError ? (
                                        <div
                                            role="alert"
                                            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                        >
                                            {checklistError}
                                        </div>
                                    ) : checklistReport ? (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                                <ChecklistMetric label="Total" value={checklistSummary.total} />
                                                <ChecklistMetric
                                                    label="Compliant"
                                                    value={checklistSummary.COMPLIANT}
                                                    colorClass="text-emerald-700"
                                                />
                                                <ChecklistMetric
                                                    label="Non-compliant"
                                                    value={checklistSummary.NON_COMPLIANT}
                                                    colorClass="text-red-700"
                                                />
                                                <ChecklistMetric
                                                    label="Partially compliant"
                                                    value={checklistSummary.PARTIALLY_COMPLIANT}
                                                    colorClass="text-amber-700"
                                                />
                                                <ChecklistMetric
                                                    label="Review"
                                                    value={checklistSummary.REVIEW}
                                                    colorClass="text-blue-700"
                                                />
                                            </div>

                                            {(checklistSummary.NOT_APPLICABLE ?? 0) > 0 && (
                                                <p className="text-xs text-slate-500">
                                                    Not applicable: {checklistSummary.NOT_APPLICABLE}
                                                </p>
                                            )}

                                            {evaluatedChecklistItems.length > 0 ? (
                                                <div className="space-y-3">
                                                    {evaluatedChecklistItems.map((item, index) => {
                                                        const checklist = item?.checklist || item || {};
                                                        const status = String(checklist.status || "NOT_EVALUATED").toUpperCase();

                                                        return (
                                                            <article
                                                                key={checklist.id ?? checklist.code ?? index}
                                                                className="rounded-lg border border-slate-200 bg-white p-4"
                                                            >
                                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-[#14213D]">
                                                                            {checklist.code || `Checklist ${index + 1}`}
                                                                        </p>
                                                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                            {checklist.description || "No description available."}
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${checklistStatusStyle(status)}`}
                                                                    >
                                                                        {titleCase(status)}
                                                                    </span>
                                                                </div>

                                                                {checklist.comment && (
                                                                    <div className="mt-3 rounded-md bg-[#F4F7FB] p-3">
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                            Assessment comment
                                                                        </p>
                                                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                                                                            {checklist.comment}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                                                    {checklist.clause && <span>Clause: {checklist.clause}</span>}
                                                                    {checklist.version && <span>Version: {checklist.version}</span>}
                                                                </div>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
No evaluated checklist questions are available for this audit.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            Checklist assessment is not available.
                                        </p>
                                    )}
                                </div>
                            </details>

                            <details
                                open
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
                                    <div>
                                        <h2 className="font-semibold text-[#14213D]">
                                            2. Technical Scan Results
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Website security checks and technical findings.
                                        </p>
                                    </div>
                                    <ChevronDown size={19} className="shrink-0 text-slate-500" />
                                </summary>

                                <div className="space-y-6 border-t border-slate-200 p-5">
                                    <div>
                                        <h3 className="mb-3 font-semibold text-slate-700">
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
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                            <p className="font-medium text-amber-800">
                                                Security checks were not run
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-amber-800">
                                                The initial scan did not detect personal information
                                                patterns, so the additional website security checks
                                                were skipped according to the scan settings.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="mb-3 font-semibold text-slate-700">
                                            Findings by severity
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                            {["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map((level) => (
                                                <div
                                                    key={level}
                                                    className="rounded-lg border border-slate-200 bg-white p-3"
                                                >
                                                    <p className="text-xs text-slate-500">
                                                        {titleCase(level)}
                                                    </p>
                                                    <p className="mt-1 text-xl font-semibold text-slate-800">
                                                        {severityCounts[level] ?? 0}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {scanners.length > 0 ? (
                                        <div>
                                            <h3 className="mb-3 font-semibold text-slate-700">
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
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                                            <p className="font-medium text-slate-700">
                                                No additional security checks were performed
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                The scanner did not identify personal information
                                                patterns during its initial check. As a result, the
                                                additional security checks were skipped.
                                            </p>
                                        </div>
                                    )}

                                    {skippedScanners.length > 0 && (
                                        <div>
                                            <h3 className="mb-2 font-semibold text-slate-700">
                                                Checks not performed
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skippedScanners.map((scanner) => (
                                                    <span
                                                        key={scanner}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"
                                                    >
                                                        {titleCase(scanner)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Scan started</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatDate(result.started_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Scan completed</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatDate(result.completed_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Execution mode</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {titleCase(result.execution_mode || "Not available")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>

                        {result.error_message && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
