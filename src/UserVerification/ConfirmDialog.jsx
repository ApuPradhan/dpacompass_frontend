import { useEffect, useState } from "react";

export default function ConfirmDialog({
    open,
    actionType,
    user,
    onConfirm,
    onCancel,
}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [open]);

    if (!open) return null;

    const isApprove = actionType === "approve";

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onCancel}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className={`w-full max-w-md
          bg-[#0f172a]/95 border border-gray-700 backdrop-blur-lg
          rounded-xl p-6 shadow-lg
          transform transition-all duration-300
          ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                >
                    {/* Title */}
                    <h2
                        className={`text-lg font-semibold mb-3 ${isApprove ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        Confirm {actionType}
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-300">
                        Are you sure you want to{" "}
                        <span
                            className={`font-medium ${isApprove ? "text-green-400" : "text-red-400"
                                }`}
                        >
                            {actionType}
                        </span>{" "}
                        <span className="font-semibold text-white">
                            {user?.name}
                        </span>
                        ?
                    </p>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">

                        <button
                            onClick={onCancel}
                            className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            className={`px-3 py-2 rounded-lg text-sm ${isApprove
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                }`}
                        >
                            Yes, {actionType}
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}