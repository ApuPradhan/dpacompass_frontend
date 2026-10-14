
import { useState } from "react";
import { FiEye, FiChevronRight, FiChevronDown } from "react-icons/fi";
export default function DynamicAuditRow({ audit, columns, onView, customActions, expandableContent }) {
    
    const [expanded, setExpanded] = useState(false);
    return (
        <tr className="border-b border-gray-700 hover:bg-[#1e293b]/40">

            {columns.map((col) => (
                <td key={col.key} className="py-3 px-4">

                    {/* Custom render (if provided) */}
                    {col.render
                        ? col.render(audit[col.key], audit)
                        : audit[col.key] ?? "—"
                    }

                </td>
            ))}

            {/* Actions */}
            {!customActions && (
                <td className="py-3 px-4 text-center">
                    <button
                        onClick={() => onView(audit)}
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        <FiEye size={18} />
                    </button>
                </td>
            )}

            <td className="py-3 px-4 text-center">
                {customActions
                    ? customActions(audit)
                    : (
                        <button
                            onClick={() => onView(audit)}
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            View
                        </button>
                    )
                }
            </td>
        </tr>
    );
}