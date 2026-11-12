import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Globe,
    Clock3,
    LoaderCircle,
    RefreshCw,
    CircleCheck,
    CircleX,
    AlertTriangle,
    ClipboardCheck,
    FileSearch,
    ChevronDown,
} from "lucide-react";

import {
    getCompleteConsentScanResult,
    getConsentChecklistAssessment,
} from "./selfCheckConsentApi";


const normalizeStatus = (value) =>
    String(value || "UNKNOWN").trim().toUpperCase();


const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleString();
};


const formatStatus = (status) =>
    String(status || "UNKNOWN").replaceAll("_", " ");


const getStatusStyle = (status) => {
    const value = normalizeStatus(status);

    switch (value) {
        case "COMPLIANT":
        case "COMPLETED":
        case "SUCCESS":
        case "PASS":
            return "border-emerald-700 bg-emerald-950/40 text-emerald-300";

        case "PARTIALLY_COMPLIANT":
        case "NEED_REVIEW":
        case "WARNING":
            return "border-amber-700 bg-amber-950/40 text-amber-300";

        case "NON_COMPLIANT":
        case "FAILED":
        case "ERROR":
        case "FAIL":
            return "border-red-700 bg-red-950/40 text-red-300";

        case "NOT_APPLICABLE":
            return "border-blue-700 bg-blue-950/40 text-blue-300";

        default:
            return "border-slate-700 bg-slate-900 text-slate-300";
    }
};


const getChecklistItems = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data?.results)) return data.data.results;

    return [];
};


