import React from "react";
import {
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Image as ImageIcon,
    ExternalLink,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

const EvidenceSection = ({ evidence = [] }) => {
    if (!Array.isArray(evidence) || evidence.length === 0) {
        return null;
    }

    return (
        <section>
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />

                <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                        Evidence
                    </h4>

                    <p className="mt-0.5 text-xs text-slate-500">
                        Evidence identified during the audit
                    </p>
                </div>
            </div>

            {/* Evidence Items */}
            <div className="mt-3 space-y-3">
                {evidence.map((item, index) => (
                    <EvidenceItem
                        key={item.id || index}
                        evidence={item}
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
};

/* =========================================================
   EVIDENCE ITEM
========================================================= */

const EvidenceItem = ({ evidence, index }) => {
    const status = evidence.status || "pending";

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-950/30 overflow-hidden">
            {/* Evidence Header */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-300">
                            {evidence.collectionPoint?.collection_point?.field?.label ||
                                `Evidence ${index + 1}`}
                        </p>

                        {evidence.type && (
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {formatLabel(evidence.type)}
                            </p>
                        )}
                    </div>
                </div>

                <StatusBadge
                    status={status}
                    size="sm"
                />
            </div>

            {/* Evidence Content */}
            <div className="p-4">
                {evidence.summary && (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Assessment
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            {evidence.summary}
                        </p>
                    </div>
                )}

                {/* Evidence Details */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidence.visible !== undefined && (
                        <EvidenceProperty
                            label="Visible"
                            value={evidence.visible ? "Yes" : "No"}
                        />
                    )}

                    {evidence.verified !== undefined && (
                        <EvidenceProperty
                            label="Verified"
                            value={evidence.verified ? "Yes" : "No"}
                        />
                    )}

                    {evidence.timing && (
                        <EvidenceProperty
                            label="Timing"
                            value={formatLabel(evidence.timing)}
                        />
                    )}

                    {evidence.data_relevance !== undefined && (
                        <EvidenceProperty
                            label="Data Relevance"
                            value={
                                evidence.data_relevance
                                    ? "Relevant"
                                    : "Not identified"
                            }
                        />
                    )}
                </div>

                {/* Screenshot */}
                {evidence.screenshot && (
                    <ScreenshotEvidence
                        screenshot={evidence.screenshot}
                    />
                )}

                {/* Screenshot URL / Path */}
                {evidence.screenshot_url && (
                    <a
                        href={evidence.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <ImageIcon className="h-3.5 w-3.5" />
                        View screenshot
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>
        </div>
    );
};

/* =========================================================
   SCREENSHOT
========================================================= */

const ScreenshotEvidence = ({ screenshot }) => {
    const screenshotUrl =
        typeof screenshot === "string"
            ? screenshot
            : screenshot?.url || screenshot?.path;

    if (!screenshotUrl) {
        return null;
    }

    return (
        <div className="mt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Screenshot Evidence
            </p>

            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                <img
                    src={screenshotUrl}
                    alt="Audit evidence"
                    className="max-h-105 w-full object-contain"
                />
            </div>
        </div>
    );
};

/* =========================================================
   PROPERTY
========================================================= */

const EvidenceProperty = ({ label, value }) => (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
            {label}
        </p>

        <p className="mt-1 text-xs font-medium text-slate-300">
            {value}
        </p>
    </div>
);

/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (value) => {
    if (!value) return "";

    return value
        .toString()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default EvidenceSection;