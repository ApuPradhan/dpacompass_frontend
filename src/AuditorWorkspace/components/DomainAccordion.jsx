
import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    ClipboardList
} from "lucide-react";

import ChecklistResponseCard from "./ChecklistResponseCard";

export default function DomainAccordion({
    domain,
    responses,
    savedResponses,
    onChange,
    onSave,
    onClear,
    isDirty,
    savingId,
    defaultOpen = false
}) {
    const [open, setOpen] = useState(defaultOpen);

    const checklists = domain.checklists || [];
    const total = checklists.length;

    const completed = checklists.filter(item =>
        Boolean(savedResponses[item.checklist_id]?.status)
    ).length;

    const percentage = total
        ? Math.round((completed / total) * 100)
        : 0;

    return (
        <section className="w-full bg-[#111827]
            border border-slate-700 rounded-xl overflow-hidden">

            {/* DOMAIN HEADER */}

            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full p-5 text-left
                    hover:bg-slate-800/40 transition"
            >
                <div className="flex items-start gap-3">

                    <div className="p-2.5 rounded-lg
                        bg-indigo-500/10 text-indigo-400 shrink-0">
                        <ClipboardList size={21} />
                    </div>

                    <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-3">

                            <h3 className="text-sm md:text-base
                                font-semibold text-white">
                                {domain.domain_name}
                            </h3>

                            {open
                                ? <ChevronUp size={19} className="text-slate-400 shrink-0" />
                                : <ChevronDown size={19} className="text-slate-400 shrink-0" />
                            }

                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                            {completed} of {total} saved responses
                        </p>

                        {/* LEFT-ALIGNED DOMAIN PROGRESS */}

                        <div className="mt-4 max-w-md">

                            <div className="flex items-center justify-between
                                text-xs mb-2">
                                <span className="text-slate-400">
                                    Domain progress
                                </span>

                                <span className="text-indigo-400 font-medium">
                                    {percentage}%
                                </span>
                            </div>

                            <div className="h-2 bg-slate-800
                                rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500
                                        rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                        </div>

                    </div>

                </div>
            </button>

            {/* CHECKLIST ITEMS */}

            {open && (
                <div className="border-t border-slate-700
                    p-4 md:p-5 space-y-4">

                    {checklists.map(item => {
                        const id = item.checklist_id;

                        const response = responses[id] || {
                            status: "",
                            comments: "",
                            existingEvidence: [],
                            newEvidence: []
                        };

                        return (
                            <ChecklistResponseCard
                                key={id}
                                item={item}
                                response={response}
                                onChange={onChange}
                                onSave={onSave}
                                onClear={onClear}
                                saving={savingId === id}
                                isSaved={Boolean(
                                    savedResponses[id]?.status
                                )}
                                isDirty={isDirty(id)}
                            />
                        );
                    })}

                </div>
            )}

        </section>
    );
}
