import { FiEye, FiCheck, FiX } from "react-icons/fi";

export default function UserRow({ user, index, onView, onApprove, onReject }) {
    const status = user.status?.toLowerCase();

    const statusClass =
        status === "approved"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : status === "rejected"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300";

    return (
        <tr className="border-b border-slate-700/60 transition-colors hover:bg-[#1a2942]">
            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">
                {String(index + 1).padStart(2, "0")}
            </td>
            <td className="px-5 py-4">
                <div className="font-semibold text-slate-100">{user.name}</div>
            </td>
            <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
            <td className="px-5 py-4">
                <span className="inline-flex rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-sm font-medium capitalize text-slate-200">
                    {user.role}
                </span>
            </td>
            <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusClass}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status || "Unknown"}
                </span>
            </td>
            <td className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => onView(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300/50 hover:bg-indigo-500/20"
                    >
                        <FiEye size={15} />
                        View
                    </button>

                    {status === "pending" && (
                        <>
                            <button
                                type="button"
                                onClick={() => onApprove(user)}
                                aria-label={`Approve ${user.name}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                                <FiCheck size={15} />
                                Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(user)}
                                aria-label={`Reject ${user.name}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                            >
                                <FiX size={15} />
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