const getTechnicalSteps = (data) => {
    const raw =
        data?.steps ??
        data?.step_results ??
        data?.results ??
        [];

    if (Array.isArray(raw)) return raw;

    if (raw && typeof raw === "object") {
        return Object.entries(raw).map(([step_id, value]) => ({
            step_id,
            ...(typeof value === "object" && value !== null
                ? value
                : { status: value, result: {} }),
        }));
    }

    return [];
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
    step?.result?.step_04?.title ||
    step?.title ||
    STEP_TITLES[String(step?.step_id || "").toUpperCase()] ||
    step?.step_id ||
    `Step ${index + 1}`;


const getStepStatusIcon = (status) => {
    const value = normalizeStatus(status);

    if (["COMPLETED", "SUCCESS"].includes(value)) {
        return <CircleCheck size={19} className="text-emerald-400" />;
    }

    if (["FAILED", "ERROR"].includes(value)) {
        return <CircleX size={19} className="text-red-400" />;
    }

    if (["RUNNING", "IN_PROGRESS"].includes(value)) {
        return <LoaderCircle size={19} className="animate-spin text-blue-400" />;
    }

    return <Clock3 size={19} className="text-slate-500" />;
};


function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(status)}`}
        >
            {formatStatus(status)}
        </span>
    );
}


function SummaryCard({ title, count, color }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#0b1324] p-4">
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`mt-2 text-2xl font-semibold ${color}`}>
                {count}
            </p>
        </div>
    );
}


function ChecklistAssessment({ data, error, loading }) {
    const items = useMemo(() => getChecklistItems(data), [data]);

    // Do not display checklist questions that have not been evaluated.
    const evaluatedItems = useMemo(
        () => items.filter(
            (item) => normalizeStatus(item.status) !== "NOT_EVALUATED"
        ),
        [items]
    );

    const counts = useMemo(() => {
        const summary = {
            COMPLIANT: 0,
            PARTIALLY_COMPLIANT: 0,
            NON_COMPLIANT: 0,
            NOT_APPLICABLE: 0,
            OTHER: 0,
        };

        evaluatedItems.forEach((item) => {
            const status = normalizeStatus(item.status);

            if (Object.prototype.hasOwnProperty.call(summary, status)) {
                summary[status] += 1;
            } else {
                summary.OTHER += 1;
            }
        });

        return summary;
    }, [evaluatedItems]);

    return (
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">

            <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <ClipboardCheck size={21} className="text-indigo-400" />
                        Checklist Assessment
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Checklist-based DPDP compliance assessment.
                    </p>
                </div>

                {data && (
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                        {evaluatedItems.length} Evaluated Checklist Items
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-3 p-8 text-sm text-slate-400">
                    <LoaderCircle size={20} className="animate-spin" />
                    Loading checklist assessment...
                </div>
            ) : error ? (
                <div className="flex items-start gap-3 p-6 text-sm text-red-300">
                    <AlertTriangle size={20} />
                    <div>
                        <p className="font-medium">Unable to load checklist assessment.</p>
                        <p className="mt-1 text-red-300/80">{error}</p>
                    </div>
                </div>
            ) : !data ? (
                <p className="p-6 text-sm text-slate-400">
                    Checklist assessment is not available.
                </p>
            ) : (
                <div className="p-5">

                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <SummaryCard
                            title="Compliant"
                            count={counts.COMPLIANT}
                            color="text-emerald-400"
                        />

                        <SummaryCard
                            title="Partially Compliant"
                            count={counts.PARTIALLY_COMPLIANT}
                            color="text-amber-400"
                        />

                        <SummaryCard
                            title="Non-Compliant"
                            count={counts.NON_COMPLIANT}
                            color="text-red-400"
                        />

                         <SummaryCard
                            title="Not Applicable"
                            count={counts.NOT_APPLICABLE}
                            color="text-blue-400"
                        />

                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-medium text-slate-200">
                            Checklist Questions
                        </h3>

                        <span className="text-xs text-slate-500">
                            {evaluatedItems.length} Evaluated
                        </span>
                    </div>

                    {evaluatedItems.length === 0 ? (
                        <p className="rounded-lg border border-slate-800 p-6 text-sm text-slate-400">
                            No evaluated checklist questions are available.
                        </p>
                    ) : (
                        <div className="space-y-3">

                            {evaluatedItems.map((item, index) => (
                                <details
                                    key={`${index}-${item.question || "item"}`}
                                    className="group rounded-lg border border-slate-800 bg-slate-950/40"
                                >
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4">

                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="mt-0.5 text-xs font-semibold text-slate-500">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <p className="text-sm leading-6 text-slate-200">
                                                {item.question || item.title || "Checklist item"}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge status={item.status} />
                                            <ChevronDown
                                                size={16}
                                                className="text-slate-500 transition-transform group-open:rotate-180"
                                            />
                                        </div>

                                    </summary>

                                    <div className="border-t border-slate-800 px-4 py-4 pl-10">

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Assessment Comment
                                        </p>

                                        <p className="text-sm leading-6 text-slate-400">
                                            {item.comment || "No assessment comment available."}
                                        </p>

                                    </div>
                                </details>
                            ))}

                        </div>
                    )}

                </div>
            )}

        </section>
    );
}


const FRIENDLY_LABELS = {
    personal_data_collection_points: "Personal-data collection points",
    forms_with_personal_data_collection: "Forms collecting personal data",
    pages_with_personal_data_collection: "Pages with personal-data collection",
    tracking_collection_points: "Tracking-related collection points",
    user_journey_collection_points: "User journey collection points",
    cookies_with_personal_data_collection: "Cookies linked to personal data",
    scripts_with_personal_data_collection: "Scripts linked to personal data",
    storage_with_personal_data_collection: "Storage items linked to personal data",
    widgets_with_personal_data_collection: "Widgets collecting personal data",
    total_pii: "Personal-data instances assessed",
    notice_found: "Notices found",
    notice_not_found: "Instances without a detected notice",
    before: "Notice shown before collection",
    at: "Notice shown at collection",
    after: "Notice shown after collection",
    unknown: "Notice timing could not be established",
    total_forms: "Forms inspected",
    completed_forms: "Forms with evidence captured",
    failed_forms: "Forms where evidence capture failed",
    partial_forms: "Forms with partial evidence",
    total_evidence: "Evidence items",
    captured_evidence: "Evidence items captured",
    total_collection_points: "Collection points linked to forms",
    total_processing_activities: "Processing activities reviewed",
    consent_dependent: "Activities that may require consent",
    uncertain: "Activities requiring further review",
    necessary_service_processing: "Necessary-service activities identified",
    controls_found: "Consent controls found",
    preselected: "Pre-selected consent controls",
    not_preselected: "Controls not pre-selected",
    categories_found: "Preference categories found",
    selected_count: "Selected preference categories",
    unselected_count: "Unselected preference categories",
    interface_found: "Preference interface found",
    total: "Storage records inspected",
    found: "Records identified as personal-data related",
    personal_data_related: "Records related to personal data",
    consent_state: "Consent-state records",
    need_review: "Records requiring review",
    not_found: "Records not found",
    non_personal: "Records classified as non-personal",
};

const formatMetricLabel = (key) =>
    FRIENDLY_LABELS[key] ||
    String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (character) => character.toUpperCase());

const formatMetricValue = (value) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined || value === "") return "Not available";
    if (typeof value === "number") return value.toLocaleString();
    if (typeof value === "string") return value.replaceAll("_", " ").replaceAll("-", " ");
    return String(value);
};

const getStepPayload = (step) => {
    const result = step?.result || {};
    if (result.step_04 && typeof result.step_04 === "object") {
        return result.step_04;
    }
    return result;
};

const getStepSummary = (step) => {
    const payload = getStepPayload(step);
    if (payload.summary && typeof payload.summary === "object") return payload.summary;
    if (payload.result?.summary && typeof payload.result.summary === "object") {
        return payload.result.summary;
    }
    return {};
};

const getStepOutcome = (step, summary) => {
    const payload = getStepPayload(step);
    const rawStatus = normalizeStatus(payload.status || step.status);

    switch (rawStatus) {
        case "PERSONAL_DATA_FOUND":
            return { label: "Personal data identified", tone: "warning" };
        case "INSUFFICIENT_EVIDENCE":
            return { label: "More evidence required", tone: "warning" };
        case "NEED_REVIEW":
            return { label: "Manual review required", tone: "warning" };
        case "COMPLIANT":
            return { label: "Compliant", tone: "success" };
        case "PARTIALLY_COMPLIANT":
            return { label: "Partially compliant", tone: "warning" };
        case "NON_COMPLIANT":
            return { label: "Non-compliant", tone: "danger" };
        case "NOT_APPLICABLE":
            return { label: "Not applicable", tone: "info" };
        case "FAILED":
        case "ERROR":
            return { label: "Assessment failed", tone: "danger" };
        default:
            break;
    }

    if (step.step_id === "STEP-05" && (summary.uncertain || 0) > 0) {
        return { label: "Further review recommended", tone: "warning" };
    }

    if (step.step_id === "STEP-02") {
        if ((summary.notice_not_found || 0) > 0) {
            return { label: "Notice not detected for some collection points", tone: "warning" };
        }
        if ((summary.notice_found || 0) > 0) {
            return { label: "Notice evidence detected", tone: "success" };
        }
    }

    if (step.step_id === "STEP-07") {
        if ((summary.preselected || 0) > 0) {
            return { label: "Pre-selected controls detected", tone: "warning" };
        }
        if ((summary.controls_found || 0) === 0) {
            return { label: "No consent controls detected", tone: "neutral" };
        }
        return { label: "Consent controls inspected", tone: "success" };
    }

    if (step.step_id === "STEP-11") {
        return payload.result?.interface_found
            ? { label: "Preference interface detected", tone: "success" }
            : { label: "Preference interface not detected", tone: "warning" };
    }

    if (step.step_id === "STEP-13" && (summary.need_review || 0) > 0) {
        return { label: "Storage records need review", tone: "warning" };
    }

    return ["COMPLETED", "SUCCESS"].includes(normalizeStatus(step.status))
        ? { label: "Assessment completed", tone: "success" }
        : { label: formatStatus(step.status), tone: "neutral" };
};

const getOutcomeStyle = (tone) => {
    const styles = {
        success: "border-emerald-800 bg-emerald-950/40 text-emerald-300",
        warning: "border-amber-800 bg-amber-950/40 text-amber-300",
        danger: "border-red-800 bg-red-950/40 text-red-300",
        info: "border-blue-800 bg-blue-950/40 text-blue-300",
        neutral: "border-slate-700 bg-slate-900 text-slate-300",
    };
    return styles[tone] || styles.neutral;
};

const getStepMetrics = (step, summary) => {
    const metricKeysByStep = {
        "STEP-01": [
            "pages_with_personal_data_collection",
            "forms_with_personal_data_collection",
            "personal_data_collection_points",
            "tracking_collection_points",
        ],
        "STEP-02": ["total_pii", "notice_found", "notice_not_found", "before", "at", "after"],
        "STEP-04": [
            "total_forms",
            "completed_forms",
            "failed_forms",
            "partial_forms",
            "captured_evidence",
        ],
        "STEP-05": [
            "total_processing_activities",
            "consent_dependent",
            "uncertain",
            "necessary_service_processing",
        ],
        "STEP-07": ["controls_found", "preselected", "not_preselected", "unknown"],
        "STEP-11": ["categories_found", "selected_count", "unselected_count"],
        "STEP-13": ["total", "personal_data_related", "consent_state", "need_review", "non_personal"],
    };

    const preferredKeys = metricKeysByStep[step.step_id] || Object.keys(summary);
    return preferredKeys
        .filter((key) => summary[key] !== undefined && typeof summary[key] !== "object")
        .map((key) => ({ key, label: formatMetricLabel(key), value: summary[key] }));
};

const getStepNarrative = (step, summary) => {
    const payload = getStepPayload(step);

    switch (step.step_id) {
        case "STEP-01": {
            const points = summary.personal_data_collection_points || 0;
            const pages = summary.pages_with_personal_data_collection || 0;
            const forms = summary.forms_with_personal_data_collection || 0;
            const categories = Object.entries(summary.personal_data_categories || {})
                .map(([name, count]) => `${formatMetricLabel(name)} (${count})`);
            return [
                points > 0
                    ? `${points} personal-data collection point${points === 1 ? "" : "s"} identified across ${pages} page${pages === 1 ? "" : "s"}.`
                    : "No personal-data collection points were identified in the scanned evidence.",
                forms > 0 ? `${forms} form${forms === 1 ? "" : "s"} appear to collect personal data.` : null,
                categories.length ? `Data categories identified: ${categories.join(", ")}.` : null,
            ].filter(Boolean);
        }
        case "STEP-02": {
            const total = summary.total_pii || 0;
            const missing = summary.notice_not_found || 0;
            const found = summary.notice_found || 0;
            return [
                `${total} personal-data collection instance${total === 1 ? "" : "s"} were assessed for notice evidence.`,
                missing > 0
                    ? `A notice was not detected for ${missing} collection instance${missing === 1 ? "" : "s"}.`
                    : found > 0
                        ? `Notice evidence was detected for ${found} collection instance${found === 1 ? "" : "s"}.`
                        : "The scan could not establish notice availability or timing from the collected evidence.",
                "The scan checks observable website evidence; the legal adequacy of the notice requires review.",
            ];
        }
        case "STEP-04": {
            const forms = payload.forms || [];
            const errors = forms.flatMap((item) => item.errors || []);
            return [
                `${summary.total_forms || forms.length || 0} form${(summary.total_forms || forms.length || 0) === 1 ? "" : "s"} inspected.`,
                `${summary.captured_evidence || 0} visual evidence item${summary.captured_evidence === 1 ? "" : "s"} captured.`,
                (summary.failed_forms || 0) > 0
                    ? `${summary.failed_forms} form${summary.failed_forms === 1 ? "" : "s"} could not be fully documented.`
                    : "The form evidence capture completed without reported form failures.",
                errors.length ? "Some screenshots or visual evidence could not be captured; review the affected form details." : null,
            ].filter(Boolean);
        }
        case "STEP-05":
            return [
                `${summary.total_processing_activities || 0} processing activit${summary.total_processing_activities === 1 ? "y was" : "ies were"} reviewed.`,
                `${summary.consent_dependent || 0} activit${summary.consent_dependent === 1 ? "y may" : "ies may"} depend on consent.`,
                `${summary.uncertain || 0} activit${summary.uncertain === 1 ? "y requires" : "ies require"} further review because the available website evidence is inconclusive.`,
            ];
        case "STEP-07":
            return [
                `${summary.controls_found || 0} consent control${summary.controls_found === 1 ? "" : "s"} detected.`,
                (summary.preselected || 0) > 0
                    ? `${summary.preselected} control${summary.preselected === 1 ? " was" : "s were"} already selected when detected.`
                    : "No pre-selected consent controls were identified.",
                "A zero count means no matching controls were detected during this scan; it does not prove that no such controls exist elsewhere.",
            ];
        case "STEP-11": {
            const found = Boolean(payload.result?.interface_found);
            return [
                found
                    ? "A preference-management interface was detected."
                    : "A preference-management interface was not detected in the scanned pages.",
                `${summary.categories_found || 0} preference categor${summary.categories_found === 1 ? "y" : "ies"} identified.`,
            ];
        }
        case "STEP-13":
            return [
                `${summary.total || 0} cookie and browser-storage record${summary.total === 1 ? "" : "s"} inspected.`,
                `${summary.need_review || 0} record${summary.need_review === 1 ? "" : "s"} need manual review because their purpose or relationship to personal data could not be confirmed automatically.`,
                `${summary.personal_data_related || 0} record${summary.personal_data_related === 1 ? "" : "s"} were identified as personal-data related.`,
            ];
        default:
            return Object.entries(summary)
                .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
                .slice(0, 8)
                .map(([key, value]) => `${formatMetricLabel(key)}: ${formatMetricValue(value)}.`);
    }
};

function MetricTile({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-800 bg-[#0b1324] p-3">
            <p className="text-xs leading-5 text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">
                {formatMetricValue(value)}
            </p>
        </div>
    );
}

function TechnicalAssessment({ data, error, loading }) {
    const steps = useMemo(() => getTechnicalSteps(data), [data]);
    const audit = data?.audit || {};

    return (
        <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1324]">
            <div className="border-b border-slate-800 px-5 py-5">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <FileSearch size={21} className="text-indigo-400" />
                    Technical Assessment
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                    Website observations and findings presented in a readable format.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 p-8 text-sm text-slate-400">
                    <LoaderCircle size={20} className="animate-spin" />
                    Loading technical assessment...
                </div>
            ) : error ? (
                <div className="flex items-start gap-3 p-6 text-sm text-red-300">
                    <AlertTriangle size={20} />
                    <div>
                        <p className="font-medium">Unable to load technical assessment.</p>
                        <p className="mt-1 text-red-300/80">{error}</p>
                    </div>
                </div>
            ) : !data ? (
                <p className="p-6 text-sm text-slate-400">
                    Technical assessment is not available.
                </p>
            ) : (
                <div className="p-5">
                    <div className="mb-6 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                        <h3 className="mb-4 font-medium text-slate-200">Scan Information</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">Website</p>
                                <p className="mt-1 break-all text-sm text-slate-300">
                                    {audit.url || "Not available"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Scan Status</p>
                                <div className="mt-1"><StatusBadge status={audit.status} /></div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Started At</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(audit.started_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Completed At</p>
                                <p className="mt-1 text-sm text-slate-300">{formatDate(audit.completed_at)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-200">Technical Assessment Steps</h3>
                        <span className="text-xs text-slate-500">{steps.length} Steps</span>
                    </div>

                    {steps.length === 0 ? (
                        <p className="rounded-lg border border-slate-800 p-6 text-sm text-slate-400">
                            No technical steps were returned by the scanner.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {steps.map((step, index) => {
                                const payload = getStepPayload(step);
                                const summary = getStepSummary(step);
                                const metrics = getStepMetrics(step, summary);
                                const narrative = getStepNarrative(step, summary);
                                const outcome = getStepOutcome(step, summary);
                                const forms = payload.forms || [];

                                return (
                                    <details
                                        key={step.step_id || index}
                                        className="group rounded-lg border border-slate-800 bg-slate-950/40"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                {getStepStatusIcon(step.status)}
                                                <div className="min-w-0">
                                                    <p className="wrap-break-word text-sm font-medium text-slate-200">
                                                        {getStepTitle(step, index)}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Assessment {index + 1}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getOutcomeStyle(outcome.tone)}`}>
                                                    {outcome.label}
                                                </span>
                                                <ChevronDown size={16} className="text-slate-500 transition-transform group-open:rotate-180" />
                                            </div>
                                        </summary>

                                        <div className="border-t border-slate-800 p-4">
                                            {metrics.length > 0 && (
                                                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                                                    {metrics.map((metric) => (
                                                        <MetricTile
                                                            key={metric.key}
                                                            label={metric.label}
                                                            value={metric.value}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="rounded-lg border border-slate-800 bg-[#0b1324] p-4">
                                                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    What the scanner found
                                                </h4>
                                                <ul className="space-y-2">
                                                    {narrative.map((line, lineIndex) => (
                                                        <li key={lineIndex} className="flex gap-2 text-sm leading-6 text-slate-300">
                                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                                                            <span>{line}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {step.step_id === "STEP-04" && forms.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Forms inspected
                                                    </h4>
                                                    {forms.map((formItem, formIndex) => (
                                                        <div key={`${formItem.form?.id || "form"}-${formIndex}`} className="rounded-lg border border-slate-800 p-3">
                                                            <p className="text-sm font-medium text-slate-200">
                                                                {formItem.form?.name || formItem.form?.id || `Form ${formIndex + 1}`}
                                                            </p>
                                                            <p className="mt-1 break-all text-xs text-slate-500">
                                                                {formItem.page_url || formItem.form?.action || "Page address not available"}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <StatusBadge status={formItem.status || "UNKNOWN"} />
                                                                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
                                                                    {formItem.collection_points_count || 0} collection points
                                                                </span>
                                                            </div>
                                                            {(formItem.errors || []).length > 0 && (
                                                                <p className="mt-3 text-xs leading-5 text-amber-300">
                                                                    Visual evidence could not be fully captured for this form.
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {step.step_id === "STEP-13" && Array.isArray(payload.records) && payload.records.length > 0 && (
                                                <div className="mt-4 rounded-lg border border-slate-800 p-3">
                                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Sample records requiring review
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {payload.records.slice(0, 5).map((record, recordIndex) => (
                                                            <div key={`${record.name || "record"}-${recordIndex}`} className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                                                                <div>
                                                                    <p className="text-sm text-slate-200">{record.name || "Unnamed record"}</p>
                                                                    <p className="text-xs text-slate-500">{formatMetricLabel(record.type || "storage item")}</p>
                                                                </div>
                                                                <StatusBadge status={record.result || "NEED_REVIEW"} />
                                                            </div>
                                                        ))}
                                                        {payload.records.length > 5 && (
                                                            <p className="pt-1 text-xs text-slate-500">
                                                                Showing 5 of {payload.records.length.toLocaleString()} records.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {Array.isArray(payload.processing_activities) && payload.processing_activities.length > 0 && (
                                                <div className="mt-4 rounded-lg border border-slate-800 p-3">
                                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Activities requiring attention
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {payload.processing_activities
                                                            .filter((activity) => activity.classification === "uncertain" || activity.consent_dependent)
                                                            .slice(0, 5)
                                                            .map((activity, activityIndex) => (
                                                                <div key={`${activity.type || "activity"}-${activityIndex}`} className="border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                                                                    <p className="text-sm font-medium text-slate-200">
                                                                        {formatMetricLabel(activity.type || "Processing activity")}
                                                                    </p>
                                                                    {activity.reason && (
                                                                        <p className="mt-1 text-sm leading-5 text-slate-400">{activity.reason}</p>
                                                                    )}
                                                                    {activity.page_url && (
                                                                        <p className="mt-1 break-all text-xs text-slate-500">{activity.page_url}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {payload.validation?.warnings?.length > 0 && (
                                                <div className="mt-4 rounded-lg border border-amber-900/70 bg-amber-950/20 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                                                        Review notes
                                                    </p>
                                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-200/80">
                                                        {payload.validation.warnings.slice(0, 5).map((warning, warningIndex) => (
                                                            <li key={warningIndex}>{warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default function SelfCheckScanResult() {
    const navigate = useNavigate();
    const { publicAuditId } = useParams();

    const [technicalResult, setTechnicalResult] = useState(null);
    const [checklistResult, setChecklistResult] = useState(null);

    const [technicalLoading, setTechnicalLoading] = useState(true);
    const [checklistLoading, setChecklistLoading] = useState(true);

    const [technicalError, setTechnicalError] = useState("");
    const [checklistError, setChecklistError] = useState("");

    const [refreshing, setRefreshing] = useState(false);

    const loadResults = async (manual = false) => {
        if (!publicAuditId) {
            setTechnicalError("Public Audit ID is missing.");
            setChecklistError("Public Audit ID is missing.");
            setTechnicalLoading(false);
            setChecklistLoading(false);
            return;
        }

        if (manual) setRefreshing(true);

        setTechnicalLoading(true);
        setChecklistLoading(true);

        setTechnicalError("");
        setChecklistError("");

        const [technicalResponse, checklistResponse] = await Promise.allSettled([
            getCompleteConsentScanResult(publicAuditId),
            getConsentChecklistAssessment(publicAuditId),
        ]);

        if (technicalResponse.status === "fulfilled") {
            setTechnicalResult(technicalResponse.value);
        } else {
            setTechnicalError(
                technicalResponse.reason?.message ||
                "Unable to retrieve technical assessment."
            );
        }

        if (checklistResponse.status === "fulfilled") {
            setChecklistResult(checklistResponse.value);
        } else {
            setChecklistError(
                checklistResponse.reason?.message ||
                "Unable to retrieve checklist assessment."
            );
        }

        setTechnicalLoading(false);
        setChecklistLoading(false);
        setRefreshing(false);
    };


    useEffect(() => {
        loadResults();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicAuditId]);


    const audit = technicalResult?.audit || {};

    return (
        <div className="min-h-screen bg-[#070d1d] text-white">

            <div className="mx-auto max-w-7xl px-4 py-8">

                {/* Header */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <button
                            type="button"
                            onClick={() => navigate("/user/self-check/scans")}
                            className="mb-5 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            <ArrowLeft size={18} />
                            Back to Scans
                        </button>

                        <h1 className="text-2xl font-semibold">
                            Self-Check Scan Results
                        </h1>

                        <p className="mt-2 break-all text-sm text-slate-400">
                            {publicAuditId}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadResults(true)}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0b1324] px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh Results
                    </button>

                </div>


                {/* Scan information */}

                <div className="mb-8 rounded-xl border border-slate-800 bg-[#0b1324] p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Scan Overview
                            </p>

                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Globe size={16} className="text-indigo-400" />
                                <span className="break-all">
                                    {audit.url || "Loading website information..."}
                                </span>
                            </div>

                            {audit.created_at && (
                                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                    <Clock3 size={14} />
                                    Created: {formatDate(audit.created_at)}
                                </p>
                            )}
                        </div>

                        {audit.status && (
                            <StatusBadge status={audit.status} />
                        )}

                    </div>

                </div>


                {/* 01 Checklist first */}

                <div className="mb-10">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                            Section 01
                        </p>

                        <h2 className="mt-1 text-xl font-semibold">
                            Checklist-Based Assessment
                        </h2>
                    </div>

                    <ChecklistAssessment
                        data={checklistResult}
                        error={checklistError}
                        loading={checklistLoading}
                    />
                </div>


                {/* 02 Technical second */}

                <div>
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                            Section 02
                        </p>

                        <h2 className="mt-1 text-xl font-semibold">
                            Technical Assessment
                        </h2>
                    </div>

                    <TechnicalAssessment
                        data={technicalResult}
                        error={technicalError}
                        loading={technicalLoading}
                    />
                </div>


                <div className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
                    Self-Check Consent Scanner · DPACOMPASS
                </div>

            </div>

        </div>
    );
}