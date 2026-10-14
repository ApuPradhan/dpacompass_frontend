import { useState } from "react";
import {
    FiChevronDown,
    FiChevronRight,
    FiShield,
    FiSearch,
    FiLink,
} from "react-icons/fi";

export default function ChecklistItem({ item, response, updateResponse, url }) {

    const [open, setOpen] = useState(false);

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case "critical":
                return "text-red-500 bg-red-500/20";
            case "high":
                return "text-orange-400 bg-orange-500/20";
            case "medium":
                return "text-yellow-400 bg-yellow-500/20";
            default:
                return "text-green-400 bg-green-500/20";
        }
    };

    return (
        <div className="border border-gray-700 rounded-xl bg-[#111827] overflow-hidden">

            {/* HEADER */}
            <div
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center p-4 cursor-pointer 
                           hover:bg-[#1e293b] transition-all duration-200"
            >
                <div className="flex items-center gap-3">

                    {/* Violet Icon */}
                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <FiShield size={16} />
                    </div>

                    <div>
                        <p className="text-violet-300 font-medium">
                            {item.rule_id}
                        </p>
                        <p className="text-sm text-gray-400">
                            {item.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityStyle(item.severity)}`}>
                        {item.severity}
                    </span>

                    {open ? <FiChevronDown /> : <FiChevronRight />}
                </div>
            </div>

            {/* BODY */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden
                ${open ? "max-h-125 opacity-100" : "max-h-0 opacity-0"}`}
            >
                <div className="p-4 border-t border-gray-700 space-y-5">

                    {/* Compliance */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-violet-300">
                            <FiShield size={14} />
                            Compliance
                        </label>

                        <select
                            value={response.status || ""}
                            onChange={(e) =>
                                updateResponse(item.rule_id, "status", e.target.value)
                            }
                            className="w-full mt-1 px-3 py-2 bg-[#1e293b] border border-gray-600 rounded focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        >
                            <option value="">Select</option>
                            <option value="compliant">Compliant</option>
                            <option value="non_compliant">Non-Compliant</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>

                    {/* Findings */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-violet-300">
                            <FiSearch size={14} />
                            Findings
                        </label>

                        <textarea
                            value={response.findings || ""}
                            onChange={(e) =>
                                updateResponse(item.rule_id, "findings", e.target.value)
                            }
                            className="w-full mt-1 px-3 py-2 bg-[#1e293b] border border-gray-600 rounded focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>

                    {/* Evidence */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-violet-300">
                            <FiLink size={14} />
                            Evidence
                        </label>

                        <input
                            type="text"
                            placeholder="Paste link or notes"
                            value={response.evidence || ""}
                            onChange={(e) =>
                                updateResponse(item.rule_id, "evidence", e.target.value)
                            }
                            className="w-full mt-1 px-3 py-2 bg-[#1e293b] border border-gray-600 rounded focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                        />
                    </div>

                </div>
            </div>

        </div>
    );
}