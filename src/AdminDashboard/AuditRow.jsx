export default function AuditRow({ audit, onView }) {


    return (
        <tr className="border-b border-gray-700 hover:bg-[#1e293b]/40">
            <td className="py-3 px-4">{audit.name}</td>
            <td className="py-3 px-4"> {audit.owner || "Not Found"}</td>
            {/* <td className="py-3 px-4">{audit.department}</td> */}
            <td className="py-3 px-4">
                <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border
        ${audit.status === "approved"
                            ? "text-green-400 bg-green-500/20 border-green-500/30"
                            : audit.status === "rejected"
                                ? "text-red-400 bg-red-500/20 border-red-500/30"
                                : "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                        }`}
                >
                    {audit.status}
                </span>
            </td>
            <td className="py-3 px-4 text-center">
                <button
                    onClick={() => onView(audit)}
                    className="text-indigo-400 hover:text-indigo-300"
                >
                    View
                </button>
            </td>
        </tr>
    );
}