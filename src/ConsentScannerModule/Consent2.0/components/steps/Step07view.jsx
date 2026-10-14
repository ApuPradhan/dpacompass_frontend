import React from "react";
import {
    CheckCircle2,
    Circle,
    CircleAlert,
    ToggleLeft,
} from "lucide-react";

const Step07View = ({ data }) => {
    const summary = data?.summary || {};
    const controls = data?.controls || [];

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Checked
                    </p>

                    <p className="mt-1.5 text-3xl font-semibold text-slate-100">
                        {summary.checked ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Optional controls currently selected
                    </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Unchecked
                    </p>

                    <p className="mt-1.5 text-3xl font-semibold text-slate-100">
                        {summary.unchecked ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Optional controls not selected
                    </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Review Required
                    </p>

                    <p className="mt-1.5 text-3xl font-semibold text-slate-100">
                        {summary.review ?? 0}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Controls requiring manual review
                    </p>
                </div>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

                    <div>
                        <p className="text-base font-semibold text-amber-200">
                            Optional consent controls
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-200/70">
                            Optional consent controls should not be
                            pre-selected when presented to the user.
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
                <div className="border-b border-slate-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <ToggleLeft className="h-4 w-4 text-indigo-400" />

                        <div>
                            <h4 className="text-base font-semibold text-slate-100">
                                Consent Controls
                            </h4>

                            <p className="mt-0.5 text-sm text-slate-400">
                                Pre-selection status detected by the crawler
                            </p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-800">
                    {controls.map((control, index) => {
                        const passed =
                            String(control.result || "")
                                .toLowerCase() === "pass";

                        return (
                            <div
                                key={control.index ?? index}
                                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                            control.checked
                                                ? "bg-amber-500/10"
                                                : "bg-slate-800/60"
                                        }`}
                                    >
                                        {control.checked ? (
                                            <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-slate-500" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-base font-medium text-slate-200">
                                            {control.label}
                                        </p>

                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Control #{control.index}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`text-sm font-medium ${
                                            control.checked
                                                ? "text-amber-300"
                                                : "text-slate-500"
                                        }`}
                                    >
                                        {control.checked
                                            ? "Pre-selected"
                                            : "Not selected"}
                                    </span>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm font-medium ${
                                            passed
                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                                : "border-red-500/20 bg-red-500/10 text-red-300"
                                        }`}
                                    >
                                        {passed ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                        ) : (
                                            <CircleAlert className="h-3 w-3" />
                                        )}

                                        {passed ? "PASS" : "FAIL"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Step07View;