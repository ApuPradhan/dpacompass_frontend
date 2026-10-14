import React from "react";
import {
    CheckCircle2,
    Circle,
    Settings2,
    SlidersHorizontal,
    XCircle,
} from "lucide-react";

/* =========================================================
   STEP 11 VIEW
========================================================= */

const Step11View = ({ data }) => {
    const summary = data?.summary || {};
    const categories = Array.isArray(data?.categories)
        ? data.categories
        : [];

    return (
        <div className="space-y-6">

            {/* =================================================
                INTERFACE STATUS
            ================================================= */}

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-5">

                <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Settings2 className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                        <p className="text-base font-semibold text-emerald-200">
                            Preference Management Interface Found
                        </p>

                        <p className="mt-1 text-sm text-emerald-200/70">
                            The website exposes controls for managing
                            preference categories.
                        </p>
                    </div>

                </div>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* Categories */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Categories
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-slate-100">
                        {summary.categories ?? 0}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Preference categories identified
                    </p>

                </div>

                {/* Known States */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Known States
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-emerald-300">
                        {summary.known_states ?? 0}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Categories with recognized states
                    </p>

                </div>

                {/* Unknown States */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Unknown States
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-amber-300">
                        {summary.unknown_states ?? 0}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Categories requiring further review
                    </p>

                </div>

            </div>

            {/* =================================================
                PREFERENCE CATEGORIES
            ================================================= */}

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">

                {/* Section Header */}
                <div className="border-b border-slate-800 px-5 py-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                            <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                        </div>

                        <div>

                            <h4 className="text-lg font-semibold text-slate-100">
                                Preference Categories
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                                Current selection and changeability state
                            </p>

                        </div>

                        <span className="ml-auto rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300">
                            {categories.length}{" "}
                            {categories.length === 1
                                ? "Category"
                                : "Categories"}
                        </span>

                    </div>
                </div>

                {/* =================================================
                    CATEGORY LIST
                ================================================= */}

                <div className="divide-y divide-slate-800">

                    {categories.map((category, index) => {

                        const passed =
                            String(category?.result || "")
                                .toLowerCase() === "pass";

                        const selected =
                            category?.selected === true;

                        const changeable =
                            category?.changeable === true;

                        return (
                            <div
                                key={
                                    category?.index ??
                                    index
                                }
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    px-5
                                    py-5
                                    transition
                                    hover:bg-slate-900/30
                                    lg:flex-row
                                    lg:items-center
                                    lg:justify-between
                                "
                            >

                                {/* =================================
                                    CATEGORY NAME
                                ================================= */}

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-lg
                                            ${
                                                selected
                                                    ? "bg-indigo-500/10"
                                                    : "bg-slate-800/60"
                                            }
                                        `}
                                    >
                                        {selected ? (
                                            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-slate-500" />
                                        )}
                                    </div>

                                    <div>

                                        <p className="text-base font-semibold text-slate-100">
                                            {category?.label ||
                                                "Unnamed Category"}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Category #
                                            {category?.index ??
                                                index + 1}
                                        </p>

                                    </div>

                                </div>

                                {/* =================================
                                    CATEGORY DETAILS
                                ================================= */}

                                <div className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-3
                                    lg:min-w-130
                                    lg:grid-cols-3
                                ">

                                    {/* State */}
                                    <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">

                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            State
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            {selected ? (
                                                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-slate-600" />
                                            )}

                                            <p
                                                className={
                                                    selected
                                                        ? "text-sm font-semibold text-indigo-300"
                                                        : "text-sm font-medium text-slate-400"
                                                }
                                            >
                                                {selected
                                                    ? "Selected"
                                                    : "Not Selected"}
                                            </p>

                                        </div>
                                    </div>

                                    {/* Changeable */}
                                    <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">

                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Changeable
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            {changeable ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-slate-600" />
                                            )}

                                            <p
                                                className={
                                                    changeable
                                                        ? "text-sm font-semibold text-emerald-300"
                                                        : "text-sm font-medium text-slate-400"
                                                }
                                            >
                                                {changeable
                                                    ? "Yes"
                                                    : "No"}
                                            </p>

                                        </div>
                                    </div>

                                    {/* Result */}
                                    <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">

                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Result
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">

                                            {passed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-400" />
                                            )}

                                            <p
                                                className={
                                                    passed
                                                        ? "text-sm font-semibold text-emerald-300"
                                                        : "text-sm font-semibold text-red-300"
                                                }
                                            >
                                                {category?.result ||
                                                    "—"}
                                            </p>

                                        </div>
                                    </div>

                                </div>

                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <div className="px-6 py-12 text-center">

                            <SlidersHorizontal className="mx-auto h-9 w-9 text-slate-700" />

                            <p className="mt-4 text-base font-medium text-slate-400">
                                No preference categories found
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                No preference-management categories
                                were returned for this audit step.
                            </p>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Step11View;