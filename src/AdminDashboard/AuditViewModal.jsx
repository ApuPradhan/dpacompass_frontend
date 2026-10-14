import { useState } from "react";
import { primaryBtn, dangerBtn, secondaryBtn } from "../theme";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

export default function AuditViewModal({ audit, onClose, onAssign, assignAudit }) {
    const [showChecklist, setShowChecklist] = useState(false);
    
    if (!audit) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="w-full max-w-3xl bg-[#0f172a]/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">

                    <h2 className="text-xl font-semibold text-indigo-300 mb-4">
                        Audit Details
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-sm">

                        <Detail label="Application Name" value={audit.name} />
                        <Detail label="Owner" value={audit.owner_name || "Not found"} />

                        <Detail label="Department" value={audit.department} />
                        <Detail label="Environment" value={audit.environment} />

                        <Detail label="Version" value={audit.version} />
                        <Detail label="Type" value={`Type ${audit.type}`} />

                        <Detail label="URL" value={audit.url} />

                        <Detail
                            label="Created At"
                            value={new Date(audit.created_at).toLocaleString()}
                        />

                        {/* Full width fields */}
                        <div className="col-span-2">
                            <Detail label="Description" value={audit.description} />
                        </div>

                        <div className="col-span-2">
                            <Detail label="Data Categories" value={audit.data_categories} />
                        </div>

                    </div>
                    {/* COLLAPSIBLE CHECKLIST */}
                    <div className="mt-6 border border-gray-700 rounded-xl overflow-hidden">

                        {/* Header */}
                        <button
                            onClick={() => setShowChecklist(prev => !prev)}
                            className="w-full flex justify-between items-center px-4 py-3 bg-[#020617] hover:bg-[#020617]/70 transition"
                        >
                            <span className="text-sm font-semibold text-indigo-300">
                                Checklist ({audit.checklist?.length || 0})
                            </span>

                            {showChecklist ? <FiChevronDown /> : <FiChevronRight />}
                        </button>

                        {/* Content */}
                        {showChecklist && (
                            <div className="p-4 bg-[#0f172a] border-t border-gray-700 max-h-64 overflow-y-auto">

                                {audit.checklist?.length > 0 ? (
                                    <div className="space-y-3">

                                        {audit.checklist.map(item => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-start bg-[#020617] border border-gray-700 rounded-lg p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {item.rule_id}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                <span className={`text-xs px-2 py-1 rounded
                                ${item.severity === "critical" || "high"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : item.severity === "medium"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : "bg-green-500/20 text-green-400"
                                                    }`}
                                                >
                                                    {item.severity}
                                                </span>
                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        No checklists available
                                    </p>
                                )}

                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        {assignAudit && <button
                            onClick={() => onAssign(audit)}
                            className={primaryBtn}
                        >
                            Assign Auditor
                        </button>}
                        <button onClick={onClose} className={secondaryBtn}>
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

const Detail = ({ label, value }) => (
    <div>
        <p className="text-gray-400">{label}</p>
        <p>{value}</p>
    </div>
);