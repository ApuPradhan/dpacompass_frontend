import React from "react";
import {
    CheckCircle2,
    FileImage,
    FileText,
    FormInput,
    ShieldCheck,
} from "lucide-react";

const Step04View = ({ data }) => {
    const step = data?.step_04 || data || {};
    const summary = step?.summary || {};
    const forms = step?.forms || [];
    const validation = step?.validation || {};

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                    ["Forms", summary.total_forms],
                    [
                        "Collection Points",
                        summary.total_collection_points,
                    ],
                    ["Completed", summary.completed_forms],
                    ["Partial", summary.partial_forms],
                    ["Failed", summary.failed_forms],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 px-5 py-5"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {label}
                        </p>

                        <p className="mt-1.5 text-3xl font-semibold text-slate-100">
                            {value ?? 0}
                        </p>
                    </div>
                ))}
            </div>

            {/* Forms */}
            {forms.map((item, index) => {
                const form = item.form || {};
                const evidence = item.evidence || {};

                return (
                    <div
                        key={item.form_index ?? index}
                        className="rounded-lg border border-slate-800 bg-slate-900/40"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                                    <FormInput className="h-5 w-5 text-indigo-400" />
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-slate-100">
                                        Form {item.form_index}
                                    </h4>

                                    <p className="mt-0.5 text-sm text-slate-400">
                                        {form.id || "Unnamed form"}
                                    </p>
                                </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                {item.status || "Completed"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                            {/* Form details */}
                            <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-400" />

                                    <span className="text-base font-semibold text-slate-100">
                                        Form Details
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Form ID
                                        </p>

                                        <p className="mt-1 text-base text-slate-300">
                                            {form.id || "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Action
                                        </p>

                                        <p className="mt-1 break-all text-base text-slate-300">
                                            {form.action || "—"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Method
                                            </p>

                                            <p className="mt-1 text-base text-slate-300">
                                                {form.method || "—"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Collection Points
                                            </p>

                                            <p className="mt-1 text-base text-slate-300">
                                                {item.collection_points_count ??
                                                    0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Evidence status */}
                            <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <FileImage className="h-5 w-5 text-cyan-400" />

                                    <span className="text-base font-semibold text-slate-100">
                                        Evidence Captured
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
                                        <span className="text-sm text-slate-400">
                                            Form visual evidence
                                        </span>

                                        <span className="text-sm font-semibold text-emerald-300">
                                            {evidence.form_screenshot
                                                ? "Captured"
                                                : "Not Available"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
                                        <span className="text-sm text-slate-400">
                                            Notice evidence
                                        </span>

                                        <span className="text-sm font-semibold text-emerald-300">
                                            {evidence.notice_screenshots
                                                ?.length
                                                ? `${evidence.notice_screenshots.length} captured`
                                                : "Not Available"}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-500">
                                        Visual evidence is available to the
                                        audit backend but is not displayed in
                                        this result view.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Validation */}
            <div
                className={`rounded-lg border px-4 py-3 ${validation.valid
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck
                        className={`h-4 w-4 ${validation.valid
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                    />

                    <span className="text-base font-semibold text-slate-100">
                        Validation
                    </span>

                    <span className="ml-auto text-sm font-medium text-slate-300">
                        {validation.valid
                            ? "Valid"
                            : "Requires Attention"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Step04View;