import React from "react";
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    FileText,
    Languages,
    Link2,
    XCircle,
} from "lucide-react";


/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatus = (status) => {
    const normalized = String(status || "")
        .toLowerCase()
        .replace(/-/g, "_")
        .replace(/ /g, "_");

    if (
        normalized === "pass" ||
        normalized === "compliant" ||
        normalized === "sufficient"
    ) {
        return {
            label: "Compliant",
            icon: CheckCircle2,
            classes:
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        };
    }

    if (
        normalized === "fail" ||
        normalized === "failed" ||
        normalized === "non_compliant"
    ) {
        return {
            label: "Non-Compliant",
            icon: XCircle,
            classes:
                "border-red-500/20 bg-red-500/10 text-red-300",
        };
    }

    return {
        label: "Partial",
        icon: AlertCircle,
        classes:
            "border-amber-500/20 bg-amber-500/10 text-amber-300",
    };
};

const StatusBadge = ({ status }) => {
    const config = getStatus(status);
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${config.classes}`}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
};

const DetailItem = ({
    label,
    value,
    positive,
    negative,
}) => {
    return (
        <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                {label}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5">
                {positive && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}

                {negative && (
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}

                <span
                    className={`text-xs font-medium ${positive
                        ? "text-emerald-300"
                        : negative
                            ? "text-red-300"
                            : "text-slate-200"
                        }`}
                >
                    {value ?? "—"}
                </span>
            </div>
        </div>
    );
};

const SummaryCard = ({
    label,
    value,
    valueClass = "text-slate-100",
}) => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                {label}
            </p>

            <p className={`mt-1.5 text-xl font-semibold ${valueClass}`}>
                {value ?? 0}
            </p>
        </div>
    );
};

/* =========================================================
   STEP 02
========================================================= */

const Step02View = ({ data }) => {
    const summary = data?.summary || {};
    const points = data?.collection_points || [];
    return (
        <div className="space-y-5">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                <SummaryCard
                    label="Collection Points"
                    value={summary.total_collection_points}
                />

                <SummaryCard
                    label="Sufficient Evidence"
                    value={
                        summary.collection_points_with_sufficient_evidence
                    }
                    valueClass="text-emerald-300"
                />

                <SummaryCard
                    label="Partial Evidence"
                    value={
                        summary.collection_points_with_partial_evidence
                    }
                    valueClass="text-amber-300"
                />

                <SummaryCard
                    label="Insufficient"
                    value={
                        summary.collection_points_with_insufficient_evidence
                    }
                />

                <SummaryCard
                    label="Without Notice"
                    value={
                        summary.collection_points_without_notice
                    }
                />

                <SummaryCard
                    label="Notices Found"
                    value={summary.notices_found}
                />
            </div>
            {/* =================================================
                COLLECTION POINT VERIFICATION
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/40">

                {/* Section Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                        <FileText className="h-4 w-4 text-indigo-400" />
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-100">
                            Collection Point Verification
                        </h4>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Privacy notice presence and timing for each
                            personal-data collection point
                        </p>
                    </div>

                    <span className="ml-auto rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-slate-400">
                        {points.length}{" "}
                        {points.length === 1 ? "Point" : "Points"}
                    </span>
                </div>

                {/* =================================================
                    POINT LIST
                ================================================= */}

                <div className="space-y-4 p-4">

                    {points.map((point, index) => {
                        const collection =
                            point.collection_point || {};

                        const field =
                            collection.field || {};

                        const form =
                            collection.form || {};

                        const notice =
                            point.notice || point.notice_candidates?.[0] || {};

                        const timing =
                            point.timing || {};

                        const evidence =
                            point.evidence || {};

                        return (
                            <div
                                key={point.index ?? index}
                                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50"
                            >

                                {/* ---------------------------------
                                    POINT HEADER
                                --------------------------------- */}

                                <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <h5 className="text-base font-semibold text-slate-100">
                                                {field.label ||
                                                    field.name ||
                                                    "Collection Point"}
                                            </h5>

                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-slate-500">
                                                    {field.name || "—"}
                                                </span>

                                                <span className="text-slate-700">
                                                    ·
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {form.id ||
                                                        "No form ID"}
                                                </span>

                                                {collection.category && (
                                                    <>
                                                        <span className="text-slate-700">
                                                            ·
                                                        </span>

                                                        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[9px] font-medium text-indigo-300">
                                                            {formatLabel(
                                                                collection.category
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <StatusBadge
                                        status={point.status}
                                    />
                                </div>

                                {/* ---------------------------------
                                    NOTICE + TIMING
                                --------------------------------- */}

                                <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">

                                    {/* NOTICE */}
                                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="mb-5 flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                                                <FileText className="h-4 w-4 text-indigo-400" />
                                            </div>

                                            <div>
                                                <h6 className="text-sm font-semibold text-slate-100">
                                                    Privacy Notice
                                                </h6>

                                                <p className="mt-0.5 text-[10px] text-slate-500">
                                                    Notice identified at the
                                                    collection point
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">

                                            <DetailItem
                                                label="Found"
                                                value={
                                                    notice.notices_found
                                                        ? "Yes"
                                                        : "No"
                                                }
                                                positive={
                                                    notice.found
                                                }
                                                negative={
                                                    !notice.found
                                                }
                                            />

                                            <DetailItem
                                                label="Visible"
                                                value={
                                                    notice.visible
                                                        ? "Yes"
                                                        : "No"
                                                }
                                                positive={
                                                    notice.visible
                                                }
                                                negative={
                                                    !notice.visible
                                                }
                                            />

                                            <DetailItem
                                                label="Notice Type"
                                                value={formatLabel(
                                                    notice.type
                                                )}
                                            />

                                            <DetailItem
                                                label="Consent Control"
                                                value={
                                                    notice.is_consent_control
                                                        ? "Yes"
                                                        : "No"
                                                }
                                            />
                                        </div>

                                        {notice.text && (
                                            <div className="mt-5">

                                                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                                    Notice Content
                                                </p>

                                                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                                                    <p className="text-xs leading-5 text-slate-400">
                                                        {notice.text}
                                                    </p>
                                                </div>

                                            </div>
                                        )}

                                        {notice.url && (
                                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-950/50 px-3 py-2.5">

                                                <Link2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />

                                                <span className="truncate text-[10px] text-indigo-300">
                                                    {notice.url}
                                                </span>

                                            </div>
                                        )}

                                    </div>
                                    {/* NOTICE LANGUAGE */}
                                    {notice.language && (
                                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                                            <div className="mb-5 flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                                                    <Languages className="h-4 w-4 text-violet-400" />
                                                </div>

                                                <div>
                                                    <h6 className="text-sm font-semibold text-slate-100">
                                                        Notice Language
                                                    </h6>

                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        Language detected from the notice
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="grid grid-cols-2 gap-5">

                                                <DetailItem
                                                    label="Language"
                                                    value={
                                                        notice.language
                                                            ? `${notice.language}${notice.language_code
                                                                ? ` (${notice.language_code})`
                                                                : ""
                                                            }`
                                                            : "—"
                                                    }
                                                />

                                                <DetailItem
                                                    label="Script"
                                                    value={notice.language_script || "—"}
                                                />

                                                <DetailItem
                                                    label="Confidence"
                                                    value={
                                                        typeof notice.language_confidence === "number"
                                                            ? `${(
                                                                notice.language_confidence * 100
                                                            ).toFixed(2)}%`
                                                            : "—"
                                                    }
                                                />

                                                <DetailItem
                                                    label="Detection Method"
                                                    value={formatLabel(
                                                        notice.language_detection_method
                                                    )}
                                                />

                                            </div>
                                        </div>
                                    )}
                                    {/* TIMING */}
                                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="mb-5 flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                                                <Clock3 className="h-4 w-4 text-cyan-400" />
                                            </div>

                                            <div>
                                                <h6 className="text-sm font-semibold text-slate-100">
                                                    Notice Timing
                                                </h6>

                                                <p className="mt-0.5 text-[10px] text-slate-500">
                                                    Timing and association
                                                    verification
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">

                                            <DetailItem
                                                label="Timing"
                                                value={formatLabel(
                                                    timing.timing
                                                )}
                                            />

                                            <DetailItem
                                                label="Verified"
                                                value={
                                                    timing.verified
                                                        ? "Yes"
                                                        : "No"
                                                }
                                                positive={
                                                    timing.verified
                                                }
                                                negative={
                                                    !timing.verified
                                                }
                                            />

                                            <DetailItem
                                                label="Visible"
                                                value={
                                                    timing.visible
                                                        ? "Yes"
                                                        : "No"
                                                }
                                                positive={
                                                    timing.visible
                                                }
                                                negative={
                                                    !timing.visible
                                                }
                                            />

                                            <DetailItem
                                                label="Associated"
                                                value={
                                                    timing.associated_with_collection_point
                                                        ? "Yes"
                                                        : "No"
                                                }
                                                positive={
                                                    timing.associated_with_collection_point
                                                }
                                                negative={
                                                    !timing.associated_with_collection_point
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* ---------------------------------
                                    AUDIT FINDING
                                --------------------------------- */}

                                <div className="px-5 pb-5">

                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                                <AlertCircle className="h-4 w-4 text-amber-400" />
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h6 className="text-xs font-semibold text-amber-200">
                                                        Audit Finding
                                                    </h6>

                                                    <StatusBadge
                                                        status={
                                                            evidence.status ||
                                                            point.status
                                                        }
                                                    />

                                                </div>

                                                <p className="mt-2 text-xs leading-5 text-amber-100/60">
                                                    {evidence.summary ||
                                                        "No evidence assessment was provided for this collection point."}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {points.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-800 px-6 py-12 text-center">

                            <FileText className="mx-auto h-8 w-8 text-slate-700" />

                            <p className="mt-3 text-sm font-medium text-slate-400">
                                No collection points found
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                No personal-data collection points were
                                returned for this audit step.
                            </p>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Step02View;