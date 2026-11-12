
import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Save,
    RotateCcw,
    CheckCircle2,
    Clock
} from "lucide-react";

import EvidenceUploader from "./EvidenceUploader";
import { AUDIT_STATUSES } from "../utils/auditorChecklistUtils";

export default function ChecklistResponseCard({
    item,
    response,
    onChange,
    onSave,
    onClear,
    saving = false,
    isSaved = false,
    isDirty = false
}) {
    const [open, setOpen] = useState(true);

    const checklistId = item.checklist_id;

    const updateField = (field, value) => {
        onChange(checklistId, field, value);
    };

    return (
        <div className="rounded-xl border border-slate-700
            bg-[#0b1220] overflow-hidden">

            {/* CHECKLIST HEADER */}

            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between
                    gap-3 p-4 text-left hover:bg-slate-800/50"
            >
                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                        <span className="text-sm font-semibold text-white">
                            {item.code || item.clause}
                        </span>

                        {isSaved && !isDirty && (
                            <span className="text-xs text-emerald-400
                                flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                Saved
                            </span>
                        )}

                        {isDirty && (
                            <span className="text-xs text-amber-400
                                flex items-center gap-1">
                                <Clock size={13} />
                                Unsaved changes
                            </span>
                        )}

                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                        Version: {item.version || "1.0"}
                    </p>

                </div>

                {open
                    ? <ChevronUp size={19} className="text-slate-400" />
                    : <ChevronDown size={19} className="text-slate-400" />
                }
            </button>

            {open && (
                <div className="border-t border-slate-700 p-4 md:p-5
                    space-y-5">

                    {/* DESCRIPTION */}

                    {item.description && (
                        <div>
                            <h4 className="text-xs font-semibold
                                text-indigo-400 uppercase mb-2">
                                Compliance Requirement
                            </h4>

                            <p className="text-sm text-slate-300 leading-6
                                whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* STATUS */}

                    <div>
                        <label className="block text-sm font-medium
                            text-slate-300 mb-2">
                            Compliance Status
                            <span className="text-red-400 ml-1">*</span>
                        </label>

                        <select
                            value={response.status || ""}
                            onChange={e => updateField("status", e.target.value)}
                            disabled={saving}
                            className="w-full rounded-lg bg-[#111827]
        border border-slate-700 px-3 py-3
        text-sm text-white outline-none
        focus:border-indigo-500"
                        >
                            <option value="">Select status</option>

                            {AUDIT_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COMMENTS */}

                    <div>
                        <label className="block text-sm font-medium
                            text-slate-300 mb-2">
                            Auditor Comments
                        </label>

                        <textarea
                            value={response.comments || ""}
                            onChange={e =>
                                updateField("comments", e.target.value)
                            }
                            disabled={saving}
                            rows={4}
                            placeholder="Enter your observations, findings and recommendations..."
                            className="w-full rounded-lg bg-[#111827]
                                border border-slate-700 px-3 py-3
                                text-sm text-white placeholder-slate-500
                                outline-none resize-y
                                focus:border-indigo-500"
                        />
                    </div>

                    {/* EVIDENCE UPLOADER */}

                    <EvidenceUploader
                        existingEvidence={response.existingEvidence || []}
                        newEvidence={response.newEvidence || []}
                        onChange={files =>
                            updateField("newEvidence", files)
                        }
                        disabled={saving}
                    />

                    {/* ACTIONS */}

                    <div className="flex flex-wrap justify-end gap-3
                        border-t border-slate-800 pt-4">

                        <button
                            type="button"
                            onClick={() => onClear(item)}
                            disabled={saving || !isDirty}
                            className="flex items-center gap-2 px-4 py-2
                                rounded-lg border border-slate-600
                                text-slate-300 hover:bg-slate-800
                                disabled:opacity-40"
                        >
                            <RotateCcw size={15} />
                            Clear Row
                        </button>

                        <button
                            type="button"
                            onClick={() => onSave(item)}
                            disabled={saving || !isDirty}
                            className="flex items-center gap-2 px-4 py-2
                                rounded-lg bg-indigo-600 text-white
                                hover:bg-indigo-500
                                disabled:opacity-40"
                        >
                            <Save size={15} />
                            {saving ? "Saving..." : "Save Response"}
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}
