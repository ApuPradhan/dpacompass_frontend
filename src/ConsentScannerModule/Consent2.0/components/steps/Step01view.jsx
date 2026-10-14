import React from "react";
import {
    Database,
    FileText,
    Globe,
    ShieldCheck,
    UserRound,
} from "lucide-react";

const formatLabel = (value) => {
    if (!value) return "—";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ConfidenceBar = ({ value }) => {
    const percentage = Math.round((value || 0) * 100);

    return (
        <div className="w-28">
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                    Confidence
                </span>

                <span className="text-[10px] font-medium text-slate-300">
                    {percentage}%
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const Step01View = ({ data }) => {
    const summary = data?.summary || {};
    const points = data?.collection_points || [];

    const categories = summary.personal_data_categories || {};

    return (
        <div className="space-y-5">
            {/* Overview */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-400" />

                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Pages
                        </span>
                    </div>

                    <p className="mt-2 text-xl font-semibold text-slate-100">
                        {summary.pages_with_personal_data_collection ?? 0}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Pages containing personal-data collection
                    </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-cyan-400" />

                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Collection Points
                        </span>
                    </div>

                    <p className="mt-2 text-xl font-semibold text-slate-100">
                        {summary.personal_data_collection_points ?? 0}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Personal-data fields identified
                    </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />

                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            Categories
                        </span>
                    </div>

                    <p className="mt-2 text-xl font-semibold text-slate-100">
                        {Object.keys(categories).length}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        Personal-data categories detected
                    </p>
                </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40">
                <div className="border-b border-slate-800 px-4 py-3">
                    <h4 className="text-xs font-semibold text-slate-200">
                        Personal Data Categories
                    </h4>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                        Distribution of identified personal-data types
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
                    {Object.entries(categories).map(
                        ([category, count]) => (
                            <div
                                key={category}
                                className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-3"
                            >
                                <p className="text-[11px] text-slate-500">
                                    {formatLabel(category)}
                                </p>

                                <p className="mt-1 text-lg font-semibold text-slate-100">
                                    {count}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Collection points */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40">
                {/* Section Header */}
                <div className="border-b border-slate-800 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                            <UserRound className="h-4.5 w-4.5 text-indigo-400" />
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-100">
                                Identified Collection Points
                            </h4>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Personal-data fields discovered during crawling
                            </p>
                        </div>

                        <span className="ml-auto rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-medium text-indigo-300">
                            {points.length} {points.length === 1 ? "Point" : "Points"}
                        </span>
                    </div>
                </div>

                {/* Collection Point Cards */}
                <div className="space-y-3 p-4">
                    {points.map((point, index) => {
                        const field = point.field || {};
                        const form = point.form || {};
                        const personalData = point.personal_data || {};

                        const confidence = Math.round(
                            (personalData.confidence || 0) * 100
                        );

                        return (
                            <div
                                key={index}
                                className="
                        rounded-xl
                        border
                        border-slate-800
                        bg-slate-950/50
                        p-5
                        transition
                        hover:border-slate-700
                        hover:bg-slate-950/70
                    "
                            >
                                {/* Top row */}
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                    {/* Identity */}
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-indigo-500/20
                                bg-indigo-500/10
                                text-sm
                                font-semibold
                                text-indigo-300
                            ">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h5 className="text-base font-semibold text-slate-100">
                                                    {field.label ||
                                                        field.name ||
                                                        "Unnamed field"}
                                                </h5>

                                                <span className="
                                        rounded-md
                                        border
                                        border-indigo-500/20
                                        bg-indigo-500/10
                                        px-2
                                        py-0.5
                                        text-[10px]
                                        font-medium
                                        text-indigo-300
                                    ">
                                                    {formatLabel(
                                                        personalData.category
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Personal-data collection field
                                            </p>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div className="w-full lg:w-44">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                                                Classification Confidence
                                            </span>

                                            <span className="text-xs font-semibold text-slate-200">
                                                {confidence}%
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{
                                                    width: `${confidence}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Technical details */}
                                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                                    {/* Field */}
                                    <div className="
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-900/60
                            px-3
                            py-3
                        ">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                            Field Name
                                        </p>

                                        <p className="mt-1.5 truncate text-xs font-medium text-slate-200">
                                            {field.name || "—"}
                                        </p>
                                    </div>

                                    {/* Type */}
                                    <div className="
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-900/60
                            px-3
                            py-3
                        ">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                            Field Type
                                        </p>

                                        <p className="mt-1.5 text-xs font-medium text-slate-200">
                                            {field.field_type ||
                                                field.tag ||
                                                "—"}
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <div className="
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-900/60
                            px-3
                            py-3
                        ">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                            Form
                                        </p>

                                        <p className="mt-1.5 truncate text-xs font-medium text-slate-200">
                                            {form.form_id || "—"}
                                        </p>
                                    </div>

                                    {/* Required */}
                                    <div className="
                            rounded-lg
                            border
                            border-slate-800
                            bg-slate-900/60
                            px-3
                            py-3
                        ">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                            Required
                                        </p>

                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${field.required
                                                        ? "bg-emerald-400"
                                                        : "bg-slate-600"
                                                    }`}
                                            />

                                            <span className="text-xs font-medium text-slate-200">
                                                {field.required
                                                    ? "Yes"
                                                    : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional field information */}
                                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

                                    {/* Placeholder */}
                                    {field.placeholder && (
                                        <div className="
                                rounded-lg
                                border
                                border-slate-800
                                bg-slate-900/30
                                px-3
                                py-3
                            ">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                                Placeholder
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-600" />

                                                <p className="text-xs text-slate-400">
                                                    {field.placeholder}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Page */}
                                    {point.page?.url && (
                                        <div className="
                                rounded-lg
                                border
                                border-slate-800
                                bg-slate-900/30
                                px-3
                                py-3
                            ">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                                Collection Page
                                            </p>

                                            <p className="mt-1 truncate text-xs text-slate-400">
                                                {point.page.title ||
                                                    point.page.url}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Step01View;