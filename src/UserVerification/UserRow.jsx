import { FiEye, FiCheck, FiX } from "react-icons/fi";

export default function UserRow({ user, index, onView, onApprove, onReject }) {
    const status = user.status?.toLowerCase();

    const styles = {
        row: "border-b border-slate-100 transition-colors hover:bg-blue-50/60",
        index: "whitespace-nowrap px-5 py-4 text-sm font-semibold tabular-nums text-slate-500",
        name: "text-base font-semibold text-[#14213D]",
        email: "px-5 py-4 text-base text-slate-600",
        role: "inline-flex rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold capitalize text-blue-800",
        status: "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold capitalize",
        actions: "flex flex-wrap items-center justify-center gap-2",
        button: "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1",
    };

    const statusClass =
        status === "approved"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "rejected"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-amber-200 bg-amber-50 text-amber-700";

    return (
        <tr className={styles.row}>
            <td className={styles.index}>{String(index + 1).padStart(2, "0")}</td>
            <td className="px-5 py-4">
                <div className={styles.name}>{user.name}</div>
            </td>
            <td className={styles.email}>{user.email}</td>
            <td className="px-5 py-4">
                <span className={styles.role}>{user.role}</span>
            </td>
            <td className="px-5 py-4">
                <span className={`${styles.status} ${statusClass}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status || "Unknown"}
                </span>
            </td>
            <td className="px-5 py-4">
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => onView(user)}
                        className={`${styles.button} border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 focus:ring-blue-500`}
                    >
                        <FiEye size={16} />
                        View
                    </button>

                    {status === "pending" && (
                        <>
                            <button
                                type="button"
                                onClick={() => onApprove(user)}
                                aria-label={`Approve ${user.name}`}
                                className={`${styles.button} border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`}
                            >
                                <FiCheck size={16} />
                                Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(user)}
                                aria-label={`Reject ${user.name}`}
                                className={`${styles.button} border-rose-200 bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500`}
                            >
                                <FiX size={16} />
                                Reject
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}
