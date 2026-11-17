
export default function AuditRow({ audit, onView }) {

    const statusStyles = {
        approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
        rejected: "bg-red-50 text-red-800 border-red-200",
        pending: "bg-amber-50 text-amber-800 border-amber-300"
    };

    const status = audit.status?.toLowerCase();

    const statusClass =
        status === "approved"
            ? statusStyles.approved
            : status === "rejected"
                ? statusStyles.rejected
                : statusStyles.pending;

    const dotClass =
        status === "approved"
            ? "bg-emerald-600"
            : status === "rejected"
                ? "bg-red-600"
                : "bg-amber-500";

    return (
        <tr className="
            bg-white border-b border-slate-200
            hover:bg-blue-50/70
            transition-colors duration-200
        ">

            <td className="
                py-4 px-5
                text-base font-semibold text-[#173B70]
            ">
                {audit.name}
            </td>

            <td className="
                py-4 px-5
                text-base font-medium text-slate-700
            ">
                {audit.owner || "Not Found"}
            </td>
            {/* 
            <td className="py-4 px-5">
                <span className={`
                    inline-flex items-center
                    px-3.5 py-1.5
                    text-sm font-semibold
                    rounded-full border capitalize
                    ${statusClass}
                `}>
                    <span className={`h-2 w-2 rounded-full mr-2 ${dotClass}`} />
                    {audit.status}
                </span>
            </td> */}

            <td className="py-4 px-5 text-center">
                <button
                    type="button"
                    onClick={() => onView(audit)}
                    className="
                       inline-flex items-center justify-center
                        px-4 py-2 rounded-lg
                        text-base font-semibold
                        text-blue-700
                        hover:bg-blue-600 hover:text-white
                        cursor-pointer
                        transition-all duration-200
                        focus:outline-none focus:ring-2
                        focus:ring-blue-300
                    "
                >
                    View
                </button>
            </td>

        </tr>
    );
}
