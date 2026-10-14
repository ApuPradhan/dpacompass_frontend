export default function UserRow({ user, index, onView, onApprove, onReject }) {
    return (
        <tr className="border-b border-gray-800 hover:bg-[#1e293b] transition">

            {/* Serial No */}
            <td className="px-4 py-3 text-gray-400">
                {index + 1}
            </td>

            <td className="px-4 py-3 font-medium">{user.name}</td>

            <td className="px-4 py-3 text-gray-400">{user.email}</td>

            <td className="px-4 py-3 capitalize">{user.role}</td>

            {/* Status */}
            <td className="px-4 py-3">
                <span
                    className={`px-2 py-1 text-xs rounded-full ${user.status?.toLowerCase() === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : user.status?.toLowerCase() === "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                >
                    {user.status}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">

                    {/* Always show View */}
                    <button
                        onClick={() => onView(user)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                        View
                    </button>

                    {/* Only for pending */}
                    {user.status === "pending" && (
                        <>
                            <button
                                onClick={() => onApprove(user)}
                                className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => onReject(user)}
                                className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                                Reject
                            </button>
                        </>
                    )}

                </div>
            </td>

        </tr>
    );
}