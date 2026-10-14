import { useEffect, useState } from "react";

export default function UserDetailView({
    user,
    onClose,
    onApprove,
    onReject,
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (user) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [user]);

    if (!user) return null;

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sliding Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 z-50
        bg-[#0f172a]/95 border-l border-gray-700 backdrop-blur-lg
        p-6 transform transition-transform duration-300
        ${show ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <h2 className="text-xl font-semibold text-indigo-300 mb-6">
                    User Details
                </h2>

                {/* Content */}
                <div className="space-y-3 text-sm">
                    <DetailItem label="Name" value={user.name} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Role" value={user.role} />
                    <DetailItem label="Status" value={user.status} />
                    <DetailItem label="Organization" value={user.organization} />
                    <DetailItem label="Phone" value={user.phone} />
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">

                    {/* Pending → show both */}
                    {user.status === "pending" && (
                        <>
                            <button
                                onClick={() => onApprove(user)}
                                className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => onReject(user)}
                                className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
                            >
                                Reject
                            </button>
                        </>
                    )}

                    {/* Approved / Rejected → only info */}
                    {user.status !== "pending" && (
                        <span className="text-sm text-gray-400">
                            No actions available
                        </span>
                    )}

                    {/* Close always */}
                    <button
                        onClick={onClose}
                        className="ml-auto px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                    >
                        Close
                    </button>

                </div>
            </div>
        </>
    );
}

/* Reusable field row */
function DetailItem({ label, value }) {
    return (
        <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium capitalize">{value}</span>
        </div>
    );
}