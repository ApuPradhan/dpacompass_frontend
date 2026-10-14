import React, { useMemo, useState } from "react";
import {
    CheckCircle2,
    AlertCircle,
    FileJson,
    Download,
    Eye,
    X,
    Copy,
    Check,
    ShieldCheck,
} from "lucide-react";
import StatusBadge from "../StatusBadge";

const Step13View = ({ data }) => {
    const [showJson, setShowJson] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!data) {
        return (
            <div className="text-sm text-slate-400">
                No STEP-13 result available.
            </div>
        );
    }

    const records = Array.isArray(data.records) ? data.records : [];
    const summary = data.summary || {};
    const validation = data.validation || {};

    /*
     * A record is considered attention-worthy if the backend
     * identifies it as personal-data-related or unknown.
     *
     * This can later be replaced by an explicit backend field
     * such as record.classification or record.requires_review.
     */
    const attentionRecords = useMemo(() => {
        return records.filter((record) => {
            if (!record || typeof record !== "object") {
                return false;
            }

            const classification = String(
                record.classification ||
                record.category ||
                record.status ||
                ""
            ).toLowerCase();

            return (
                record.personal_data_related === true ||
                record.requires_review === true ||
                record.unknown === true ||
                classification.includes("personal") ||
                classification.includes("unknown") ||
                classification.includes("review")
            );
        });
    }, [records]);

    /*
     * Download/preview should only be available when there
     * is something that requires auditor attention.
     */
    const evidenceAvailable =
        attentionRecords.length > 0 ||
        Number(summary.personal_data_related || 0) > 0 ||
        Number(summary.unknown || 0) > 0;

    const jsonContent = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonContent);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Unable to copy JSON:", error);
        }
    };

    const handleDownload = () => {
        if (!evidenceAvailable) return;

        const blob = new Blob([jsonContent], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "step-13-browser-storage-evidence.json";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            {data.title || "Browser Storage & Cookies"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Collection of cookies and browser storage before consent.
                        </p>
                    </div>

                    <StatusBadge status={data.status} />
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                    <SummaryCard
                        label="Total Records"
                        value={summary.total ?? records.length}
                    />

                    <SummaryCard
                        label="Personal Data Related"
                        value={summary.personal_data_related ?? 0}
                        emphasis="warning"
                    />

                    <SummaryCard
                        label="Unknown"
                        value={summary.unknown ?? 0}
                        emphasis="warning"
                    />

                    <SummaryCard
                        label="Non-Personal"
                        value={summary.non_personal ?? 0}
                        emphasis="success"
                    />

                </div>

                {/* Evidence */}
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                            <FileJson className="h-5 w-5 text-indigo-400" />
                        </div>

                        <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                <div>
                                    <h4 className="text-base font-semibold text-white">
                                        Evidence
                                    </h4>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Raw browser-storage evidence collected during the audit.
                                    </p>
                                </div>

                                {evidenceAvailable && (
                                    <div className="flex shrink-0 gap-2">

                                        <button
                                            type="button"
                                            onClick={() => setShowJson(true)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-500 hover:bg-slate-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Preview JSON
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download JSON
                                        </button>

                                    </div>
                                )}

                            </div>

                            {evidenceAvailable ? (
                                <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3">

                                    <FileJson className="h-5 w-5 text-slate-400" />

                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            browser_storage.json
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {records.length} records captured
                                        </p>
                                    </div>

                                </div>
                            ) : (
                                <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">

                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                                    <div>
                                        <p className="text-sm font-medium text-emerald-300">
                                            All captured records are clean
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            No browser-storage records were identified as
                                            requiring auditor review. Evidence preview and
                                            download are therefore unavailable.
                                        </p>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Findings */}
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-5">

                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-indigo-400" />

                        <div>
                            <h4 className="text-base font-semibold text-white">
                                Collection Findings
                            </h4>

                            <p className="text-sm text-slate-400">
                                Summary of the browser-storage inspection.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">

                        <FindingRow
                            label="Records collected"
                            value={summary.total ?? records.length}
                        />

                        <FindingRow
                            label="Non-personal records"
                            value={summary.non_personal ?? 0}
                        />

                        <FindingRow
                            label="Potential personal-data records"
                            value={summary.personal_data_related ?? 0}
                            warning={Number(summary.personal_data_related || 0) > 0}
                        />

                        <FindingRow
                            label="Records requiring classification"
                            value={summary.unknown ?? 0}
                            warning={Number(summary.unknown || 0) > 0}
                        />

                    </div>
                </div>

                {/* Validation */}
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-5">

                    <div className="flex items-center gap-3">
                        {validation.valid ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        )}

                        <div>
                            <h4 className="text-base font-semibold text-white">
                                Validation
                            </h4>

                            <p className="text-sm text-slate-400">
                                STEP-13 evidence validation result.
                            </p>
                        </div>
                    </div>

                    {validation.errors?.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            {validation.errors.map((error, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
                                >
                                    {String(error)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-400">
                            No validation errors were reported.
                        </p>
                    )}

                </div>
            </div>

            {/* JSON Preview */}
            {showJson && evidenceAvailable && (
                <JsonPreviewModal
                    json={jsonContent}
                    copied={copied}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onClose={() => setShowJson(false)}
                />
            )}
        </>
    );
};


/* ------------------------------------------------------------- */
/* Summary Card                                                   */
/* ------------------------------------------------------------- */

const SummaryCard = ({ label, value, emphasis }) => {

    const valueClass =
        emphasis === "warning"
            ? "text-amber-300"
            : emphasis === "success"
                ? "text-emerald-300"
                : "text-white";

    return (
        <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4">

            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {label}
            </p>

            <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>
                {value}
            </p>

        </div>
    );
};


/* ------------------------------------------------------------- */
/* Finding Row                                                    */
/* ------------------------------------------------------------- */

const FindingRow = ({ label, value, warning }) => (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-0">

        <span className="text-sm text-slate-400">
            {label}
        </span>

        <span
            className={
                warning
                    ? "text-sm font-semibold text-amber-300"
                    : "text-sm font-semibold text-slate-200"
            }
        >
            {value}
        </span>

    </div>
);


/* ------------------------------------------------------------- */
/* JSON Preview Modal                                             */
/* ------------------------------------------------------------- */

const JsonPreviewModal = ({
    json,
    copied,
    onCopy,
    onDownload,
    onClose,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

        <div className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

                <div className="flex items-center gap-3">
                    <FileJson className="h-5 w-5 text-indigo-400" />

                    <div>
                        <h3 className="text-base font-semibold text-white">
                            browser_storage.json
                        </h3>

                        <p className="text-xs text-slate-500">
                            Raw STEP-13 evidence
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Close JSON preview"
                >
                    <X className="h-5 w-5" />
                </button>

            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-end gap-2 border-b border-slate-800 px-5 py-3">

                <button
                    type="button"
                    onClick={onCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
                >
                    <Download className="h-4 w-4" />
                    Download
                </button>

            </div>

            {/* JSON */}
            <div className="min-h-0 flex-1 overflow-auto bg-[#0b1120] p-5">

                <pre className="font-mono text-xs leading-6 text-slate-300">
                    {json}
                </pre>

            </div>

        </div>
    </div>
);

export default Step13View;