// RejectedAuditViewModal.jsx (Part 1)

import { useState } from "react";
import { FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";

const RejectedAuditViewModal = ({ audit, onClose }) => {
    const [openChecklist, setOpenChecklist] = useState(null);

    if (!audit) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#0f172a] w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-700 p-6 text-white">

                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-indigo-300">{audit.name}</h2>
                    <button onClick={onClose}><FiX size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <p className="text-gray-400">Auditor</p>
                        <p>{audit.auditor_name}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-red-400 font-medium">Rejected</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-gray-400">Application URL</p>
                        <p className="break-all">{audit.url}</p>
                    </div>
                </div>

                <div className="mb-6 rounded-lg border border-red-600/40 bg-red-500/10 p-4">
                    <h3 className="text-red-400 font-semibold mb-2">Rejection Reason</h3>
                    <p className="text-red-300 whitespace-pre-wrap">{audit.rejection_reason || audit.remarks || "No rejection reason provided."}</p>
                </div>

                {audit.domains?.map((domain, dIndex) => (
                    <div key={domain.domain_id} className="bg-[#020617] border border-gray-800 rounded-lg p-4 mb-5">

                        <h3 className="text-indigo-300 font-semibold mb-3">
                            {dIndex + 1}. {domain.domain_name}
                        </h3>

                        {domain.checklists?.map((chk, cIndex) => (
                            <div key={chk.id} className="mb-3">

                                <div onClick={() => setOpenChecklist(openChecklist === chk.id ? null : chk.id)} className="flex justify-between items-center cursor-pointer px-3 py-2 bg-[#0f172a] rounded-lg border border-gray-700 hover:bg-[#1e293b]">

                                    <div className="flex items-center gap-2">

                                        {openChecklist === chk.id ? <FiChevronDown /> : <FiChevronRight />}

                                        <div>
                                            <p>{dIndex + 1}.{cIndex + 1} {chk.clause}</p>
                                            <p className="text-xs text-gray-400">Version : {chk.version}</p>
                                        </div>

                                    </div>

                                </div>

                                {openChecklist === chk.id && (
                                    <div className="mt-2 bg-[#020617] border border-gray-800 rounded-lg p-4 space-y-4">

                                        {chk.evidence?.map((ev, eIndex) => (
                                            <div key={ev.mapping_id} className="space-y-2">

                                                <div className="flex justify-between">

                                                    <span className="text-indigo-300">
                                                        {dIndex + 1}.{cIndex + 1}.{eIndex + 1} {ev.name}
                                                    </span>

                                                    <span className={`px-2 py-1 rounded text-xs ${ev.severity === "high" ? "bg-red-500/20 text-red-400" : ev.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                                                        {ev.severity}
                                                    </span>

                                                </div>
                                                {ev.field_type === "text" && (
                                                    <input value={ev.value || ""} readOnly className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm cursor-not-allowed" />
                                                )}

                                                {ev.field_type === "textarea" && (
                                                    <textarea value={ev.value || ""} readOnly rows={4} className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm resize-none cursor-not-allowed" />
                                                )}

                                                {ev.field_type === "number" && (
                                                    <input type="number" value={ev.value || ""} readOnly className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm cursor-not-allowed" />
                                                )}

                                                {ev.field_type === "boolean" && (
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={Boolean(ev.value)} readOnly disabled />
                                                        <span className="text-gray-400 text-sm">{ev.value ? "Yes" : "No"}</span>
                                                    </div>
                                                )}

                                                {ev.field_type === "file" && (
                                                    ev.value ?
                                                        <a href={ev.value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">
                                                            View Uploaded File
                                                        </a>
                                                        :
                                                        <div className="px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-gray-500 text-sm">
                                                            No file uploaded
                                                        </div>
                                                )}

                                                {ev.field_type === "scanner_result" && (
                                                    <div className="rounded-lg border border-gray-700 bg-[#111827] p-3">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-gray-400">Scanner</span>
                                                            <span className="text-indigo-300">{ev.scanner?.scanner_name || ev.scanner?.scanner_key || "Scanner"}</span>
                                                        </div>
                                                        <div className="text-sm whitespace-pre-wrap text-gray-300">
                                                            {ev.value || "No scanner result available"}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        ))}

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                ))}

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RejectedAuditViewModal;