import React, { useState } from "react";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    FileText,
    ShieldCheck,
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

/* =========================================================
   RESULT BADGE
========================================================= */

const ResultBadge = ({ result }) => {
    const value = String(result || "").toUpperCase();

    if (value === "PASS") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Pass
            </span>
        );
    }

    if (value === "FAIL") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300">
                <XCircle className="h-4 w-4" />
                Fail
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300">
            <AlertCircle className="h-4 w-4" />
            Review
        </span>
    );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({ label, value, icon: Icon }) => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-5">

            <div className="flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                </p>

                {Icon && (
                    <Icon className="h-5 w-5 text-slate-700" />
                )}

            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-100">
                {value ?? 0}
            </p>

        </div>
    );
};

/* =========================================================
   BOOLEAN CHECK
========================================================= */

const BooleanCheck = ({ label, value }) => {
    const enabled = value === true;

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </p>

            <div className="mt-2 flex items-center gap-2">

                {enabled ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                    <XCircle className="h-4 w-4 text-slate-600" />
                )}

                <span
                    className={
                        enabled
                            ? "text-base font-medium text-emerald-300"
                            : "text-base font-medium text-slate-400"
                    }
                >
                    {enabled ? "Yes" : "No"}
                </span>

            </div>

        </div>
    );
};

/* =========================================================
   ACTIVITY CARD
========================================================= */

const ActivityCard = ({ activity, index }) => {
    const [expanded, setExpanded] = useState(false);

    const collectionPoints = Array.isArray(
        activity?.collection_points
    )
        ? activity.collection_points
        : [];

    const purpose =
        activity?.purpose ||
        "No purpose identified.";

    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">

            {/* =================================================
                HEADER
            ================================================= */}

            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-slate-900/60"
            >

                {/* Number */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-sm font-semibold text-cyan-300">
                    {String(
                        activity?.index ?? index + 1
                    ).padStart(2, "0")}
                </div>

                {/* Activity */}
                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                        <h5 className="text-lg font-semibold text-slate-100">
                            {formatLabel(activity?.type)}
                        </h5>

                        <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                            {formatLabel(
                                activity?.classification
                            )}
                        </span>

                    </div>

                    <div className="mt-2 flex items-center gap-2">

                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                        <span className="truncate text-sm text-slate-500">
                            {activity?.page_url || "—"}
                        </span>

                    </div>

                </div>

                {/* Result */}
                <div className="shrink-0">
                    <ResultBadge
                        result={activity?.result}
                    />
                </div>

                {/* Arrow */}
                <ChevronDown
                    className={
                        expanded
                            ? "h-5 w-5 rotate-180 text-slate-500 transition-transform"
                            : "h-5 w-5 text-slate-500 transition-transform"
                    }
                />

            </button>

            {/* =================================================
                DETAILS
            ================================================= */}

            {expanded && (
                <div className="border-t border-slate-800 p-5">

                    {/* Decision flags */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                        <BooleanCheck
                            label="Consent Requested"
                            value={
                                activity?.consent_requested
                            }
                        />

                        <BooleanCheck
                            label="Optional Processing"
                            value={
                                activity?.optional
                            }
                        />

                        <BooleanCheck
                            label="Necessary Processing"
                            value={
                                activity?.necessary
                            }
                        />

                    </div>

                    {/* Purpose */}
                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                                <FileText className="h-5 w-5 text-indigo-400" />
                            </div>

                            <div>

                                <h6 className="text-base font-semibold text-slate-100">
                                    Processing Purpose
                                </h6>

                                <p className="mt-1 text-sm text-slate-500">
                                    Purpose identified during the audit
                                </p>

                            </div>

                        </div>

                        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">

                            <p className="text-sm leading-6 text-slate-400">
                                {purpose}
                            </p>

                        </div>

                    </div>

                    {/* Assessment */}
                    <div className="mt-5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            </div>

                            <div>

                                <h6 className="text-base font-semibold text-emerald-200">
                                    Assessment
                                </h6>

                                <p className="mt-2 text-sm leading-6 text-emerald-100/60">
                                    {activity?.reason ||
                                        "No assessment reason provided."}
                                </p>

                            </div>

                        </div>

                        {activity?.failure_reason && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">

                                <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                                    Failure Reason
                                </p>

                                <p className="mt-2 text-sm leading-6 text-red-200/70">
                                    {activity.failure_reason}
                                </p>

                            </div>
                        )}

                    </div>

                    {/* Related collection points */}
                    {collectionPoints.length > 0 && (
                        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/30 p-5">

                            <div className="flex items-center justify-between gap-3">

                                <div>

                                    <h6 className="text-base font-semibold text-slate-100">
                                        Related Collection Points
                                    </h6>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Personal-data fields associated
                                        with this activity
                                    </p>

                                </div>

                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                                    {collectionPoints.length}{" "}
                                    {collectionPoints.length === 1
                                        ? "Field"
                                        : "Fields"}
                                </span>

                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                {collectionPoints.map(
                                    (point, pointIndex) => (
                                        <div
                                            key={
                                                point?.name ||
                                                pointIndex
                                            }
                                            className="rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3"
                                        >

                                            <p className="text-sm font-medium text-slate-200">
                                                {point?.name ||
                                                    "Unknown field"}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {formatLabel(
                                                    point?.category
                                                )}{" "}
                                                ·{" "}
                                                {point?.type ||
                                                    "Unknown type"}
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

/* =========================================================
   MAIN STEP 05 VIEW
========================================================= */

const Step05View = ({ data }) => {
    const summary = data?.summary || {};

    const activities = Array.isArray(
        data?.processing_activities
    )
        ? data.processing_activities
        : [];

    return (
        <div className="space-y-6">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

                <SummaryCard
                    label="Activities"
                    value={
                        summary.total_processing_activities
                    }
                    icon={Activity}
                />

                <SummaryCard
                    label="Consent-Dependent"
                    value={
                        summary.consent_dependent
                    }
                    icon={ShieldCheck}
                />

                <SummaryCard
                    label="Necessary"
                    value={
                        summary.necessary_service_processing
                    }
                    icon={CheckCircle2}
                />

                <SummaryCard
                    label="Uncertain"
                    value={summary.uncertain}
                    icon={AlertCircle}
                />

                <SummaryCard
                    label="Passed"
                    value={summary.passed}
                    icon={CheckCircle2}
                />

                <SummaryCard
                    label="Review"
                    value={summary.review_required}
                    icon={AlertCircle}
                />

            </div>

            {/* =================================================
                PROCESSING ACTIVITIES
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/40">

                {/* Section Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <Activity className="h-5 w-5 text-cyan-400" />
                    </div>

                    <div>

                        <h4 className="text-lg font-semibold text-slate-100">
                            Processing Activities
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                            Assessment of observed processing activities
                            against consent dependency
                        </p>

                    </div>

                    <span className="ml-auto rounded-full border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-400">
                        {activities.length}{" "}
                        {activities.length === 1
                            ? "Activity"
                            : "Activities"}
                    </span>

                </div>

                {/* Activity list */}
                <div className="space-y-4 p-4">

                    {activities.map(
                        (activity, index) => (
                            <ActivityCard
                                key={
                                    activity?.index ??
                                    index
                                }
                                activity={activity}
                                index={index}
                            />
                        )
                    )}

                    {activities.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-800 px-6 py-12 text-center">

                            <Activity className="mx-auto h-9 w-9 text-slate-700" />

                            <p className="mt-4 text-base font-medium text-slate-400">
                                No processing activities found
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                No processing activity results were
                                returned for this step.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Step05View;