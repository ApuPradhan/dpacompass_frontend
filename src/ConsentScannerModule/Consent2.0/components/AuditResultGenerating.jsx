import React, { useEffect, useState } from "react";
import {
    CheckCircle2,
    FileCheck2,
    Loader2,
    Sparkles,
} from "lucide-react";

const AuditResultGenerating = ({
    onComplete,
}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((previous) => {
                const next = previous + Math.floor(
                    Math.random() * 8 + 3
                );

                if (next >= 100) {
                    clearInterval(interval);

                    setTimeout(() => {
                        onComplete?.();
                    }, 700);

                    return 100;
                }

                return next;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [onComplete]);

    const completed = progress >= 100;

    return (
        <div className="flex min-h-[520px] items-center justify-center">

            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">

                {/* Animated icon */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">

                    {completed ? (
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    ) : (
                        <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                            <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-indigo-300" />
                        </div>
                    )}

                </div>

                {/* Heading */}
                <h2 className="mt-7 text-2xl font-semibold text-slate-100">
                    {completed
                        ? "Audit Results Ready"
                        : "Generating Audit Results"}
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-base leading-7 text-slate-400">
                    {completed
                        ? "The audit findings have been processed and the compliance results are ready to review."
                        : "Processing the completed audit findings and preparing the compliance assessment."}
                </p>

                {/* Processing items */}
                <div className="mx-auto mt-8 max-w-md space-y-3 text-left">

                    <ProcessingItem
                        completed={progress >= 25}
                        active={
                            progress < 25
                        }
                        text="Processing audit findings"
                    />

                    <ProcessingItem
                        completed={progress >= 50}
                        active={
                            progress >= 25 &&
                            progress < 50
                        }
                        text="Analyzing compliance results"
                    />

                    <ProcessingItem
                        completed={progress >= 75}
                        active={
                            progress >= 50 &&
                            progress < 75
                        }
                        text="Preparing compliance summary"
                    />

                    <ProcessingItem
                        completed={progress >= 100}
                        active={
                            progress >= 75 &&
                            progress < 100
                        }
                        text="Finalizing audit report"
                    />

                </div>

                {/* Progress */}
                <div className="mt-8">

                    <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                            Preparing results
                        </span>

                        <span className="font-semibold text-indigo-300">
                            {progress}%
                        </span>

                    </div>

                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">

                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                            }}
                        />

                    </div>

                </div>

            </div>
        </div>
    );
};

const ProcessingItem = ({
    completed,
    active,
    text,
}) => {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">

            {completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : active ? (
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            ) : (
                <FileCheck2 className="h-5 w-5 text-slate-700" />
            )}

            <span
                className={
                    completed
                        ? "text-sm font-medium text-slate-300"
                        : active
                        ? "text-sm font-medium text-slate-200"
                        : "text-sm text-slate-600"
                }
            >
                {text}
            </span>

        </div>
    );
};

export default AuditResultGenerating;